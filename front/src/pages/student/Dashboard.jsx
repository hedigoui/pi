import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentSidebar from '../../components/StudentSidebar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Award, Clock, Target, ChevronLeft, ChevronRight, Flame, Zap, ArrowUpRight, Star, Mic } from 'lucide-react';
import { API_URL } from '../../config';
import styles from '../../styles/shared.module.css';
import dashStyles from './Dashboard.module.css';

const images = [
  { src: '/images/s1.jpg', alt: 'Student 1' },
  { src: '/images/s2.jpg', alt: 'Student 2' },
  { src: '/images/eva.jpg', alt: 'Eva' },
];

const defaultProgressData = [
  { name: 'Week 1', score: 65 },
  { name: 'Week 2', score: 70 },
  { name: 'Week 3', score: 68 },
  { name: 'Week 4', score: 75 },
  { name: 'Week 5', score: 80 },
  { name: 'Week 6', score: 85 },
];

const defaultSkillsData = [
  { name: 'Fluency', score: 78, color: '#E31837' },
  { name: 'Pronunciation', score: 72, color: '#f97316' },
  { name: 'Speaking Pace', score: 85, color: '#22c55e' },
  { name: 'Confidence', score: 80, color: '#3b82f6' },
  { name: 'Content Structure', score: 76, color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={dashStyles.tooltipWrap}>
        <p className={dashStyles.tooltipLabel}>{label}</p>
        <p className={dashStyles.tooltipValue}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.id) return;
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/practice-sessions/student/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Could not load dashboard data');
        setSessions([]);
      }
    };
    fetchSessions();
  }, [user?.id]);

  const latest = sessions[0] || null;
  const latestScore = latest?.totalScore ?? null;
  const latestCefr = latest?.cefrLevel ?? null;

  const scoredSessions = sessions.filter((s) => s.totalScore != null);
  const sessionsCompleted = sessions.length;
  const bestScore =
    scoredSessions.length > 0
      ? scoredSessions.reduce((max, s) => (s.totalScore > max ? s.totalScore : max), scoredSessions[0].totalScore)
      : null;

  const progressData =
    scoredSessions.length > 0
      ? scoredSessions
          .slice()
          .reverse()
          .map((s, idx) => ({
            name: `S${scoredSessions.length - idx}`,
            score: s.totalScore,
          }))
      : defaultProgressData;

  const skillsData =
    latest && latest.totalScore != null
      ? [
          { name: 'Fluency', score: latest.fluencyScore ?? 0, color: '#E31837' },
          { name: 'Pronunciation', score: latest.pronunciationScore ?? 0, color: '#f97316' },
          { name: 'Speaking Pace', score: latest.paceScore ?? 0, color: '#22c55e' },
          { name: 'Confidence', score: latest.confidenceScore ?? 0, color: '#3b82f6' },
          { name: 'Content Structure', score: latest.contentStructureScore ?? 0, color: '#8b5cf6' },
        ]
      : defaultSkillsData;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className={styles.layout}>
      <StudentSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          {/* Greeting */}
          <div className={dashStyles.greeting}>
            <div className={dashStyles.greetingLabel}>
              <span className={dashStyles.greetingPill}>Dashboard</span>
              <span className={dashStyles.greetingDot} />
              <span className={dashStyles.greetingStatus}>Online</span>
            </div>
            <p className={dashStyles.greetingSub}>Here's how your oral skills are evolving</p>
          </div>

          {/* Hero Carousel */}
          <div className={dashStyles.hero}>
            {images.map((image, index) => (
              <div key={index} className={`${dashStyles.heroSlide} ${currentImage === index ? dashStyles.active : ''}`}>
                <img src={image.src} alt={image.alt} className={dashStyles.heroImg} />
                <div className={dashStyles.heroOverlay} />
              </div>
            ))}
            <div className={dashStyles.heroContent}>
              <div>
                <span className={dashStyles.heroBadge}>EvalAI</span>
                <p className={dashStyles.heroTagline}>Speak. Practice. Excel.</p>
              </div>
              <div className={dashStyles.heroNav}>
                <button type="button" className={dashStyles.heroNavBtn} onClick={prevImage} aria-label="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className={dashStyles.heroNavBtn} onClick={nextImage} aria-label="Next">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className={dashStyles.heroDots}>
              {images.map((_, index) => (
                <button key={index} type="button" className={`${dashStyles.heroDot} ${currentImage === index ? dashStyles.active : ''}`} onClick={() => setCurrentImage(index)} aria-label={`Slide ${index + 1}`} />
              ))}
            </div>
          </div>

          {error && <div className={dashStyles.errorBanner}>{error}</div>}

          {/* Bento Stat Grid */}
          <div className={dashStyles.statGrid}>
            <div className={`${dashStyles.statCard} ${dashStyles.statCardCefr}`}>
              <Target size={20} className={dashStyles.statIcon} />
              <div className={dashStyles.statValue}>{latestCefr || '--'}</div>
              <div className={dashStyles.statLabel}>CEFR Level</div>
            </div>

            <div className={`${dashStyles.statCard} ${dashStyles.statCardWhite}`}>
              <div className={dashStyles.statCardHeader}>
                <div className={`${dashStyles.statIcon} ${dashStyles.statIconGreen}`}>
                  <TrendingUp size={18} />
                </div>
                <span className={dashStyles.statBadge}>
                  <ArrowUpRight size={12} /> +12%
                </span>
              </div>
              <div className={dashStyles.statValue}>78%</div>
              <div className={dashStyles.statLabel}>Overall Progress</div>
            </div>

            <div className={`${dashStyles.statCard} ${dashStyles.statCardWhite}`}>
              <div className={`${dashStyles.statIcon} ${dashStyles.statIconBlue}`}>
                <Clock size={18} />
              </div>
              <div className={dashStyles.statValue}>{sessionsCompleted}</div>
              <div className={dashStyles.statLabel}>Sessions Completed</div>
            </div>

            <div className={`${dashStyles.statCard} ${dashStyles.statCardWhite}`}>
              <div className={dashStyles.statCardHeader}>
                <div className={`${dashStyles.statIcon} ${dashStyles.statIconOrange}`}>
                  <Award size={18} />
                </div>
                <Star size={14} style={{ color: 'var(--orange)' }} />
              </div>
              <div className={dashStyles.statValue}>{bestScore != null ? bestScore : '--'}</div>
              <div className={dashStyles.statLabel}>Best Score</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className={dashStyles.chartsRow}>
            <div className={dashStyles.chartCard}>
              <div className={dashStyles.chartHeader}>
                <div>
                  <h3 className={dashStyles.chartTitle}>Progress Over Time</h3>
                  <p className={dashStyles.chartSub}>Score evolution</p>
                </div>
                <span className={dashStyles.chartBadge}>
                  <Flame size={14} /> +30% growth
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={progressData}>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} domain={[60, 90]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#E31837" strokeWidth={2.5}
                    dot={{ fill: '#fff', stroke: '#E31837', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#E31837', stroke: '#fff', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={dashStyles.chartCard}>
              <h3 className={dashStyles.chartTitle} style={{ marginBottom: '1.2rem' }}>Skills Breakdown</h3>
              <div className={dashStyles.skillsList}>
                {skillsData.map((skill) => (
                  <div key={skill.name}>
                    <div className={dashStyles.skillRow}>
                      <span className={dashStyles.skillName}>{skill.name}</span>
                      <span className={dashStyles.skillValue} style={{ color: skill.color }}>{skill.score}%</span>
                    </div>
                    <div className={dashStyles.skillBar}>
                      <div className={dashStyles.skillFill} style={{ width: `${skill.score}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}cc)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className={dashStyles.bottomRow}>
            <div className={dashStyles.recommendCard}>
              <div className={dashStyles.recommendHeader}>
                <Zap size={18} style={{ color: 'var(--primary)' }} />
                <h3 className={dashStyles.recommendTitle}>AI Recommendations</h3>
              </div>
              <div className={dashStyles.recommendList}>
                {(latest?.improvementSuggestions
                  ? (typeof latest.improvementSuggestions === 'string'
                      ? latest.improvementSuggestions.split(/\n/).filter(Boolean)
                      : []
                    ).map((text, i) => (
                      <div key={i} className={dashStyles.recommendItem}>
                        <span className={dashStyles.recommendIcon}>🎯</span>
                        <p className={dashStyles.recommendText}>{text}</p>
                      </div>
                    ))
                  : [
                    { icon: '💪', title: 'Strength: Vocabulary', desc: 'Excellent usage. Keep expanding with advanced terms.', type: 'green' },
                    { icon: '🎯', title: 'Improve: Pronunciation', desc: 'Focus on word stress patterns and intonation.', type: 'orange' },
                    { icon: '🚀', title: 'Next Goal: B2+', desc: "You're close! Focus on fluency in complex topics.", type: 'red' },
                  ].map((rec, i) => (
                    <div key={i} className={`${dashStyles.recommendItemPlaceholder} ${dashStyles['placeholder' + rec.type.charAt(0).toUpperCase() + rec.type.slice(1)]}`}>
                      <span className={dashStyles.recommendIcon}>{rec.icon}</span>
                      <div>
                        <h4 className={dashStyles.recommendItemTitle} style={{ color: rec.type === 'green' ? 'var(--green)' : rec.type === 'orange' ? 'var(--orange)' : 'var(--primary)' }}>{rec.title}</h4>
                        <p className={dashStyles.recommendText}>{rec.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className={dashStyles.quickAction}>
            <div className={dashStyles.quickActionLeft}>
              <div className={dashStyles.quickActionIcon}>
                <Mic size={20} />
              </div>
              <div>
                <p className={dashStyles.quickActionTitle}>Ready to practice?</p>
                <p className={dashStyles.quickActionSub}>Start a new recording session and get instant AI feedback</p>
              </div>
            </div>
            <Link to="/student/practice" className={dashStyles.quickActionBtn}>
              Start Practice <ArrowUpRight size={16} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
