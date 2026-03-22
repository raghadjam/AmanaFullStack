import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

// --- TYPE DEFINITIONS ---
interface UploadAreaProps { onExtract: (text: string) => void; darkMode: boolean; }
interface FlashcardsProps { cards: string[]; onFlip: () => void; }
interface QuizProps { quizBlocks: QuizItem[]; onSubmit: (correctCount: number, wrongItems: string[]) => void; }
interface StudyPlanProps { plan: string; }
interface QuizItem {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
}

// --- COMPONENTS ---

// UploadArea
const UploadArea: React.FC<UploadAreaProps> = ({ onExtract, darkMode }) => {
  const [fileContent, setFileContent] = useState('');
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/upload', { method: 'POST', body: formData });
      const data = await resp.json();
      const text = data.text || '';
      setFileContent(text);
      onExtract(text);
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`space-y-4 p-6 border border-purple-300 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-100 to-purple-50'}`}>
      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-purple-800'}`}>1. Input Material</h2>
      <textarea
        rows={8}
        value={fileContent}
        onChange={(e) => { setFileContent(e.target.value); onExtract(e.target.value); }}
        placeholder="Paste your study material..."
        className={`w-full p-4 border rounded-xl focus:ring-purple-400 focus:border-purple-400 resize-none shadow-inner
          ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-300' : 'bg-white text-gray-900 border-purple-300'}`}
      />
      <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload}
        className={`mt-2 font-medium ${darkMode ? 'text-white' : 'text-purple-700'}`} />
    </div>
  );
};

// Flashcards
const Flashcards: React.FC<FlashcardsProps> = ({ cards, onFlip }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedIndexes, setFlippedIndexes] = useState<Set<number>>(new Set());
  if (cards.length === 0) return null;

  const [question, answer] = cards[currentIndex].split('::').map(s => s.trim());

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!flippedIndexes.has(currentIndex)) {
      setFlippedIndexes(prev => new Set(prev).add(currentIndex));
      onFlip();
    }
  };

  const handleNext = () => { setCurrentIndex((prev) => (prev + 1) % cards.length); setIsFlipped(false); };
  const handlePrev = () => { setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length); setIsFlipped(false); };

  return (
    <div className="mt-8 space-y-4 p-6 border border-purple-300 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg">
      <h2 className="text-xl font-bold text-purple-800">2. Flashcards ({flippedIndexes.size}/{cards.length})</h2>
      <div onClick={handleFlip} className="w-full h-52 cursor-pointer perspective">
        <div className="relative w-full h-full transition-transform duration-500"
             style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          <div className="absolute w-full h-full flex items-center justify-center bg-purple-600 text-white rounded-2xl shadow-xl p-6 text-center text-2xl font-semibold"
               style={{ backfaceVisibility: 'hidden' }}>{question}</div>
          <div className="absolute w-full h-full flex items-center justify-center bg-white text-purple-800 border-2 border-purple-600 rounded-2xl shadow-xl p-6 text-center text-xl font-medium"
               style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>{answer}</div>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mt-2">
        <button onClick={handlePrev} className="px-5 py-2 bg-purple-200 rounded-full hover:bg-purple-300">&larr; Prev</button>
        <button onClick={handleFlip} className="px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700">
          {isFlipped ? 'Show Question' : 'Flip Card'}
        </button>
        <button onClick={handleNext} className="px-5 py-2 bg-purple-200 rounded-full hover:bg-purple-300">Next &rarr;</button>
      </div>
    </div>
  );
};

