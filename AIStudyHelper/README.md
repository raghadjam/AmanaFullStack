

# StudyBoost AI

**Description:**
An AI-powered study assistant that helps students efficiently learn by generating summaries, flashcards, quizzes, and personalized study plans from their notes. Developed as the final project for the Amana Bootcamp.

---

## Features

* **Material Processing:** Upload notes in PDF, DOCX, or TXT formats, or paste text directly.
* **Summaries:** Automatically generates concise 3–6 sentence summaries of your material.
* **Flashcards:** Creates interactive flashcards to reinforce key concepts.
* **Quizzes:** Generates multiple-choice quizzes to test your understanding.
* **Personalized Study Plan:** Suggests focused study steps based on quiz performance.
* **Progress Tracking:** Monitors completion of questions and flashcards with a dynamic progress bar.
* **Dark Mode:** Toggle between light and dark themes for a comfortable study experience.

---
## Deployed App
https://studyboostai.onrender.com/


## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/raghadjam/StudyBoostAi.git
```

2. Install dependencies:

```bash
cd StudyBoostAi/app
npm install
```

3. Add your environment variables:
   Create a `.env` file with:

```
GEMINI_API_KEY=your_google_genai_api_key
PORT=5000
```

4. Start the development server:

```bash
npm run dev
```

---

## Usage

1. Upload or paste your study material.
2. Click **“Generate Study Tools”**.
3. Review the generated summary, flashcards, and quiz.
4. Submit the quiz to calculate your correct answers.
5. Receive a personalized study plan based on your performance.

---

## Tech Stack

* **Frontend:** React, TailwindCSS, Vite
* **Backend:** Node.js, Express
* **AI Integration:** Google Gemini AI (via `@google/genai`)
* **File Processing:** PDF and DOCX extraction

---

## Project Notes

This project was completed as the **final project for the Amana Bootcamp**, demonstrating the ability to integrate AI services, create interactive learning tools, and build a full-stack web application.

---
