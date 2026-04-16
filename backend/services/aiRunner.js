import { spawn } from 'child_process';
import fs from 'fs';
import fsPromises from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, '../../ai_engine/main.py');

function resolvePythonBin() {
  if (process.env.AI_PYTHON_BIN) return process.env.AI_PYTHON_BIN;

  const candidates = [
    path.join(__dirname, '../../ai_engine/.venv/Scripts/python.exe'),
    path.join(__dirname, '../../ai_engine/.venv/bin/python'),
    path.join(__dirname, '../../.pythonlibs/bin/python'),
  ];

  const localVenv = candidates.find((candidate) => fs.existsSync(candidate));
  return localVenv || 'python';
}

const AI_CATEGORY_MAP = {
  road: 'Road',
  streetlight: 'Electricity',
  electricity: 'Electricity',
  water: 'Water',
  sewage: 'Water',
  garbage: 'Waste',
  noise: 'Other',
  park: 'Other',
  other: 'Other',
};

function toAiCategory(category) {
  return AI_CATEGORY_MAP[category] || 'Other';
}

async function writeTempImage(buffer, mimeType = 'image/jpeg') {
  const extension = mimeType?.includes('png') ? '.png' : '.jpg';
  const filePath = path.join(os.tmpdir(), `civic-ai-${randomUUID()}${extension}`);
  await fsPromises.writeFile(filePath, buffer);
  return filePath;
}

async function downloadImageToTemp(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Image fetch failed (${res.status})`);
  const arr = await res.arrayBuffer();
  const mimeType = res.headers.get('content-type') || 'image/jpeg';
  return writeTempImage(Buffer.from(arr), mimeType);
}

const AI_ENGINE_DIR = path.join(__dirname, '../../ai_engine');

function runPython(inputPayload) {
  return new Promise((resolve, reject) => {
    const pythonBin = resolvePythonBin();
    const python = spawn(pythonBin, [SCRIPT_PATH, JSON.stringify(inputPayload)], {
      windowsHide: true,
      cwd: AI_ENGINE_DIR,
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    python.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    python.on('error', (err) => reject(err));

    python.on('close', () => {
      try {
        const lines = (stdout || '').trim().split('\n');
        const jsonLine = lines.reverse().find(l => l.trim().startsWith('{'));
        if (!jsonLine) throw new Error('No JSON line found in output');
        const parsed = JSON.parse(jsonLine.trim());
        if (parsed?.error) {
          console.warn('AI python returned error:', parsed.error);
        }
        resolve(parsed);
      } catch {
        console.error('AI stdout:', stdout);
        console.error('AI stderr:', stderr);
        reject(new Error(`Invalid AI response. stderr: ${stderr || 'none'}`));
      }
    });
  });
}

export async function runAIAnalysis({ description, category, imageBuffer, imageMimeType, imageUrl }) {
  let tempImagePath = null;
  try {
    if (imageBuffer) {
      tempImagePath = await writeTempImage(imageBuffer, imageMimeType);
    } else if (imageUrl) {
      try {
        tempImagePath = await downloadImageToTemp(imageUrl);
      } catch (err) {
        console.warn(`AI image download failed, continuing without image: ${err.message}`);
      }
    }

    const result = await runPython({
      description: description || '',
      category: toAiCategory(category),
      image_path: tempImagePath,
    });

    const finalScore = Number(result?.fake_score ?? 0.5);
    const authenticity = finalScore < 0.5 ? 'fake' : 'real';

    return {
      textScore: Number(result?.text_score ?? 0.5),
      imageScore: Number(result?.image_score ?? 0.5),
      finalScore,
      authenticity,
      isSpam: authenticity === 'fake',
    };
  } catch (err) {
    console.error('Local AI runner failed:', err.message);
    return {
      textScore: 0.5,
      imageScore: 0.5,
      finalScore: 0.5,
      authenticity: 'unknown',
      isSpam: false,
    };
  } finally {
    if (tempImagePath) {
      await fsPromises.unlink(tempImagePath).catch(() => {});
    }
  }
}
