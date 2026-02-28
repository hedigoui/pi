import { useState, useEffect, useRef } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Mic, MicOff, Square, Upload, Loader2 } from 'lucide-react';
import { API_URL } from '../../config';
import styles from '../../styles/shared.module.css';
import practiceStyles from './Practice.module.css';

const formatScore = (value) => (value != null ? value : '--');

/** Format seconds as MM:SS */
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** Normalize MongoDB _id from string or { $oid: "..." } */
const sessionId = (s) => (s?._id == null ? '' : typeof s._id === 'string' ? s._id : (s._id?.$oid ?? String(s._id)));

const Practice = () => {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('record');
  const [analyzingSessionId, setAnalyzingSessionId] = useState(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordSessionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Parse user error', e);
      }
    }
  }, []);

  const fetchSessions = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/practice-sessions/student/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
      if (!currentSession && data?.length > 0) {
        setCurrentSession(data[0]);
      }
    } catch (e) {
      setError(e.message || 'Could not load practice sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchSessions();
  }, [user?.id]);

  // Timer while recording
  useEffect(() => {
    if (!isRecording) return;
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Cleanup mic and recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const createSession = async (skillType = 'fluency') => {
    if (!user?.id) {
      setError('Please log in again');
      return null;
    }
    setCreating(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/practice-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ studentId: user.id, skillType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create session');
      }
      const newSession = await res.json();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    } catch (e) {
      setError(e.message || 'Could not start session');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      // Stop recording and upload
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!user?.id) {
      setError('Please log in again');
      return;
    }
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const session = await createSession('fluency');
      if (!session) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      recordSessionRef.current = session;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
        if (chunks.length === 0) {
          setError('No audio recorded');
          setRecordSeconds(0);
          return;
        }
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        setCreating(true);
        try {
          const id = sessionId(recordSessionRef.current);
          const formData = new FormData();
          const ext = blob.type.includes('webm') ? '.webm' : '.mp4';
          formData.append('file', blob, `recording${ext}`);
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/practice-sessions/upload/${id}`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Upload failed');
          }
          const updated = await res.json();
          setSessions((prev) => prev.map((s) => (sessionId(s) === id ? updated : s)));
          setCurrentSession(updated);
        } catch (err) {
          setError(err.message || 'Could not upload recording');
        } finally {
          setCreating(false);
          setRecordSeconds(0);
        }
      };

      recorder.start(1000);
      setRecordSeconds(0);
      setIsRecording(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Allow mic in browser settings.');
      } else {
        setError(err.message || 'Could not start microphone');
      }
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setError('');
    let session;
    try {
      session = await createSession('fluency');
      if (!session) return;
      setCreating(true);
      const id = sessionId(session);
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      // Upload audio file to server
      const res = await fetch(`${API_URL}/practice-sessions/upload/${id}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      const updated = await res.json();
      setSessions((prev) => prev.map((s) => (sessionId(s) === id ? updated : s)));
      setCurrentSession(updated);
    } catch (err) {
      setError(err.message || 'Could not upload file');
    } finally {
      setCreating(false);
    }
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    const id = currentSession ? sessionId(currentSession) : null;
    if (!id) {
      setError('Select a session first (use the dropdown above).');
      return;
    }
    if (!currentSession?.mediaUrl) {
      setError('This session has no recording. Record or upload audio first, then try again.');
      return;
    }
    setError('');
    setAnalyzingSessionId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/practice-sessions/analyze/${id}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || `Analysis failed (${res.status})`);
      setSessions((prev) => prev.map((s) => (sessionId(s) === id ? data : s)));
      setCurrentSession(data);
    } catch (err) {
      setError(err.message || 'Could not run AI analysis. Check that the backend is running and API keys are in back/.env.');
    } finally {
      setAnalyzingSessionId(null);
    }
  };

  const displaySession = currentSession || null;
  const totalScore = displaySession?.totalScore ?? null;
  const cefrLevel = displaySession?.cefrLevel ?? null;
  const fluency = displaySession?.fluencyScore ?? null;
  const pronunciation = displaySession?.pronunciationScore ?? null;
  const pace = displaySession?.paceScore ?? null;
  const confidence = displaySession?.confidenceScore ?? null;
  const contentStructure = displaySession?.contentStructureScore ?? null;

  return (
    <div className={styles.layout}>
      <StudentSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Practice Mode</h1>
              <p className={styles.pageSubtitle}>Record yourself and get AI feedback</p>
            </div>
          </div>

          {error && (
            <div className={practiceStyles.errorBanner}>
              <span>
                {error}
                {(error.includes('upload') || error.includes('Upload') || error.includes('connection')) && (
                  <span className={practiceStyles.errorBannerHint}>Check your connection and try again.</span>
                )}
              </span>
              <button type="button" className={practiceStyles.errorDismiss} onClick={() => setError('')}>
                Try again
              </button>
            </div>
          )}

          <div className={practiceStyles.topActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => createSession('fluency')}
              disabled={creating || !user?.id}
            >
              {creating ? 'Creating…' : 'Start new session'}
            </button>
            {sessions.length > 0 && (
              <span className={practiceStyles.sessionCount}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Tab Selection */}
          <div className={practiceStyles.tabContainer}>
            <button
              className={`${practiceStyles.tab} ${activeTab === 'record' ? practiceStyles.activeTab : ''}`}
              onClick={() => setActiveTab('record')}
            >
              <Mic size={18} />
              Record Session
            </button>
            <button
              className={`${practiceStyles.tab} ${activeTab === 'upload' ? practiceStyles.activeTab : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={18} />
              Upload Audio
            </button>
          </div>

          <div className={practiceStyles.practiceGrid}>
            {/* Recording/Upload Area */}
            <div className={styles.card}>
              {activeTab === 'record' ? (
                <div className={practiceStyles.recordingArea}>
                  <div className={practiceStyles.videoPreview}>
                    <Mic size={64} style={{ color: 'rgba(0,0,0,0.2)' }} />
                    <p>Microphone Preview</p>
                  </div>

                  <div className={practiceStyles.recordingControls}>
                    <button
                      type="button"
                      className={`${practiceStyles.recordBtn} ${isRecording ? practiceStyles.recording : ''}`}
                      onClick={handleRecordToggle}
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 size={28} className={practiceStyles.spin} />
                      ) : isRecording ? (
                        <Square size={28} fill="currentColor" />
                      ) : (
                        <Mic size={28} />
                      )}
                    </button>
                  </div>

                  <div className={practiceStyles.timer}>
                    {formatTime(recordSeconds)}
                  </div>

                  <div className={practiceStyles.micIndicator}>
                    {creating ? (
                      <><Loader2 size={16} className={practiceStyles.spin} /> Uploading...</>
                    ) : isRecording ? (
                      <><Mic size={16} /> Recording… Click stop to save</>
                    ) : (
                      <><MicOff size={16} /> Ready to record</>
                    )}
                  </div>
                </div>
              ) : (
                <div className={practiceStyles.uploadArea}>
                  <Upload size={48} style={{ color: 'rgba(0,0,0,0.3)' }} />
                  <h3>Upload Audio</h3>
                  <p>Drag and drop your audio file here, or click to browse</p>
                  <label className={styles.primaryButton} style={{ cursor: 'pointer' }}>
                    <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileSelect} disabled={creating} />
                    {creating ? 'Creating session…' : 'Choose File'}
                  </label>
                  <span className={practiceStyles.fileHint}>MP3, WAV, M4A up to 100MB</span>
                </div>
              )}

              {/* Your recording — shown on both Record and Upload when session has audio */}
              {displaySession?.mediaUrl && (
                <div className={practiceStyles.recordingDivider}>
                  <p className={practiceStyles.recordingLabel}>Your recording</p>
                  <audio controls src={`${API_URL}${displaySession.mediaUrl}`} className={practiceStyles.audioPlayer} />
                </div>
              )}
            </div>

            {/* AI Feedback Panel */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>AI Feedback</h3>

              <div className={practiceStyles.aiNotice}>
                🤖 AI-powered analysis is used to provide practice feedback. Final evaluations are always reviewed by an instructor.
              </div>

              {sessions.length > 0 && (
                <div className={practiceStyles.sessionSelectWrap}>
                  <label className={practiceStyles.sessionLabel}>Session</label>
                  <select
                    value={displaySession ? sessionId(displaySession) : ''}
                    onChange={(e) => {
                      const id = e.target.value;
                      setCurrentSession(sessions.find((s) => sessionId(s) === id) || null);
                    }}
                    className={practiceStyles.sessionSelect}
                  >
                    {sessions.map((s) => (
                      <option key={sessionId(s)} value={sessionId(s)}>
                        {new Date(s.createdAt).toLocaleString()} {s.skillType ? ` · ${s.skillType}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={practiceStyles.scoreCircle}>
                <span className={practiceStyles.scoreValue}>{formatScore(totalScore)}</span>
                <span className={practiceStyles.scoreLabel}>/100</span>
              </div>

              {cefrLevel && (
                <div style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
                  <span className={practiceStyles.cefrPill}>
                    <span className={practiceStyles.cefrPillLabel}>CEFR</span>
                    <span>{cefrLevel}</span>
                  </span>
                </div>
              )}

              <p className={practiceStyles.feedbackHint}>
                {displaySession ? 'Scores update after AI analysis.' : 'Start a recording or upload audio to create a session.'}
              </p>

              <div className={practiceStyles.metricsPreview}>
                <div className={practiceStyles.metricItem}>
                  <span>Speech fluency</span>
                  <span>{formatScore(fluency)}</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Pronunciation clarity</span>
                  <span>{formatScore(pronunciation)}</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Speaking pace</span>
                  <span>{formatScore(pace)}</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Confidence indicators</span>
                  <span>{formatScore(confidence)}</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Content structure</span>
                  <span>{formatScore(contentStructure)}</span>
                </div>
              </div>

              {displaySession?.transcription && (
                <div className={practiceStyles.transcriptBlock}>
                  <p className={practiceStyles.blockTitle}>Transcript</p>
                  <p className={practiceStyles.blockBody}>{displaySession.transcription}</p>
                </div>
              )}

              {displaySession?.feedbackExplanation && (
                <div className={practiceStyles.feedbackBlock}>
                  <p className={practiceStyles.blockTitle}>AI feedback</p>
                  <p className={practiceStyles.blockBody}>{displaySession.feedbackExplanation}</p>
                </div>
              )}

              {displaySession?.improvementSuggestions && (
                <div className={practiceStyles.suggestionsBlock}>
                  <p className={practiceStyles.blockTitle}>Suggestions to improve</p>
                  <ul className={practiceStyles.suggestionsList}>
                    {(typeof displaySession.improvementSuggestions === 'string'
                      ? displaySession.improvementSuggestions.split(/\n/).filter(Boolean)
                      : []
                    ).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                className={`${styles.primaryButton} ${practiceStyles.fullWidthButton}`}
                onClick={handleAnalyze}
                disabled={!!analyzingSessionId}
              >
                {analyzingSessionId ? (
                  <><Loader2 size={18} className={practiceStyles.spin} /> Analyzing…</>
                ) : (
                  'Get AI feedback'
                )}
              </button>
              {!displaySession?.mediaUrl && displaySession && (
                <p className={practiceStyles.hintText}>This session has no recording. Record or upload audio first.</p>
              )}
              {!displaySession && sessions.length > 0 && (
                <p className={practiceStyles.hintText}>Select a session above that has a recording.</p>
              )}

              <button type="button" className={`${styles.secondaryButton} ${practiceStyles.fullWidthButton}`} disabled>
                Submit for Review
              </button>
            </div>
          </div>

          {loading && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading sessions…</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Practice;
