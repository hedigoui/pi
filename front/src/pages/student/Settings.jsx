import StudentSidebar from '../../components/StudentSidebar';
import { User, Bell, Lock, Globe, Volume2 } from 'lucide-react';
import styles from '../../styles/shared.module.css';
import settingsStyles from './Settings.module.css';

const Settings = () => {
  return (
    <div className={styles.layout}>
      <StudentSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Settings</h1>
              <p className={styles.pageSubtitle}>Manage your account preferences</p>
            </div>
          </div>

          <div className={settingsStyles.settingsGrid}>
            {/* Profile Section */}
            <div className={styles.card}>
              <div className={settingsStyles.sectionHeader}>
                <User size={20} />
                <h3>Profile Information</h3>
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Full Name</label>
                <input type="text" defaultValue="Hedi Goui" className={settingsStyles.input} />
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Email</label>
                <input type="email" defaultValue="hedi@example.com" className={settingsStyles.input} />
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Language Level</label>
                <select className={settingsStyles.select}>
                  <option>A1 - Beginner</option>
                  <option>A2 - Elementary</option>
                  <option>B1 - Intermediate</option>
                  <option selected>B2 - Upper Intermediate</option>
                  <option>C1 - Advanced</option>
                  <option>C2 - Proficient</option>
                </select>
              </div>

              <button className={styles.primaryButton}>Save Changes</button>
            </div>

            {/* Notifications */}
            <div className={styles.card}>
              <div className={settingsStyles.sectionHeader}>
                <Bell size={20} />
                <h3>Notifications</h3>
              </div>
              
              <div className={settingsStyles.toggleItem}>
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive updates about your evaluations</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={settingsStyles.slider}></span>
                </label>
              </div>
              
              <div className={settingsStyles.toggleItem}>
                <div>
                  <h4>Practice Reminders</h4>
                  <p>Get reminded to practice regularly</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={settingsStyles.slider}></span>
                </label>
              </div>
              
              <div className={settingsStyles.toggleItem}>
                <div>
                  <h4>New Recommendations</h4>
                  <p>Notify when AI generates new tips</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" />
                  <span className={settingsStyles.slider}></span>
                </label>
              </div>
            </div>

            {/* Security */}
            <div className={styles.card}>
              <div className={settingsStyles.sectionHeader}>
                <Lock size={20} />
                <h3>Security</h3>
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" className={settingsStyles.input} />
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>New Password</label>
                <input type="password" placeholder="••••••••" className={settingsStyles.input} />
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••" className={settingsStyles.input} />
              </div>

              <button className={styles.secondaryButton}>Update Password</button>
            </div>

            {/* Preferences */}
            <div className={styles.card}>
              <div className={settingsStyles.sectionHeader}>
                <Globe size={20} />
                <h3>Preferences</h3>
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Interface Language</label>
                <select className={settingsStyles.select}>
                  <option selected>English</option>
                  <option>Français</option>
                  <option>العربية</option>
                </select>
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Target Language</label>
                <select className={settingsStyles.select}>
                  <option selected>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>German</option>
                </select>
              </div>

              <div className={settingsStyles.toggleItem}>
                <div>
                  <h4>Dark Mode</h4>
                  <p>Use dark theme</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={settingsStyles.slider}></span>
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
