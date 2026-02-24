# Accessibility Ideas for EVALUA (Disability-Friendly)

## Your idea: Voice-driven interaction

- **Student speaks** to navigate and fill forms (e.g. “put my email”, dictate text, “login”).
- **AI voice** guides and confirms actions (e.g. “Email field focused. Say your email now.”).

Below are concrete features and APIs you can use.

---

## 1. Voice input (speech-to-text – STT)

| Option | Pros | Cons | Best for |
|--------|------|------|----------|
| **Web Speech API** (`SpeechRecognition`) | Free, no API key, works in Chrome/Edge | Less accurate, browser support varies | MVP, quick prototype |
| **Google Cloud Speech-to-Text** | Very accurate, many languages | Paid, needs API key | Production |
| **OpenAI Whisper API** | Very accurate, good for dictation | Paid, needs API key | Production |
| **Azure Speech** | Good accuracy, accessibility features | Paid, needs API key | Enterprise |

**Suggestion:** Start with **Web Speech API** for “focus email”, “login”, “go to dashboard”, and dictation. Add Google/Whisper later for better accuracy.

---

## 2. Voice output (text-to-speech – TTS)

| Option | Pros | Cons |
|--------|------|------|
| **Web Speech API** (`speechSynthesis`) | Free, built-in, many voices | Quality varies by browser/OS |
| **Google Cloud Text-to-Speech** | Natural voices, many languages | Paid, API key |
| **Azure Speech (TTS)** | Neural voices, SSML | Paid, API key |

**Suggestion:** Use **speechSynthesis** first so the “AI voice” can read labels, confirm actions, and guide the user. No backend or API key needed.

---

## 3. Voice commands (what the student can say)

Examples you can support:

- **Navigation:** “Go to login”, “Dashboard”, “Practice”, “Reports”, “Settings”.
- **Form:** “Focus email” / “Email field” → focus email input; “Focus password” → focus password; “Type …” or “My email is …” → put text in focused field.
- **Actions:** “Login”, “Submit”, “Remember me”, “Student” / “Teacher” / “Admin” (role).
- **Help:** “What can I say?”, “Repeat”, “Stop listening”.

The assistant can **respond by voice** (e.g. “Email focused. You can say your email now.”) and **execute** the action (focus, type, submit).

---

## 4. Translator (for accessibility / language)

- **Screen reader + language:** Keep labels and live regions in the DOM; TTS will read them. For multiple UI languages, use **i18n** (e.g. `react-i18next`) and optionally **translation API** (Google Translate, LibreTranslate) for dynamic content.
- **Sign language / captions:** For video content, use captions (and later sign-language avatars) so deaf/hard-of-hearing users can follow.

**APIs:** Google Translate API, LibreTranslate (self-hosted), or only i18n if you just need fixed UI strings.

---

## 5. Other accessibility (beyond voice)

- **Keyboard:** All actions available via keyboard (Tab, Enter, Space).
- **ARIA:** `aria-label`, `aria-live` for status messages (e.g. “Logged in”) so screen readers announce them.
- **Focus:** Visible focus ring and logical tab order; after “focus email” or “login”, move focus to the right element.
- **Contrast & zoom:** Respect user font size and contrast (e.g. avoid low-contrast text).

---

## 6. Suggested implementation order

1. **Voice assistant (floating button + Web Speech API)**  
   - Listen for commands (e.g. “focus email”, “focus password”, “type …”, “login”, “student/teacher/admin”).  
   - Speak confirmations and instructions.  
   - Integrate on Login first, then reuse on other pages.

2. **Dictation into focused field**  
   - When email or password is focused, treat continuous speech as text for that field (with clear “start/stop dictation” or “type …” prefix if you want).

3. **Navigation by voice**  
   - Map phrases like “go to dashboard”, “practice”, “reports” to `navigate('/student/dashboard')`, etc., and announce “Navigating to Dashboard.”

4. **Optional:** Replace Web Speech with Google/Whisper for STT and/or Google/Azure for TTS for better quality and reliability.

5. **Optional:** Add i18n + translation API and/or captions for multilingual and deaf/hard-of-hearing users.

---

## Next step in code

A **VoiceAssistant** component is added that:

- Uses **Web Speech API** (no API key) for both listening and speaking.
- Understands commands: focus email, focus password, type in current field, login, set role (student/teacher/admin).
- Speaks short confirmations and can read “What can I say?” help.
- Is integrated into the Login page; you can later wrap the app (e.g. in `App.jsx`) so it’s available on every page.

You can extend it with more commands (e.g. “go to dashboard”) and, when ready, plug in Google/Whisper/Azure APIs for better accuracy and voices.
