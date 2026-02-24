import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Mic, FileText, Settings, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

const StudentSidebar = () => {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/logo.svg" alt="Logo" className={styles.logoIcon} />
        <span className={styles.logoText}>
          <span className={styles.letterRed}>E</span>
          <span className={styles.letterGrey}>V</span>
          <span className={styles.letterBlack}>A</span>
          <span className={styles.letterRed}>L</span>
          <span className={styles.letterGrey}>U</span>
          <span className={styles.letterBlack}>A</span>
        </span>
      </div>

      <nav className={styles.nav}>
        <NavLink 
          to="/student/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>{t('nav.dashboard')}</span>
        </NavLink>
        
        <NavLink 
          to="/student/practice" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Mic size={20} />
          <span>{t('nav.practice')}</span>
        </NavLink>
        
        <NavLink 
          to="/student/reports" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <FileText size={20} />
          <span>{t('nav.myReports')}</span>
        </NavLink>
        
        <NavLink 
          to="/student/settings" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Settings size={20} />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <NavLink to="/" className={styles.logoutButton}>
          <LogOut size={20} />
          <span>{t('nav.logout')}</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default StudentSidebar;
