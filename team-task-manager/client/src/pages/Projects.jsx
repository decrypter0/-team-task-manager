import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
    if (user.role === 'admin') loadUsers();
  }, []);

  async function loadProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const data = await api.getUsers();
      setUsers(data.filter((u) => u._id !== user.id));
    } catch (err) {
      // non-fatal, member selection just won't populate
      console.error(err);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createProject({ name, description, memberIds: selectedMembers });
      setName('');
      setDescription('');
      setSelectedMembers([]);
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleMember(id) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Projects</h2>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {user.role === 'admin' && (
        <form onSubmit={handleCreate} style={styles.form}>
          <h3>Create Project</h3>
          <input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />
          {users.length > 0 && (
            <div>
              <p style={{ marginBottom: 4 }}>Add members:</p>
              {users.map((u) => (
                <label key={u._id} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                  />
                  {u.name} ({u.email})
                </label>
              ))}
            </div>
          )}
          <button type="submit" style={styles.button}>Create</button>
        </form>
      )}

      <div style={styles.list}>
        {projects.length === 0 && <p>No projects yet.</p>}
        {projects.map((p) => (
          <Link to={`/projects/${p._id}`} key={p._id} style={styles.card}>
            <h3 style={{ margin: '0 0 6px' }}>{p.name}</h3>
            <p style={{ margin: 0, color: '#64748b' }}>{p.description}</p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Owner: {p.owner?.name} · {p.members?.length || 0} member(s)
            </p>
          </Link>
        ))}
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
  checkboxLabel: { display: 'block', fontSize: 14 },
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
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 14,
    textDecoration: 'none',
    color: 'inherit',
  },
};
