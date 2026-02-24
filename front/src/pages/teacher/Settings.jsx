import TeacherSidebar from '../../components/TeacherSidebar';
import { User, Bell, Lock, Volume2 } from 'lucide-react';
import styles from '../../styles/shared.module.css';
import settingsStyles from '../student/Settings.module.css';

const Settings = () => {
  return (
    <div className={styles.layout}>
      <TeacherSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Settings</h1>
              <p className={styles.pageSubtitle}>Manage your account and preferences</p>
            </div>
          </div>

          <div className={settingsStyles.settingsGrid}>
            {/* Profile */}
            <div className={styles.card}>
              <div className={settingsStyles.sectionHeader}>
                <User size={20} />
                <h3>Profile Information</h3>
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Full Name</label>
                <input type="text" defaultValue="Dr. John Smith" className={settingsStyles.input} />
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Email</label>
                <input type="email" defaultValue="john.smith@example.com" className={settingsStyles.input} />
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Department</label>
                <input type="text" defaultValue="Language Studies" className={settingsStyles.input} />
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
                  <h4>New Submissions</h4>
                  <p>Notify when students submit recordings</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={settingsStyles.slider}></span>
                </label>
              </div>
              
              <div className={settingsStyles.toggleItem}>
                <div>
                  <h4>AI Analysis Complete</h4>
                  <p>Notify when AI finishes analysis</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={settingsStyles.slider}></span>
                </label>
              </div>
              
              <div className={settingsStyles.toggleItem}>
                <div>
                  <h4>Weekly Reports</h4>
                  <p>Receive weekly summary emails</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" />
                  <span className={settingsStyles.slider}></span>
                </label>
              </div>
            </div>

            {/* Evaluation Defaults */}
            <div className={styles.card}>
              <div className={settingsStyles.sectionHeader}>
                <Volume2 size={20} />
                <h3>Evaluation Defaults</h3>
              </div>
              
              <div className={settingsStyles.formGroup}>
                <label>Default Target Level</label>
                <select className={settingsStyles.select}>
                  <option>A1 - Beginner</option>
                  <option>A2 - Elementary</option>
                  <option>B1 - Intermediate</option>
                  <option selected>B2 - Upper Intermediate</option>
                  <option>C1 - Advanced</option>
                  <option>C2 - Proficient</option>
                </select>
              </div>
              
              <div className={settingsStyles.toggleItem}>
                <div>
                  <h4>Auto-include AI Score</h4>
                  <p>Automatically combine AI evaluation</p>
                </div>
                <label className={settingsStyles.toggle}>
                  <input type="checkbox" defaultChecked />
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
