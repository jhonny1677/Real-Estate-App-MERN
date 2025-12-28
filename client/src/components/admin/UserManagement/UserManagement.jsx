import { useEffect, useState } from "react";
import apiRequest from "../../../lib/apiRequest";
import Avatar from "../../Avatar/Avatar";
import toast from "react-hot-toast";
import "./UserManagement.scss";

const ROLES = ["user", "agent", "admin"];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiRequest.get("/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, data) => {
    try {
      const res = await apiRequest.put(`/admin/users/${id}`, data);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...res.data } : u));
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    }
  };

  const deleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await apiRequest.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter ||
                        (filter === "banned" && u.isBanned);
    return matchSearch && matchFilter;
  });

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading users…</div>;

  return (
    <div className="user-management">
      <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text" placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "200px", padding: "8px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none" }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}>
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="agent">Agents</option>
          <option value="admin">Admins</option>
          <option value="banned">Banned</option>
        </select>
        <span style={{ alignSelf: "center", color: "#888", fontSize: "14px" }}>{filtered.length} users</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f9f9f9", borderBottom: "2px solid #eee" }}>
              {["User", "Email", "Role", "Listings", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f0f0f0", opacity: user.isBanned ? 0.6 : 1 }}>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Avatar src={user.avatar} username={user.username} size={30} />
                    <span style={{ fontWeight: 500 }}>{user.username}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 12px", color: "#666" }}>{user.email}</td>
                <td style={{ padding: "10px 12px" }}>
                  <select value={user.role} onChange={e => updateUser(user.id, { role: e.target.value })}
                    style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", cursor: "pointer" }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>{user._count?.posts || 0}</td>
                <td style={{ padding: "10px 12px" }}>
                  <button onClick={() => updateUser(user.id, { isBanned: !user.isBanned })}
                    style={{ padding: "3px 10px", borderRadius: "6px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: 500,
                      background: user.isBanned ? "#fef2f2" : "#f0fdf4",
                      color: user.isBanned ? "#dc2626" : "#16a34a",
                      borderColor: user.isBanned ? "#fca5a5" : "#86efac" }}>
                    {user.isBanned ? "Banned" : "Active"}
                  </button>
                </td>
                <td style={{ padding: "10px 12px", color: "#888", whiteSpace: "nowrap" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <button onClick={() => deleteUser(user.id, user.username)}
                    style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", fontWeight: 500 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#888" }}>No users match your search.</div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
