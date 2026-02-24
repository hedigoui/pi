import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';

/**
 * When user selects text, shows a "Read aloud" button that speaks the selection (TTS).
 * Available on all pages for accessibility.
 */
const ReadSelection = () => {
  const { t } = useTranslation();
  const [position, setPosition] = useState(null);
  const [selectedText, setSelectedText] = useState('');

  const speak = useCallback((text) => {
    if (!text?.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.trim());
    u.rate = 0.95;
    u.lang = document.documentElement.lang || 'en-US';
    window.speechSynthesis.speak(u);
  }, []);

  const updateSelection = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString?.()?.trim() ?? '';
    if (!text) {
      setPosition(null);
      setSelectedText('');
      return;
    }
    try {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
      });
      setSelectedText(text);
    } catch {
      setPosition(null);
      setSelectedText('');
    }
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      requestAnimationFrame(updateSelection);
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateSelection]);

  const handleRead = () => {
    speak(selectedText);
    window.getSelection()?.removeAllRanges?.();
    setPosition(null);
    setSelectedText('');
  };

  if (!position || !selectedText) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#1a1a1a',
        color: '#fff',
        borderRadius: 8,
        padding: '6px 10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <button
        type="button"
        onClick={handleRead}
        aria-label="Read selection aloud"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#E31837',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <Volume2 size={16} />
        {t('accessibility.readAloud')}
      </button>
    </div>
  );
};

export default ReadSelection;

/**
 * Utility for voice assistant: read current selection. Returns true if there was selection.
 */
export function readSelectionAloud() {
  const sel = window.getSelection();
  const text = sel?.toString?.()?.trim() ?? '';
  if (!text) return false;
  if (!window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.lang = document.documentElement.lang || 'en-US';
  window.speechSynthesis.speak(u);
  return true;
}
