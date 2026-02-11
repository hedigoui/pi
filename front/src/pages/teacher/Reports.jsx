import TeacherSidebar from '../../components/TeacherSidebar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Download, ClipboardCheck, TrendingUp, Award, BookOpen, ArrowUpRight, Users, Medal } from 'lucide-react';
import styles from '../../styles/shared.module.css';

const monthlyData = [
  { month: 'Sep', evaluations: 42, avgScore: 72 },
  { month: 'Oct', evaluations: 38, avgScore: 74 },
  { month: 'Nov', evaluations: 45, avgScore: 73 },
  { month: 'Dec', evaluations: 50, avgScore: 76 },
  { month: 'Jan', evaluations: 55, avgScore: 78 },
  { month: 'Feb', evaluations: 50, avgScore: 80 },
];

const topStudents = [
  { rank: 1, name: 'Alice Martin', from: 58, to: 82, improvement: '+24', avatar: 'AM', medal: '🥇' },
  { rank: 2, name: 'James Wilson', from: 61, to: 83, improvement: '+22', avatar: 'JW', medal: '🥈' },
  { rank: 3, name: 'Sophie Brown', from: 65, to: 85, improvement: '+20', avatar: 'SB', medal: '🥉' },
  { rank: 4, name: 'Liam Davis', from: 59, to: 77, improvement: '+18', avatar: 'LD', medal: '' },
  { rank: 5, name: 'Emma Thomas', from: 63, to: 79, improvement: '+16', avatar: 'ET', medal: '' },
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
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#fff', fontSize: '0.82rem', fontWeight: '700' }}>
            {p.name === 'evaluations' ? `${p.value} evaluations` : `Avg: ${p.value}/100`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  return (
    <div className={styles.layout}>
      <TeacherSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#E31837', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reports</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
                Evaluation Reports
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.3rem' }}>Detailed overview of your evaluation activity</p>
            </div>
            <button style={{
              padding: '0.6rem 1.2rem', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px', color: '#64748b', fontWeight: '600', fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'inherit',
            }}>
              <Download size={16} /> Export Report
            </button>
          </div>

          {/* Stat Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Total Evaluations - accent */}
            <div style={{
              background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', borderRadius: '20px',
              padding: '1.35rem', position: 'relative', overflow: 'hidden', color: '#fff',
            }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '55px', height: '55px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                <ClipboardCheck size={16} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1' }}>280</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '0.35rem' }}>Total Evaluations</div>
            </div>

            {/* Avg Score */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.35rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <TrendingUp size={16} />
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.08)', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>+3.5</span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1a1a2e', marginTop: '0.6rem', letterSpacing: '-0.04em', lineHeight: '1' }}>76.5</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>Average Score</div>
            </div>

            {/* Avg CEFR */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.35rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(227,24,55,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E31837' }}>
                  <Award size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1a1a2e', marginTop: '0.6rem', letterSpacing: '-0.04em', lineHeight: '1' }}>B1+</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>Avg CEFR Level</div>
            </div>

            {/* Improvement */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.35rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <BookOpen size={16} />
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.08)', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>↑ avg</span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1a1a2e', marginTop: '0.6rem', letterSpacing: '-0.04em', lineHeight: '1' }}>+15%</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>Avg Improvement</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Bar Chart - Monthly Evaluations */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e' }}>Monthly Evaluations</h3>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>Number of evaluations per month</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barSize={28}>
                  <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E31837" />
                      <stop offset="100%" stopColor="#E31837" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="evaluations" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart - Avg Score Trend */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e' }}>Average Score Trend</h3>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>Student average over time</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: '600', color: '#22c55e' }}>
                  <ArrowUpRight size={14} /> +8
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} domain={[65, 85]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2.5} name="avgScore"
                    dot={{ fill: '#fff', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Improving Students */}
          <div style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Medal size={16} style={{ color: '#f59e0b' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e' }}>Top Improving Students</h3>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#E31837', cursor: 'pointer' }}>View all →</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topStudents.map((s) => (
                <div key={s.rank} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.015)', borderRadius: '14px',
                  borderLeft: s.rank <= 3 ? '3px solid' : '3px solid transparent',
                  borderLeftColor: s.rank === 1 ? '#f59e0b' : s.rank === 2 ? '#94a3b8' : s.rank === 3 ? '#cd7f32' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>{s.medal || `#${s.rank}`}</span>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: `linear-gradient(135deg, ${s.rank <= 3 ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.04)'}, ${s.rank <= 3 ? 'rgba(245,158,11,0.04)' : 'rgba(0,0,0,0.02)'})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '0.72rem', color: s.rank <= 3 ? '#f59e0b' : '#64748b',
                    }}>{s.avatar}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a1a2e' }}>{s.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Score: {s.from} → {s.to}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Mini progress bar */}
                    <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)' }}>
                      <div style={{
                        width: `${((s.to - s.from) / 30) * 100}%`, height: '100%', borderRadius: '3px',
                        background: s.rank <= 3 ? 'linear-gradient(90deg, #f59e0b, #eab308)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.82rem', fontWeight: '800',
                      color: '#22c55e',
                    }}>{s.improvement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', borderRadius: '18px',
            padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>Active Students</span>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.85rem' }}>48</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>This Month</span>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.85rem' }}>50 evaluations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>Avg Score</span>
              <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.85rem' }}>80/100</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
