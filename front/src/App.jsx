import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentPractice from './pages/student/Practice';
import StudentReports from './pages/student/Reports';
import StudentSettings from './pages/student/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherStudents from './pages/teacher/Students';
import TeacherEvaluate from './pages/teacher/Evaluate';
import TeacherReports from './pages/teacher/Reports';
import TeacherSettings from './pages/teacher/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/practice" element={<StudentPractice />} />
        <Route path="/student/reports" element={<StudentReports />} />
        <Route path="/student/settings" element={<StudentSettings />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/students" element={<TeacherStudents />} />
        <Route path="/teacher/evaluate" element={<TeacherEvaluate />} />
        <Route path="/teacher/evaluate/:studentId" element={<TeacherEvaluate />} />
        <Route path="/teacher/reports" element={<TeacherReports />} />
        <Route path="/teacher/settings" element={<TeacherSettings />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </Router>
  );
}

export default App;