// Quiz with Submit
const Quiz: React.FC<QuizProps> = ({ quizBlocks, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (quizBlocks.length === 0) return null;

  const handleAnswerChange = (id: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [id]: answer }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongItems: string[] = [];
    quizBlocks.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
      else wrongItems.push(q.question);
    });
    onSubmit(correctCount, wrongItems);
  };

  return (
    <div className="mt-8 p-6 border border-purple-300 rounded-2xl bg-white shadow-lg">
      <h2 className="text-xl font-bold text-purple-800">3. Quiz</h2>
      {quizBlocks.map((q, idx) => (
        <div key={q.id} className="p-3 border-b last:border-b-0">
          <p className="font-semibold text-purple-700">{idx + 1}. {q.question}</p>
          {(['A','B','C','D'] as const).map(opt => (
            <label key={opt} className="block cursor-pointer mt-1 text-purple-800">
              <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt}
                     onChange={() => handleAnswerChange(q.id, opt)} className="mr-2 accent-purple-600"/>
              {opt}) {q.options[opt]}
            </label>
          ))}
        </div>
      ))}
      <div className="text-center mt-4">
        <button onClick={handleSubmit} className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700">
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

// StudyPlan - Card version
const StudyPlan: React.FC<StudyPlanProps> = ({ plan }) => {
  if (!plan) return null;

  // Parse JSON safely in case it's a string
  let planData: { item: string; steps: string[] }[] = [];
  try {
    const parsed = typeof plan === 'string' ? JSON.parse(plan) : plan;
    planData = parsed.plan || [];
  } catch (err) {
    console.error('Failed to parse plan JSON', err);
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">Personalized Study Plan</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {planData.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 transition-colors">
            <h3 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">{item.item}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {item.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// DailyGoals
const DailyGoals: React.FC<{
  flashcardsDone: number;
  questionsDone: number;
  totalFlashcards: number;
  totalQuestions: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  setGoalFlashcards: (val: number) => void;
  setGoalQuestions: (val: number) => void;
  goalFlashcards: number;
  goalQuestions: number;
}> = ({ flashcardsDone, questionsDone, totalFlashcards, totalQuestions, darkMode, setDarkMode, setGoalFlashcards, setGoalQuestions, goalFlashcards, goalQuestions }) => {
  const totalDone = flashcardsDone + questionsDone;
  const totalGoal = goalFlashcards + goalQuestions;
  const progress = totalGoal ? Math.min(100, (totalDone / totalGoal) * 100) : 0;

  return (
    <div className={`p-6 rounded-2xl shadow-lg space-y-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Daily Goals</h2>
        <button onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-700">
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <div>
        <label className="block font-semibold">Flashcards to review:</label>
        <input type="number" min={0} value={goalFlashcards} onChange={e => setGoalFlashcards(Number(e.target.value))}
               className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-purple-500
                 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-300' : 'bg-white text-gray-900 border-gray-300'}`}/>
      </div>
      <div>
        <label className="block font-semibold">Questions to solve:</label>
        <input type="number" min={0} value={goalQuestions} onChange={e => setGoalQuestions(Number(e.target.value))}
               className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-purple-500
                 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-300' : 'bg-white text-gray-900 border-gray-300'}`}/>
      </div>
      <div className="mt-4">
        <label className="font-semibold">Progress:</label>
        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mt-1">
          <div className="h-4 bg-purple-600 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="mt-1 text-sm">{Math.round(progress)}% complete</p>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [materialText, setMaterialText] = useState('');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState<string[]>([]);
  const [quizBlocks, setQuizBlocks] = useState<QuizItem[]>([]);
  const [plan, setPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [flashcardsDone, setFlashcardsDone] = useState(0);
  const [questionsDone, setQuestionsDone] = useState(0);
  const [goalFlashcards, setGoalFlashcards] = useState(0);
  const [goalQuestions, setGoalQuestions] = useState(0);

  const handleExtracted = useCallback((text: string) => {
    setMaterialText(text);
    setSummary('');
    setFlashcards([]);
    setQuizBlocks([]);
    setPlan('');
    setFlashcardsDone(0);
    setQuestionsDone(0);
  }, []);

  const handleProcess = async () => {
    if (!materialText) return;
    setIsProcessing(true);

    const sendRequest = async (): Promise<any> => {
      const resp = await axios.post('/process', { text: materialText });
      return resp.data.output;
    };

    const safeParseJSON = (str: string) => {
      try { return JSON.parse(str); } catch (err) {
        console.warn('Invalid JSON, attempting fix...', err);
        let fixed = str.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/(\r?\n|\r)/g, ' ');
        try { return JSON.parse(fixed); } catch (e) { return { summary: '', flashcards: [], quiz: [] }; }
      }
    };

    try {
      let output = await sendRequest();
      let jsonOutput = safeParseJSON(output);

      if (!jsonOutput || (!jsonOutput.summary && !jsonOutput.flashcards && !jsonOutput.quiz)) {
        output = await sendRequest();
        jsonOutput = safeParseJSON(output);
      }

      setSummary(jsonOutput.summary || '');
      setFlashcards(jsonOutput.flashcards?.map((f: any) => `${f.question}::${f.answer}`) || []);
      setQuizBlocks(
        jsonOutput.quiz?.map((q: any, idx: number) => ({
          id: `q${idx}-${Math.random()}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })) || []
      );
    } catch (err) {
      console.error('Processing failed after retry:', err);
      setSummary('Error processing material. Check console and server logs.');
      setFlashcards([]);
      setQuizBlocks([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuizSubmit = (correctCount: number, wrongItems: string[]) => {
    setQuestionsDone(prev => prev + correctCount);
    handlePlan(wrongItems);
  };

  const handlePlan = async (wrongItems: string[]) => {
    if (!wrongItems.length) {
      setPlan('All correct! No study plan needed.');
      return;
    }
    setPlan('Generating study plan...');
    try {
      const resp = await axios.post('/plan', { wrongItems });
      setPlan(resp.data.plan || 'No plan received.');
    } catch (err) { console.error(err); setPlan('Error generating plan.'); }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-gradient-to-b from-purple-50 to-purple-100 text-gray-900'} min-h-screen p-4 sm:p-8 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center py-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg transition-colors duration-500">
          <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-400">📚 StudyBoost AI</h1>
          <p className="mt-2 text-purple-500 dark:text-purple-300">Generate summaries, flashcards, quizzes, and study plans.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <UploadArea onExtract={handleExtracted} darkMode={darkMode} />
            <div className="text-center mt-4">
              <button onClick={handleProcess} disabled={isProcessing || !materialText}
                      className="px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:opacity-50">
                {isProcessing ? 'Processing...' : 'Generate Study Tools'}
              </button>
            </div>
          </div>

          <div className="md:w-80">
            <DailyGoals
              flashcardsDone={flashcardsDone}
              questionsDone={questionsDone}
              totalFlashcards={flashcards.length}
              totalQuestions={quizBlocks.length}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              setGoalFlashcards={setGoalFlashcards}
              setGoalQuestions={setGoalQuestions}
              goalFlashcards={goalFlashcards}
              goalQuestions={goalQuestions}
            />
          </div>
        </div>

        {summary && (
          <div className="p-6 rounded-2xl shadow-lg transition-colors duration-500" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <h2 className="text-2xl font-bold" style={{ color: darkMode ? '#d1d5db' : '#6b21a8' }}>Summary</h2>
            <pre className="whitespace-pre-wrap p-3 rounded-xl" style={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6', color: darkMode ? '#f9fafb' : '#111827' }}>
              {summary}
            </pre>
          </div>
        )}

        {flashcards.length > 0 && <Flashcards cards={flashcards} onFlip={() => setFlashcardsDone(prev => prev + 1)} />}
        {quizBlocks.length > 0 && <Quiz quizBlocks={quizBlocks} onSubmit={handleQuizSubmit} />}
        {plan && <StudyPlan plan={plan} />}
      </div>

      <footer className="text-center py-6 mt-8 font-medium">
        &copy; {new Date().getFullYear()} StudyBoost AI — Keep Learning, Stay Sharp!
      </footer>
    </div>
  );
};

// --- RENDER ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
