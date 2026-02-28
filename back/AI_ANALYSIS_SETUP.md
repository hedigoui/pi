# AI Analysis Setup (Free – Groq only)

The **"Get AI feedback"** button uses **Groq** (free tier) for:

1. **Speech-to-text** – Groq Whisper (`whisper-large-v3-turbo`)
2. **Scoring** – Groq Llama (fluency, pronunciation, pace, confidence, content structure)

You only need **one API key** (`GROQ_API_KEY`). Hugging Face is no longer used (their free Whisper endpoint returns 410 Gone).

---

## Step 1: Get a Groq API key

1. Go to [console.groq.com](https://console.groq.com) and sign up (free, no card).
2. Open **API Keys**: [console.groq.com/keys](https://console.groq.com/keys).
3. Click **Create API Key**, name it (e.g. `pi-analysis`), create.
4. Copy the key (starts with `gsk_...`).

---

## Step 2: Add to backend `.env`

In the **back** folder, open or create `.env` and add:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

(You can remove `HUGGINGFACE_TOKEN` / `HF_TOKEN` if you had them – they are no longer used.)

---

## Step 3: Restart the backend

```bash
cd back
npm run start:dev
```

---

## Usage

1. As a **student**, go to **Practice**.
2. **Record** or **Upload** audio.
3. Select that session in the dropdown.
4. Click **Get AI feedback**.
5. Wait a few seconds. Transcript and scores will appear.

---

## Limits (Groq free tier)

- **Transcription:** 25 MB max file size; supported: webm, mp3, wav, m4a, ogg, etc.
- **Chat (scoring):** Rate limits apply (see [Groq rate limits](https://console.groq.com/docs/rate-limits)).

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `GROQ_API_KEY is not set` | Add `GROQ_API_KEY` to `back/.env` and restart. |
| `Transcription failed (413)` | Audio file too large (max 25 MB on free tier). Use a shorter recording. |
| `Session has no audio` | Record or upload audio for that session first. |
