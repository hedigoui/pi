import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, ClipboardCheck, FileText, Settings, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

const TeacherSidebar = () => {
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
          to="/teacher/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>{t('nav.dashboard')}</span>
        </NavLink>
        
        <NavLink 
          to="/teacher/students" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Users size={20} />
          <span>{t('nav.students')}</span>
        </NavLink>
        
        <NavLink 
          to="/teacher/evaluate" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <ClipboardCheck size={20} />
          <span>{t('nav.evaluate')}</span>
        </NavLink>
        
        <NavLink 
          to="/teacher/reports" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <FileText size={20} />
          <span>{t('nav.reports')}</span>
        </NavLink>
        
        <NavLink 
          to="/teacher/settings" 
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

export default TeacherSidebar;
