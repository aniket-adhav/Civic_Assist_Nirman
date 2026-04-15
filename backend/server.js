import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { configureCloudinary } from './config/cloudinary.js';
import { connectDB } from './config/db.js';
import { seedDB } from './seed.js';
import authRoutes from './routes/auth.js';
import issueRoutes from './routes/issues.js';
import adminRoutes from './routes/admin.js';

// ✅ FIX: Proper absolute path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ LOAD ENV (guaranteed correct path)
dotenv.config({ path: path.join(__dirname, "../.env") });
configureCloudinary();


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.BACKEND_PORT || 3001;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Backend running on :${PORT}`));

  // Run seed in background so auth/api requests are available immediately.
  seedDB().catch((err) => {
    console.error('Seed job failed:', err.message);
  });
}

start();