import { useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import { Upload, Play, Pause, Star, Send, Bot, User, Mic, MicOff } from 'lucide-react';
import styles from '../../styles/shared.module.css';
import evaluateStyles from './Evaluate.module.css';

const Evaluate = () => {
  const { studentId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordMode, setRecordMode] = useState('upload');
  const [scores, setScores] = useState({
    fluency: 8,
    pronunciation: 8,
    speakingPace: 7,
    confidence: 7,
    contentStructure: 8,
  });
  const [cefrLevel, setCefrLevel] = useState('B2');
  const [notes, setNotes] = useState('');

  const handleScoreChange = (metric, value) => {
    setScores(prev => ({ ...prev, [metric]: value }));
  };

  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length * 10);

  return (
    <div className={styles.layout}>
      <TeacherSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Evaluate Student</h1>
              <p className={styles.pageSubtitle}>Review recording and provide evaluation</p>
            </div>
            <button className={styles.primaryButton}>
              <Send size={18} />
              Submit Evaluation
            </button>
          </div>

          <div className={evaluateStyles.evaluateGrid}>
            {/* Left: Video/Audio Player */}
            <div className={evaluateStyles.leftColumn}>
              {/* Video Upload/Record */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Session Recording</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setRecordMode('upload')}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s',
                      background: recordMode === 'upload' ? '#E31837' : 'rgba(0,0,0,0.04)',
                      color: recordMode === 'upload' ? '#fff' : '#64748b',
                    }}
                  >
                    <Upload size={16} /> Upload Recording
                  </button>
                  <button
                    onClick={() => setRecordMode('record')}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s',
                      background: recordMode === 'record' ? '#E31837' : 'rgba(0,0,0,0.04)',
                      color: recordMode === 'record' ? '#fff' : '#64748b',
                    }}
                  >
                    <Mic size={16} /> Record Live Session
                  </button>
                </div>

                {recordMode === 'upload' ? (
                <div className={evaluateStyles.videoContainer}>
                  <div className={evaluateStyles.videoPlaceholder}>
                    <Upload size={48} />
                    <p>Upload or select a recording to evaluate</p>
                    <button className={styles.secondaryButton}>
                      <Upload size={16} />
                      Upload Recording
                    </button>
                  </div>
                </div>
                ) : (
                <div className={evaluateStyles.videoContainer}>
                  <div className={evaluateStyles.videoPlaceholder} style={{ background: isRecording ? 'rgba(227,24,55,0.03)' : undefined }}>
                    <Mic size={48} style={{ color: isRecording ? '#E31837' : 'rgba(0,0,0,0.2)' }} />
                    <p>{isRecording ? 'Recording in progress...' : 'Click Record to start capturing the oral presentation'}</p>
                    <button
                      className={isRecording ? styles.secondaryButton : styles.primaryButton}
                      onClick={() => setIsRecording(!isRecording)}
                      style={isRecording ? { borderColor: '#E31837', color: '#E31837' } : {}}
                    >
                      {isRecording ? <><MicOff size={16} /> Stop Recording</> : <><Mic size={16} /> Start Recording</>}
                    </button>
                    {isRecording && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#E31837', fontSize: '0.82rem', fontWeight: '600' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E31837', animation: 'pulse 1.5s infinite' }} />
                        REC 00:45
                      </div>
                    )}
                  </div>
                </div>
                )}

                <div className={evaluateStyles.playerControls}>
                  <button 
                    className={evaluateStyles.playBtn}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <div className={evaluateStyles.progressTrack}>
                    <div className={evaluateStyles.progressFill} style={{ width: '35%' }}></div>
                  </div>
                  <span className={evaluateStyles.duration}>02:45 / 08:30</span>
                </div>
              </div>

              {/* AI Transcription */}
              <div className={styles.card}>
                <div className={evaluateStyles.sectionHeader}>
                  <Bot size={20} />
                  <h3>AI Transcription</h3>
                </div>
                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.72rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bot size={14} /> This content is generated by AI. The instructor reviews and validates all results.
                </div>
                <div className={evaluateStyles.transcription}>
                  <p>
                    "Hello, today I would like to talk about the importance of renewable energy sources. 
                    In recent years, we have seen a significant increase in the adoption of solar and wind power. 
                    These technologies offer many advantages over traditional fossil fuels..."
                  </p>
                  <p>
                    "The main benefits include reduced carbon emissions, lower long-term costs, and energy independence. 
                    However, there are also challenges such as intermittency and storage requirements..."
                  </p>
                </div>
              </div>

              {/* AI Analysis — Transcription + CEFR Suggestion Only (No Scores) */}
              <div className={styles.card}>
                <div className={evaluateStyles.sectionHeader}>
                  <Bot size={20} />
                  <h3>AI Analysis</h3>
                  <span className={evaluateStyles.aiBadge}>AI Generated</span>
                </div>
                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.72rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bot size={14} /> AI-assisted analysis — the instructor can override any suggestion below.
                </div>
                <div className={evaluateStyles.aiMetrics}>
                  <div className={evaluateStyles.aiMetric}>
                    <span>Suggested CEFR Level</span>
                    <div className={evaluateStyles.aiScore}>B2</div>
                  </div>
                  <div className={evaluateStyles.aiMetric}>
                    <span>Confidence</span>
                    <div className={evaluateStyles.aiScore}>85%</div>
                  </div>
                  <div className={evaluateStyles.aiMetric}>
                    <span>Language Detected</span>
                    <div className={evaluateStyles.aiScore}>English</div>
                  </div>
                  <div className={evaluateStyles.aiMetric}>
                    <span>Word Count</span>
                    <div className={evaluateStyles.aiScore}>342</div>
                  </div>
                  <div className={evaluateStyles.aiMetric}>
                    <span>Speaking Rate</span>
                    <div className={evaluateStyles.aiScore}>128 wpm</div>
                  </div>
                  <div className={evaluateStyles.aiMetric}>
                    <span>Pause Frequency</span>
                    <div className={evaluateStyles.aiScore}>4.2/min</div>
                  </div>
                </div>
                <div className={evaluateStyles.aiSuggestion}>
                  <h4>AI Suggestions</h4>
                  <ul>
                    <li>Good use of transitional phrases</li>
                    <li>Consider varying sentence structure more</li>
                    <li>Some minor pronunciation issues with technical terms</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Instructor Evaluation Form */}
            <div className={evaluateStyles.rightColumn}>
              <div className={styles.card}>
                <div className={evaluateStyles.sectionHeader}>
                  <User size={20} />
                  <h3>Instructor Evaluation</h3>
                </div>

                {/* Overall Score */}
                <div className={evaluateStyles.overallScore}>
                  <div className={evaluateStyles.scoreCircle}>
                    <span>{overallScore}</span>
                    <small>/100</small>
                  </div>
                  <span>Overall Score</span>
                </div>

                {/* CEFR Level */}
                <div className={evaluateStyles.formGroup}>
                  <label>CEFR Level</label>
                  <div className={evaluateStyles.levelButtons}>
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                      <button
                        key={level}
                        className={`${evaluateStyles.levelBtn} ${cefrLevel === level ? evaluateStyles.activeLevel : ''}`}
                        onClick={() => setCefrLevel(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Sliders */}
                <div className={evaluateStyles.scoreSliders}>
                  {Object.entries(scores).map(([metric, value]) => {
                    const labels = {
                      fluency: 'Fluency',
                      pronunciation: 'Pronunciation',
                      speakingPace: 'Speaking Pace',
                      confidence: 'Confidence',
                      contentStructure: 'Content Structure',
                    };
                    return (
                    <div key={metric} className={evaluateStyles.sliderGroup}>
                      <div className={evaluateStyles.sliderLabel}>
                        <span>{labels[metric] || metric}</span>
                        <span>{value}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) => handleScoreChange(metric, parseInt(e.target.value))}
                        className={evaluateStyles.slider}
                      />
                    </div>
                    );
                  })}
                </div>

                {/* Notes */}
                <div className={evaluateStyles.formGroup}>
                  <label>Feedback & Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your feedback and recommendations..."
                    className={evaluateStyles.textarea}
                    rows={5}
                  />
                </div>

                {/* Actions */}
                <div className={evaluateStyles.actions}>
                  <button className={styles.secondaryButton}>Save Draft</button>
                  <button className={styles.primaryButton}>
                    <Send size={16} />
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Evaluate;
