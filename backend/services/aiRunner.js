import { spawn } from 'child_process';
import fs from 'fs';
import fsPromises from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_SCRIPT = path.join(__dirname, '../../ai_engine/server.py');
const AI_ENGINE_DIR = path.join(__dirname, '../../ai_engine');

function resolvePythonBin() {
  if (process.env.AI_PYTHON_BIN) return process.env.AI_PYTHON_BIN;
  const candidates = [
    path.join(__dirname, '../../ai_engine/.venv/Scripts/python.exe'),
    path.join(__dirname, '../../ai_engine/.venv/bin/python'),
    path.join(__dirname, '../../.pythonlibs/bin/python'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || 'python';
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

class AIPersistentServer extends EventEmitter {
  constructor() {
    super();
    this.proc = null;
    this.ready = false;
    this.buffer = '';
    this.pendingRequests = [];
    this.starting = false;
    this.restartTimer = null;
  }

  start() {
    if (this.starting || (this.proc && !this.proc.killed)) return;
    this.starting = true;
    this.ready = false;

    const pythonBin = resolvePythonBin();
    console.log('[AI Server] Starting persistent AI process…');

    this.proc = spawn(pythonBin, [SERVER_SCRIPT], {
      cwd: AI_ENGINE_DIR,
      windowsHide: true,
    });

    this.proc.stdout.on('data', (chunk) => {
      this.buffer += chunk.toString();
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const msg = JSON.parse(trimmed);
          if (msg.status === 'ready') {
            this.ready = true;
            this.starting = false;
            console.log('[AI Server] Ready — models loaded');
            this._flushPending();
            return;
          }
          const pending = this.pendingRequests.shift();
          if (pending) pending.resolve(msg);
        } catch (e) {
          console.warn('[AI Server] Non-JSON stdout:', trimmed);
        }
      }
    });

    this.proc.stderr.on('data', (chunk) => {
      const text = chunk.toString().trim();
      if (text) console.log('[AI Server]', text);
    });

    this.proc.on('error', (err) => {
      console.error('[AI Server] Process error:', err.message);
      this._rejectAll(err);
      this._scheduleRestart();
    });

    this.proc.on('close', (code) => {
      console.warn(`[AI Server] Process exited (code ${code})`);
      this.ready = false;
      this.starting = false;
      if (this.pendingRequests.length > 0) {
        this._rejectAll(new Error('AI process exited'));
      }
      this._scheduleRestart();
    });
  }

  _scheduleRestart() {
    if (this.restartTimer) return;
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      this.start();
    }, 3000);
  }

  _flushPending() {
    for (const req of [...this.pendingRequests]) {
      if (this.ready && this.proc && !this.proc.killed) {
        this.proc.stdin.write(JSON.stringify(req.payload) + '\n');
      }
    }
  }

  _rejectAll(err) {
    const reqs = this.pendingRequests.splice(0);
    for (const req of reqs) req.reject(err);
  }

  analyze(payload) {
    return new Promise((resolve, reject) => {
      const entry = { payload, resolve, reject };
      this.pendingRequests.push(entry);

      if (this.ready && this.proc && !this.proc.killed) {
        this.proc.stdin.write(JSON.stringify(payload) + '\n');
      } else if (!this.starting && (!this.proc || this.proc.killed)) {
        this.start();
      }
    });
  }
}

const aiServer = new AIPersistentServer();
aiServer.start();

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

    const result = await aiServer.analyze({
      description: description || '',
      category: toAiCategory(category),
      image_path: tempImagePath,
    });

    if (result?.error) {
      console.warn('AI server returned error:', result.error);
    }

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
    console.error('AI runner failed:', err.message);
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
