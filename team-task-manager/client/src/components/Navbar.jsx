import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.logo}>Team Task Manager</Link>
        {user && (
          <>
            <Link to="/projects" style={styles.link}>Projects</Link>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          </>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={styles.userInfo}>{user.name} ({user.role})</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.link}>Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#1e293b',
    color: 'white',
  },
  left: { display: 'flex', alignItems: 'center', gap: 20 },
  logo: { color: 'white', fontWeight: 'bold', textDecoration: 'none', fontSize: 18 },
  link: { color: '#cbd5e1', textDecoration: 'none', marginRight: 16 },
  userInfo: { marginRight: 12, color: '#94a3b8' },
  button: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
  },
};
