import express from 'express';
import path from 'path';
import uploadRoutes from './src/routes/upload';
import aiRoutes from './src/routes/aiProcess';
import planRoutes from './src/routes/studyPlan';
import 'dotenv/config'; // automatically loads .env

const app = express();
app.use(express.json());

// --- API routes ---
app.use('/upload', uploadRoutes);
app.use('/process', aiRoutes);
app.use('/plan', planRoutes);

// --- Serve frontend (Vite build output) ---
const frontendPath = path.join(__dirname, 'dist'); // <-- use dist, not public
app.use(express.static(frontendPath));

// SPA fallback: send index.html for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
