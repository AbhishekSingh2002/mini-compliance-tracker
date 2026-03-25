import { useState } from "react";
import { addTask } from "../api";

const CATEGORIES = ["Tax", "Compliance", "Legal", "HR", "Regulatory", "Audit", "General"];
const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES = ["Pending", "In Progress", "Completed"];

export default function AddTask({ clientId, refresh }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    due_date: "",
    status: "Pending",
    priority: "Medium",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.title.trim()) return setError("Title is required");
    if (!form.due_date) return setError("Due date is required");
    setError("");
    setSaving(true);
    addTask({ ...form, client_id: clientId })
      .then(() => {
        setForm({ title: "", description: "", category: "General", due_date: "", status: "Pending", priority: "Medium" });
        refresh();
      })
      .catch(() => setError("Failed to add task. Try again."))
      .finally(() => setSaving(false));
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>New Task</h3>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Title *</label>
          <input
            style={styles.input}
            placeholder="e.g. GST Filing Q2"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Due Date *</label>
          <input
            type="date"
            style={styles.input}
            value={form.due_date}
            onChange={(e) => set("due_date", e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select style={styles.input} value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Priority</label>
          <select style={styles.input} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Status</label>
          <select style={styles.input} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <textarea
          style={{ ...styles.input, height: 72, resize: "vertical" }}
          placeholder="Optional notes about this task..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <button style={styles.submitBtn} onClick={handleSubmit} disabled={saving}>
        {saving ? "Adding…" : "Add Task →"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    background: "var(--surface)",
    border: "1px solid var(--border2)",
    borderRadius: "var(--radius)",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  heading: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text)",
    letterSpacing: "0.04em",
  },
  error: {
    fontSize: 12,
    color: "var(--red)",
    background: "rgba(240,82,82,0.08)",
    border: "1px solid rgba(240,82,82,0.2)",
    borderRadius: 6,
    padding: "6px 12px",
    fontFamily: "var(--mono)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 11,
    color: "var(--muted)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: "var(--mono)",
  },
  input: {
    background: "var(--surface2)",
    border: "1px solid var(--border2)",
    color: "var(--text)",
    borderRadius: 7,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "var(--mono)",
    width: "100%",
    colorScheme: "dark",
  },
  submitBtn: {
    background: "var(--accent)",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 24px",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "var(--sans)",
    alignSelf: "flex-start",
    transition: "opacity 0.15s",
    letterSpacing: "0.04em",
  },
};