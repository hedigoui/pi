import { useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Mic, MicOff, Play, Pause, SkipBack, SkipForward, Upload } from 'lucide-react';
import styles from '../../styles/shared.module.css';
import practiceStyles from './Practice.module.css';

const Practice = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('record');

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
                    <button className={practiceStyles.controlBtn}>
                      <SkipBack size={20} />
                    </button>
                    <button 
                      className={`${practiceStyles.recordBtn} ${isRecording ? practiceStyles.recording : ''}`}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      {isRecording ? <Pause size={28} /> : <Play size={28} />}
                    </button>
                    <button className={practiceStyles.controlBtn}>
                      <SkipForward size={20} />
                    </button>
                  </div>

                  <div className={practiceStyles.timer}>
                    {isRecording ? '00:45' : '00:00'}
                  </div>

                  <div className={practiceStyles.micIndicator}>
                    {isRecording ? (
                      <><Mic size={16} /> Recording...</>
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
                  <button className={styles.primaryButton}>
                    Choose File
                  </button>
                  <span className={practiceStyles.fileHint}>MP3, WAV, M4A up to 100MB</span>
                </div>
              )}
            </div>

            {/* AI Feedback Panel */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>AI Feedback</h3>
              
              <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.72rem', color: '#3b82f6', lineHeight: '1.5' }}>
                🤖 AI-powered analysis is used to provide practice feedback. Final evaluations are always reviewed by an instructor.
              </div>
              
              <div className={practiceStyles.scoreCircle}>
                <span className={practiceStyles.scoreValue}>--</span>
                <span className={practiceStyles.scoreLabel}>/100</span>
              </div>

              <p className={practiceStyles.feedbackHint}>
                Complete a recording to receive AI feedback
              </p>

              <div className={practiceStyles.metricsPreview}>
                <div className={practiceStyles.metricItem}>
                  <span>Fluency</span>
                  <span>--</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Pronunciation</span>
                  <span>--</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Speaking Pace</span>
                  <span>--</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Confidence</span>
                  <span>--</span>
                </div>
                <div className={practiceStyles.metricItem}>
                  <span>Content Structure</span>
                  <span>--</span>
                </div>
              </div>

              <button className={styles.secondaryButton} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled>
                Submit for Review
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Practice;
