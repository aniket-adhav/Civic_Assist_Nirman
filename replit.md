# CivicAssist

A civic engagement platform for reporting and tracking community issues (road damage, streetlights, garbage, etc.) with AI-driven moderation.

## Architecture

- **Frontend**: React 18 + Vite, Tailwind CSS, shadcn/ui — served on port **5000**
- **Backend**: Node.js + Express — served on port **3001** (proxied via Vite at `/api`)
- **Database**: MongoDB (Mongoose)
- **Image uploads**: Cloudinary
- **Auth**: Phone-based OTP (no JWT — uses simple session token `CIVIC_ADMIN` for admin)
- **AI Engine**: Python (PyTorch, CLIP, Transformers) via CLI scripts in `ai_engine/`

## Project Structure

```
src/               React frontend (components, screens, context, admin)
backend/           Express API (routes, models, controllers, services)
  server.js        Entry point — connects MongoDB, registers routes, seeds DB
  config/          db.js (Mongoose), cloudinary.js
  routes/          auth.js, issues.js, admin.js
  models/          Issue.js, Officer.js, User.js
  seed.js          Seeds sample issues and officers on startup
ai_engine/         Python AI scripts (text + image moderation)
ai_service/        FastAPI wrapper for AI models
public/            Static assets
```

## Environment Secrets Required

| Secret | Purpose |
|--------|---------|
| `MONGODB_URI` | MongoDB connection string (must start with `mongodb://` or `mongodb+srv://`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Development

```bash
npm install
npm run dev        # Runs backend (port 3001) + Vite frontend (port 5000) concurrently
```

## Deployment

- **Target**: Autoscale
- **Build**: `npm run build`
- **Run**: `node backend/server.js & npx serve dist -l 5000 -s`
