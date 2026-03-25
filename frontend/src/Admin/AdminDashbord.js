import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../API";
import "../Admin/css/Admindashbord.css";
  
import { 
  Users, BookOpen, CreditCard, UserPlus, Bell 
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const Admindashbord = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
  total_students: 0,
  total_courses: 0,
  total_quizzes: 0, // අලුතින් එක් කළා
  total_enrollments: 0,
  approved_enrollments: 0,
  pending_enrollments: 0,
  approved_quiz_enrollmnts: 0, // අලුතින් එක් කළා
  pending_quiz_enrollmnts: 0  // අලුතින් එක් කළා
});
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("/admin/dashboard-stats");
        setCounts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };
    fetchStats();

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = [
  { title: 'Total Students', count: counts.total_students, icon: <Users />, color: '#2563eb' },
  { title: 'Courses', count: counts.total_courses, icon: <BookOpen />, color: '#4f46e5' },
  { title: 'Quizzes', count: counts.total_quizzes, icon: <BookOpen />, color: '#4f46e5' },
  { title: 'Pending Course Approvals', count: counts.pending_enrollments, icon: <CreditCard />, color: '#ef4444', clickable: true },
  { title: 'Total Course Enrollments', count: counts.total_enrollments, icon: <UserPlus />, color: '#f97316' },
  { title: 'Pending Quiz Approvals', count: counts.pending_quiz_enrollmnts, icon: <CreditCard />, color: '#ef4444', clickable: true },
  { title: 'Total Quiz Enrollments', count: counts.approved_quiz_enrollmnts, icon: <UserPlus />, color: '#f97316' },
];

  const enrollmentData = [
    { name: 'Jan', students: 40 }, { name: 'Feb', students: 120 },
    { name: 'Mar', students: 500 }, { name: 'Apr', students: 300 },
    { name: 'May', students: 450 },
  ];

  if (loading) return <div className="loading-screen">දත්ත පූරණය වෙමින් පවතී...</div>;

  return (
    <div className="admin-dashboard-wrapper">
      <main className="admin-main-content">
        <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffcc00' }}>System Overview</h1>
          
          <div className="notification-container" ref={notificationRef} style={{ position: 'relative' }}>
            <button 
              className="notification-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
              <Bell color="#ffcc00" size={28} />
              {counts.pending_enrollments > 0 && (
                <span style={{ position: 'absolute', top: '0', right: '0', backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' }}>
                  {counts.pending_enrollments}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown" style={{
                position: 'absolute', top: '50px', right: '0', backgroundColor: 'white', 
                color: '#333', width: '250px', padding: '15px', borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100
              }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>Pending Enrollment Requests = {counts.pending_enrollments}</p>
                <button 
                  onClick={() => navigate('/enrollment-req')}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#002347', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  View All Requests
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="stats-grid">
  {stats.map((item, idx) => (
    <div 
      key={idx} 
      className="stat-card" 
      onClick={() => {
        if (item.clickable) {
          // Title එක අනුව Navigate විය යුතු පිටුව තීරණය කරයි
          if (item.title === 'Pending Quiz Approvals') {
            navigate('/quizenrollment-req');
          } else {
            navigate('/enrollment-req');
          }
        }
      }}
      style={{ cursor: item.clickable ? 'pointer' : 'default' }}
    >
      <div className="stat-icon" style={{ backgroundColor: item.color }}>{item.icon}</div>
      <div className="stat-info">
        <p>{item.title}</p>
        <h2>{item.count}</h2>
      </div>
    </div>
  ))}
</div>
        

        <div className="dashboard-grid">
          <div className="card-panel">
            <h3 className="card-title">Enrollment Trend</h3>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="#002347" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card-panel">
            <h3 className="card-title">Quick Status</h3>
            <div className="status-box status-pending">
              <span>Pending Approvals</span>
              <span className="count">{counts.pending_enrollments}</span>
            </div>
            <div className="status-box status-approved">
              <span>Approved Total</span>
              <span className="count">{counts.approved_enrollments}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admindashbord;