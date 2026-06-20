import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // create-task form state (admin only)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadAll();
  }, [id]);

  async function loadAll() {
    setLoading(true);
    try {
      const [allProjects, taskList] = await Promise.all([
        api.getProjects(),
        api.getTasks(id),
      ]);
      const proj = allProjects.find((p) => p._id === id);
      setProject(proj);
      setTasks(taskList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createTask({
        title,
        description,
        project: id,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      await api.updateTask(taskId, { status });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(taskId) {
    try {
      await api.deleteTask(taskId);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!project) return <p style={{ padding: 24 }}>Project not found.</p>;

  const isAdmin = user.role === 'admin';

  return (
    <div style={{ padding: 24 }}>
      <h2>{project.name}</h2>
      <p style={{ color: '#64748b' }}>{project.description}</p>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {isAdmin && (
        <form onSubmit={handleCreateTask} style={styles.form}>
          <h3>Create Task</h3>
          <input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            style={styles.input}
          >
            <option value="">Unassigned</option>
            {project.members?.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Add Task</button>
        </form>
      )}

      <div style={styles.list}>
        {tasks.length === 0 && <p>No tasks yet.</p>}
        {tasks.map((t) => {
          const isOverdue =
            t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date();
          const canEdit = isAdmin || t.assignedTo?._id === user.id;

          return (
            <div key={t._id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0 }}>{t.title}</h4>
                {isOverdue && <span style={styles.overdue}>OVERDUE</span>}
              </div>
              {t.description && <p style={{ color: '#64748b', margin: '4px 0' }}>{t.description}</p>}
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0' }}>
                Assigned to: {t.assignedTo?.name || 'Unassigned'}
                {t.dueDate && ` · Due: ${new Date(t.dueDate).toLocaleDateString()}`}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                {canEdit ? (
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    style={styles.statusSelect}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span style={styles.statusBadge}>{t.status}</span>
                )}
                {isAdmin && (
                  <button onClick={() => handleDelete(t._id)} style={styles.deleteButton}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 400,
    border: '1px solid #e2e8f0',
    padding: 16,
    borderRadius: 6,
    marginBottom: 24,
  },
  input: { padding: 8, border: '1px solid #cbd5e1', borderRadius: 4 },
  button: {
    padding: 10,
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginTop: 8,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 },
  card: { border: '1px solid #e2e8f0', borderRadius: 6, padding: 14 },
  overdue: {
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: 4,
    height: 'fit-content',
  },
  statusSelect: { padding: 6, borderRadius: 4, border: '1px solid #cbd5e1' },
  statusBadge: {
    background: '#e2e8f0',
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 13,
  },
  deleteButton: {
    background: 'transparent',
    color: '#dc2626',
    border: '1px solid #dc2626',
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
  },
};
