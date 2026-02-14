import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, GraduationCap, Shield, Github, Mic } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Full response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (response.ok) {
        // Log the user object structure
        console.log('User object:', data.user);
        console.log('User role value:', data.user?.role);
        console.log('User role type:', typeof data.user?.role);
        
        // Check if user is active (double-check, though backend already does this)
        if (!data.user?.isActive) {
          setError('Your account has been deactivated. Please contact support.');
          setLoading(false);
          return;
        }
        
        // Store the token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Store remember me preference if checked
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        // Get the user role
        const userRole = data.user?.role;
        
        if (!userRole) {
          setError('No role found in user data');
          setLoading(false);
          return;
        }

        // Show success message
        alert(`Welcome back, ${data.user.firstName || 'User'}!`);
        
        // Navigate based on role with explicit mapping
        console.log('Attempting to navigate based on role:', userRole);
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          if (userRole === 'admin') {
            console.log('Navigating to admin dashboard');
            navigate('/admin/dashboard');
          } else if (userRole === 'instructor') {
            console.log('Navigating to teacher dashboard');
            navigate('/teacher/dashboard');
          } else if (userRole === 'student') {
            console.log('Navigating to student dashboard');
            navigate('/student/dashboard');
          } else {
            console.log('Unknown role:', userRole);
            setError(`Unknown user role: ${userRole}`);
          }
        }, 100);
        
      } else {
        // Handle error messages from backend
        console.log('Login failed with status:', response.status);
        console.log('Error data:', data);
        
        // Check for specific error messages
        if (response.status === 401) {
          // Check if it's an inactive account error
          if (data.message && data.message.includes('deactivated')) {
            setError('Your account has been deactivated. Please contact support.');
          } else {
            setError(data.message || 'Invalid email or password');
          }
        } else if (response.status === 400) {
          setError(data.message || 'Bad request');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Cannot connect to server. Please check if backend is running on port 3000');
    } finally {
      setLoading(false);
    }
  };

  // Roles for UI only - matches backend enum values
  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'instructor', label: 'Instructor', icon: User },
    { id: 'admin', label: 'Admin', icon: Shield },
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
            <h1>Welcome to<br />EVALUA Platform</h1>
            <p className={styles.welcomeSubtext}>
              AI-Powered Oral Performance Assessment
            </p>
          </div>

          <div className={styles.illustrationArea}>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureDot} />
                <span>AI-Powered Transcription & CEFR Analysis</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureDot} />
                <span>Real-time Practice with Instant Feedback</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureDot} />
                <span>Comprehensive Performance Analytics</span>
              </div>
            </div>
          </div>

          <p className={styles.tagline}>
            Efficiently assess and improve oral communication skills.
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
            <h2 className={styles.title}>Sign In</h2>
            <p className={styles.subtitle}>Please enter your details to sign in</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Role Selection - UI only, actual role comes from backend */}
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
              <label className={styles.label} htmlFor="email">Email</label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                  disabled={loading}
                />
                <Mail size={18} className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
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
                  disabled={loading}
                />
                <span>Remember Me</span>
              </label>
              <a 
                href="#" 
                className={styles.forgotLink} 
                onClick={(e) => {
                  e.preventDefault();
                  // Handle forgot password - you can implement this later
                  alert('Please contact support to reset your password');
                }}
              >
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>or continue with</span>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.socialButtons}>
              <button 
                type="button" 
                className={styles.socialButton}
                onClick={() => alert('GitHub login coming soon!')}
                disabled={loading}
              >
                <Github size={20} />
                <span>GitHub</span>
              </button>
              <button 
                type="button" 
                className={`${styles.socialButton} ${styles.googleButton}`}
                onClick={() => alert('Google login coming soon!')}
                disabled={loading}
              >
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
              Don&apos;t have an account? <a href="/signup">Create Account</a>
            </p>
          </form>
        </div>

        <footer className={styles.footer}>
          EVALUA © 2026
        </footer>
      </div>
    </div>
  );
};

export default Login;