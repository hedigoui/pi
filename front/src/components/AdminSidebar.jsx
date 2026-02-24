import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

const AdminSidebar = () => {
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
          to="/admin/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>{t('nav.dashboard')}</span>
        </NavLink>
        
        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Users size={20} />
          <span>{t('nav.users')}</span>
        </NavLink>
        
        <NavLink 
          to="/admin/reports" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <FileText size={20} />
          <span>{t('nav.reports')}</span>
        </NavLink>
        
        <NavLink 
          to="/admin/settings" 
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

export default AdminSidebar;
