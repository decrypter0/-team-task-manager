import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboard()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  const groups = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };
  const overdueCount = tasks.filter((t) => t.isOverdue).length;

  return (
    <div style={{ padding: 24 }}>
      <h2>My Dashboard</h2>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <strong>{tasks.length}</strong>
          <span>Total tasks</span>
        </div>
        <div style={styles.summaryCard}>
          <strong>{groups['in-progress'].length}</strong>
          <span>In progress</span>
        </div>
        <div style={{ ...styles.summaryCard, ...(overdueCount > 0 ? styles.overdueCard : {}) }}>
          <strong>{overdueCount}</strong>
          <span>Overdue</span>
        </div>
      </div>

      {Object.entries(groups).map(([status, list]) => (
        <div key={status} style={{ marginBottom: 24 }}>
          <h3 style={{ textTransform: 'capitalize' }}>{status.replace('-', ' ')} ({list.length})</h3>
          {list.length === 0 && <p style={{ color: '#94a3b8' }}>No tasks</p>}
          <div style={styles.list}>
            {list.map((t) => (
              <div key={t._id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{t.title}</strong>
                  {t.isOverdue && <span style={styles.overdue}>OVERDUE</span>}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                  Project: {t.project?.name}
                  {t.dueDate && ` · Due: ${new Date(t.dueDate).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  summary: { display: 'flex', gap: 16, marginBottom: 24 },
  summaryCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '12px 20px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 100,
  },
  overdueCard: { borderColor: '#dc2626', background: '#fef2f2' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 },
  card: { border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 },
  overdue: {
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: 4,
    height: 'fit-content',
  },
};
