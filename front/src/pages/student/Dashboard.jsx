import { useState, useEffect } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Award, Clock, Target, ChevronLeft, ChevronRight, Flame, Zap, ArrowUpRight, Star, Mic } from 'lucide-react';
import styles from '../../styles/shared.module.css';

const images = [
  { src: '/images/s1.jpg', alt: 'Student 1' },
  { src: '/images/s2.jpg', alt: 'Student 2' },
  { src: '/images/eva.jpg', alt: 'Eva' },
];

const progressData = [
  { name: 'Week 1', score: 65 },
  { name: 'Week 2', score: 70 },
  { name: 'Week 3', score: 68 },
  { name: 'Week 4', score: 75 },
  { name: 'Week 5', score: 80 },
  { name: 'Week 6', score: 85 },
];

const skillsData = [
  { name: 'Fluency', score: 78, color: '#E31837' },
  { name: 'Pronunciation', score: 72, color: '#f97316' },
  { name: 'Speaking Pace', score: 85, color: '#22c55e' },
  { name: 'Confidence', score: 80, color: '#3b82f6' },
  { name: 'Content Structure', score: 76, color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,15,26,0.92)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
        padding: '0.6rem 0.85rem', boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>{label}</p>
        <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700' }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className={styles.layout}>
      <StudentSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          {/* Greeting */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#E31837', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Online</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
              Welcome back 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.3rem' }}>Here's how your oral skills are evolving</p>
          </div>

          {/* Hero Carousel */}
          <div style={{
            position: 'relative', width: '100%', height: '280px', borderRadius: '24px',
            overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
          }}>
            {images.map((image, index) => (
              <div key={index} style={{
                position: 'absolute', inset: 0,
                opacity: currentImage === index ? 1 : 0,
                transform: `scale(${currentImage === index ? 1 : 1.06})`,
                transition: 'opacity 0.8s ease, transform 1s ease',
              }}>
                <img src={image.src} alt={image.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(15,15,26,0.7) 100%)' }} />
              </div>
            ))}
            <div style={{ position: 'absolute', bottom: '1.2rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
              <div>
                <span style={{ display: 'inline-block', padding: '0.25rem 0.65rem', background: 'rgba(227,24,55,0.85)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>EVALUA</span>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: '500' }}>Speak. Practice. Excel.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={prevImage} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <ChevronLeft size={15} />
                </button>
                <button onClick={nextImage} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '1.2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.3rem', zIndex: 10 }}>
              {images.map((_, index) => (
                <button key={index} onClick={() => setCurrentImage(index)} style={{
                  width: currentImage === index ? '18px' : '6px', height: '6px', borderRadius: '3px',
                  background: currentImage === index ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              ))}
            </div>
          </div>

          {/* Bento Stat Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* CEFR Level - Accent Card */}
            <div style={{
              background: 'linear-gradient(135deg, #E31837, #B71C1C)', borderRadius: '20px',
              padding: '1.25rem', position: 'relative', overflow: 'hidden', color: '#fff',
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: '-10px', right: '20px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <Target size={20} style={{ opacity: 0.7, marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1' }}>B2</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '0.2rem', fontWeight: '500' }}>CEFR Level</div>
            </div>

            {/* Progress */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <TrendingUp size={18} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  <ArrowUpRight size={12} /> +12%
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.04em', lineHeight: '1' }}>78%</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', fontWeight: '500' }}>Overall Progress</div>
            </div>

            {/* Sessions */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.25rem',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '0.75rem' }}>
                <Clock size={18} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.04em', lineHeight: '1' }}>12</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', fontWeight: '500' }}>Sessions Completed</div>
            </div>

            {/* Best Score */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                  <Award size={18} />
                </div>
                <Star size={14} style={{ color: '#f97316' }} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.04em', lineHeight: '1' }}>85</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', fontWeight: '500' }}>Best Score</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Progress Chart */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.01em' }}>Progress Over Time</h3>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>Weekly score evolution</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: '600', color: '#22c55e' }}>
                  <Flame size={14} /> +30% growth
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={progressData}>
                  <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" vertical={false} />
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

            {/* Skills Breakdown */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.5rem',
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1.2rem', letterSpacing: '-0.01em' }}>Skills Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {skillsData.map((skill) => (
                  <div key={skill.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>{skill.name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: skill.color }}>{skill.score}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(0,0,0,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${skill.score}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}cc)`, borderRadius: '3px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Recent Evaluations */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e' }}>Recent Evaluations</h3>
                <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#E31837', cursor: 'pointer' }}>View all →</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { date: 'Feb 1', instructor: 'Dr. Smith', score: 85, level: 'B2', levelColor: '#22c55e' },
                  { date: 'Jan 28', instructor: 'Prof. Johnson', score: 78, level: 'B1+', levelColor: '#3b82f6' },
                  { date: 'Jan 20', instructor: 'Dr. Smith', score: 72, level: 'B1', levelColor: '#f97316' },
                ].map((ev, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 0.85rem', background: 'rgba(0,0,0,0.015)', borderRadius: '14px', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: `${ev.levelColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '0.7rem', color: ev.levelColor,
                      }}>{ev.level}</div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1a1a2e' }}>{ev.instructor}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{ev.date}, 2026</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1a1a2e' }}>{ev.score}</span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Zap size={16} style={{ color: '#E31837' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e' }}>AI Recommendations</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { icon: '💪', title: 'Strength: Vocabulary', desc: 'Excellent usage. Keep expanding with advanced terms.', bg: 'rgba(34,197,94,0.06)', accent: '#22c55e' },
                  { icon: '🎯', title: 'Improve: Pronunciation', desc: 'Focus on word stress patterns and intonation.', bg: 'rgba(249,115,22,0.06)', accent: '#f97316' },
                  { icon: '🚀', title: 'Next Goal: B2+', desc: "You're close! Focus on fluency in complex topics.", bg: 'rgba(227,24,55,0.04)', accent: '#E31837' },
                ].map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
                    padding: '0.85rem', background: rec.bg, borderRadius: '14px', borderLeft: `3px solid ${rec.accent}`,
                  }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{rec.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: rec.accent, marginBottom: '0.15rem' }}>{rec.title}</h4>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.5' }}>{rec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div style={{
            marginTop: '1.5rem', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
            borderRadius: '20px', padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(227,24,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={18} style={{ color: '#E31837' }} />
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '600' }}>Ready to practice?</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>Start a new recording session and get instant AI feedback</p>
              </div>
            </div>
            <button style={{
              padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #E31837, #B71C1C)',
              border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: '0 4px 20px rgba(227,24,55,0.3)', fontFamily: 'inherit',
            }}>
              Start Practice <ArrowUpRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
