import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { usePageActions } from '../context/VoiceActionsContext';
import { readSelectionAloud } from './ReadSelection';

/**
 * Voice Assistant for accessibility: speech-to-text + text-to-speech.
 * Available on all pages. Uses Web Speech API (no API key).
 */
const VoiceAssistant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageActions = usePageActions();

  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef(null);
  const currentFieldRef = useRef(null);
  const listeningRef = useRef(false); // ref so onend can see current state without stale closure
  const restartTimeoutRef = useRef(null);

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = options.rate ?? 0.95;
    u.lang = options.lang ?? 'en-US';
    window.speechSynthesis.speak(u);
  }, []);

  const getHelpMessage = useCallback(() => {
    const path = location.pathname;
    const base = 'You can say: ';
    const parts = [];

    // Global nav
    if (path === '/') {
      parts.push('Focus email, Focus password, Type then your text, Student, Teacher, Admin, Login. ');
    }
    parts.push('Select text and say "Read selection" to hear it, or use the Read aloud button. ');
    if (path !== '/') {
      parts.push('Go to dashboard, ');
      if (path.startsWith('/student')) {
        parts.push('Practice, My reports, Settings, ');
      }
      if (path.startsWith('/teacher')) {
        parts.push('Students, Evaluate, Reports, Settings, ');
      }
      if (path.startsWith('/admin')) {
        parts.push('Users, Reports, Settings, ');
      }
      parts.push('Logout.');
    }
    return base + parts.join('');
  }, [location.pathname]);

  const parseAndRun = useCallback(
    (transcript) => {
      const t = transcript.trim().toLowerCase();
      if (!t) return;

      const path = location.pathname;

      // ——— Global: Logout ———
      if (/\b(logout|log out|sign out)\b/.test(t)) {
        navigate('/');
        speak('Going to login.');
        return;
      }

      // ——— Global: Navigation ———
      if (/\bgo to login\b|^\s*login\s*page\b/.test(t)) {
        navigate('/');
        speak('Login page.');
        return;
      }

      if (/\bgo to dashboard\b|^\s*dashboard\b/.test(t)) {
        if (path.startsWith('/student')) navigate('/student/dashboard');
        else if (path.startsWith('/teacher')) navigate('/teacher/dashboard');
        else if (path.startsWith('/admin')) navigate('/admin/dashboard');
        else navigate('/');
        speak('Dashboard.');
        return;
      }

      if (path.startsWith('/student')) {
        if (/\bgo to practice\b|^\s*practice\b/.test(t)) {
          navigate('/student/practice');
          speak('Practice.');
          return;
        }
        if (/\bgo to reports\b|\bmy reports\b|^\s*reports\b/.test(t)) {
          navigate('/student/reports');
          speak('Reports.');
          return;
        }
      }

      if (path.startsWith('/teacher')) {
        if (/\bgo to students\b|^\s*students\b/.test(t)) {
          navigate('/teacher/students');
          speak('Students.');
          return;
        }
        if (/\bgo to evaluate\b|^\s*evaluate\b/.test(t)) {
          navigate('/teacher/evaluate');
          speak('Evaluate.');
          return;
        }
        if (/\bgo to reports\b|^\s*reports\b/.test(t)) {
          navigate('/teacher/reports');
          speak('Reports.');
          return;
        }
      }

      if (path.startsWith('/admin')) {
        if (/\bgo to users\b|^\s*users\b/.test(t)) {
          navigate('/admin/users');
          speak('Users.');
          return;
        }
        if (/\bgo to reports\b|^\s*reports\b/.test(t)) {
          navigate('/admin/reports');
          speak('Reports.');
          return;
        }
      }

      if (/\bgo to settings\b|^\s*settings\b/.test(t)) {
        if (path.startsWith('/student')) navigate('/student/settings');
        else if (path.startsWith('/teacher')) navigate('/teacher/settings');
        else if (path.startsWith('/admin')) navigate('/admin/settings');
        speak('Settings.');
        return;
      }

      // ——— Page-specific: Login (only when on / and actions exist) ———
      if (path === '/' && pageActions.setRole && /\b(student|teacher|admin)\b/.test(t)) {
        const role = t.includes('student') ? 'student' : t.includes('teacher') ? 'teacher' : 'admin';
        pageActions.setRole(role);
        speak(`Role set to ${role}.`);
        return;
      }

      if (path === '/' && pageActions.focusEmail && /\b(focus |go to |put (in |on )?)?(email|e-?mail)\b/.test(t)) {
        currentFieldRef.current = 'email';
        pageActions.focusEmail();
        speak('Email field focused. Say your email or say "type" and then your email.');
        return;
      }

      if (path === '/' && pageActions.focusPassword && /\b(focus |go to |put (in |on )?)?(password|pass)\b/.test(t)) {
        currentFieldRef.current = 'password';
        pageActions.focusPassword();
        speak('Password field focused. Say your password or say "type" and then your password.');
        return;
      }

      if (path === '/' && pageActions.submit && /\b(login|sign in|submit|enter)\b/.test(t)) {
        currentFieldRef.current = null;
        pageActions.submit();
        speak('Logging in.');
        return;
      }

      const typeMatch = t.match(/^(?:type|dictate|my (?:email|password) is?)\s*(.+)$/);
      const textToType = typeMatch ? typeMatch[1].trim() : currentFieldRef.current ? t : null;

      if (textToType && path === '/') {
        const field = currentFieldRef.current || (t.includes('password') ? 'password' : 'email');
        if (field === 'email' && pageActions.setEmail) {
          pageActions.setEmail(textToType);
          speak('Email entered.');
        } else if (field === 'password' && pageActions.setPassword) {
          pageActions.setPassword(textToType);
          speak('Password entered.');
        }
        return;
      }

      if (path === '/' && currentFieldRef.current === 'email' && pageActions.setEmail) {
        pageActions.setEmail(t);
        speak('Email entered.');
        return;
      }
      if (path === '/' && currentFieldRef.current === 'password' && pageActions.setPassword) {
        pageActions.setPassword(t);
        speak('Password entered.');
        return;
      }

      // ——— Read selection aloud ———
      if (/\b(read (selection|that|it)|read aloud)\b/.test(t)) {
        if (readSelectionAloud()) speak('Reading selection.');
        else speak('No text selected. Select some text and say "read" again.');
        return;
      }

      // ——— Help ———
      if (/\b(what can I say|help|commands)\b/.test(t)) {
        speak(getHelpMessage());
        return;
      }

      // Unrecognized
      speak('Say "help" to hear available commands.');
    },
    [location.pathname, navigate, pageActions, speak, getHelpMessage]
  );

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setLastTranscript(transcript);
      parseAndRun(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      listeningRef.current = false;
      setListening(false);
      speak('Sorry, I did not catch that. Try again.');
    };

    recognition.onend = () => {
      if (!listeningRef.current || !recognitionRef.current) return;
      // Keep listening: restart after a short delay so user hears the response and we don't pick up TTS
      restartTimeoutRef.current = setTimeout(() => {
        try {
          if (listeningRef.current && recognitionRef.current) recognitionRef.current.start();
        } catch (_) {}
      }, 1200);
    };

    recognitionRef.current = recognition;
    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      try {
        recognition.abort();
      } catch (_) {}
    };
  }, [parseAndRun, speak]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    listeningRef.current = true;
    setListening(true);
    setLastTranscript('');
    try {
      recognitionRef.current.start();
      speak('Listening. Say a command or "help" for options.');
    } catch (_) {}
  }, [speak]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
  }, []);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) return;
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Auto-start listening when the page loads so it stays on until user turns it off
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (!supported || !recognitionRef.current || hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    startListening();
    return () => stopListening();
  }, [supported, startListening, stopListening]);

  if (!supported) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          padding: '0.5rem 0.75rem',
          background: '#333',
          color: '#fff',
          borderRadius: 8,
          fontSize: 12,
          zIndex: 9999,
        }}
      >
        Voice assistant is not supported in this browser. Try Chrome or Edge.
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
      }}
    >
      {lastTranscript && (
        <span
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 12,
            maxWidth: 260,
          }}
        >
          Heard: &quot;{lastTranscript}&quot;
        </span>
      )}
      <button
        type="button"
        onClick={toggleListening}
        aria-label={listening ? 'Stop listening' : 'Start voice assistant'}
        title={listening ? 'Stop listening' : 'Voice assistant on all pages'}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: listening ? '#c41230' : '#E31837',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        }}
      >
        {listening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
