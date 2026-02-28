/**
 * Shared constants for practice-session module (Groq AI, MongoDB GridFS).
 */

export const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
export const GROQ_WHISPER_MODEL = 'whisper-large-v3-turbo';
export const GROQ_CHAT_MODEL = 'llama-3.1-8b-instant';

export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'evalAI';
export const GRIDFS_BUCKET_NAME = 'audio';
