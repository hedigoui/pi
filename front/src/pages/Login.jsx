import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, User, GraduationCap, Shield, Github, Mic } from 'lucide-react';
import { useSetPageActions } from '../context/VoiceActionsContext';
import styles from './Login.module.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const setPageActions = useSetPageActions();

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (selectedRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (selectedRole === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    },
    [navigate, selectedRole]
  );

  useEffect(() => {
    setPageActions({
      focusEmail: () => emailInputRef.current?.focus(),
      focusPassword: () => passwordInputRef.current?.focus(),
      setEmail: (text) => setEmail(text),
      setPassword: (text) => setPassword(text),
      submit: () => handleSubmit({ preventDefault: () => {} }),
      setRole: (role) => setSelectedRole(role),
    });
    return () => setPageActions({});
  }, [setPageActions, handleSubmit]);

  const roles = [
    { id: 'student', label: t('login.roles.student'), icon: GraduationCap },
    { id: 'teacher', label: t('login.roles.teacher'), icon: User },
    { id: 'admin', label: t('login.roles.admin'), icon: Shield },
  ];

  return (
    <div className={styles.container}>
      {/* Left Branded Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brandLogo}>
            <div className={styles.logoCircle}>
              <Mic size={28} color="#fff" />
            </div>
            <span className={styles.logoText}>
              <span className={styles.letterWhite}>E</span>
              <span className={styles.letterLight}>V</span>
              <span className={styles.letterWhite}>A</span>
              <span className={styles.letterLight}>L</span>
              <span className={styles.letterWhite}>U</span>
              <span className={styles.letterLight}>A</span>
            </span>
          </div>

          <div className={styles.welcomeText}>
            <h1>{t('login.welcome')}<br />{t('login.welcomeBreak')}</h1>
            <p className={styles.welcomeSubtext}>
              {t('login.subtext')}
            </p>
          </div>

          <div className={styles.illustrationArea}>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureDot} />
                <span>{t('login.feature1')}</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureDot} />
                <span>{t('login.feature2')}</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureDot} />
                <span>{t('login.feature3')}</span>
              </div>
            </div>
          </div>

          <p className={styles.tagline}>
            {t('login.tagline')}
          </p>
        </div>

        {/* Decorative circles */}
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>

      {/* Right Form Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2 className={styles.title}>{t('login.title')}</h2>
            <p className={styles.subtitle}>{t('login.subtitle')}</p>
          </div>

          {/* Role Selection */}
          <div className={styles.roleSelector}>
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`${styles.roleButton} ${selectedRole === role.id ? styles.activeRole : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <role.icon size={16} />
                <span>{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="email">{t('login.email')}</label>
              <div className={styles.inputWrapper}>
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  aria-label="Email"
                />
                <Mail size={18} className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">{t('login.password')}</label>
              <div className={styles.inputWrapper}>
                <input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  aria-label="Password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>{t('login.rememberMe')}</span>
              </label>
              <a href="#" className={styles.forgotLink}>{t('login.forgotPassword')}</a>
            </div>

            <button type="submit" className={styles.loginButton}>
              {t('login.loginButton')}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>{t('login.orContinueWith')}</span>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.socialButtons}>
              <button type="button" className={styles.socialButton}>
                <Github size={20} />
                <span>GitHub</span>
              </button>
              <button type="button" className={`${styles.socialButton} ${styles.googleButton}`}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
            </div>

            <p className={styles.signupLink}>
              {t('login.noAccount')} <a href="#">{t('login.createAccount')}</a>
            </p>
          </form>
        </div>

        <footer className={styles.footer}>
          {t('footer.copyright')}
        </footer>
      </div>
    </div>
  );
};

export default Login;
