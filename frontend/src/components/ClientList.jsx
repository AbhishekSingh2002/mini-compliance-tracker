import { useState } from "react";
import { createClient } from "../api";

export default function ClientList({ clients, selected, onSelect, onClientsUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company_name: "", country: "", entity_type: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    if (!form.company_name.trim()) return;
    setSaving(true);
    createClient(form)
      .then(() => {
        setForm({ company_name: "", country: "", entity_type: "" });
        setShowForm(false);
        onClientsUpdated();
      })
      .finally(() => setSaving(false));
  };

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionLabel}>Clients</span>
        <button style={styles.iconBtn} onClick={() => setShowForm(!showForm)} title="Add client">
          {showForm ? "✕" : "+"}
        </button>
      </div>

      {showForm && (
        <div style={styles.addForm}>
          <input
            style={styles.input}
            placeholder="Company name *"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          <select
            style={styles.input}
            value={form.entity_type}
            onChange={(e) => setForm({ ...form, entity_type: e.target.value })}
          >
            <option value="">Entity type</option>
            {["Private", "Public", "Corporation", "LLP", "Partnership", "Sole Proprietor"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button style={styles.saveBtn} onClick={handleAdd} disabled={saving}>
            {saving ? "Saving…" : "Add Client"}
          </button>
        </div>
      )}

      <div style={styles.list}>
        {clients.length === 0 && (
          <p style={styles.empty}>No clients yet</p>
        )}
        {clients.map((c) => {
          const isActive = selected?.id === c.id;
          return (
            <div
              key={c.id}
              style={{ ...styles.item, ...(isActive ? styles.itemActive : {}) }}
              onClick={() => onSelect(c)}
            >
              <div style={{ ...styles.avatar, background: isActive ? "var(--accent)" : "var(--surface2)" }}>
                {c.company_name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.itemInfo}>
                <span style={styles.itemName}>{c.company_name}</span>
                <span style={styles.itemMeta}>{c.country || "—"} · {c.entity_type || "—"}</span>
              </div>
              {isActive && <span style={styles.dot} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 10px",
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--muted)",
    fontFamily: "var(--mono)",
  },
  iconBtn: {
    background: "var(--surface2)",
    color: "var(--text)",
    width: 26,
    height: 26,
    borderRadius: 6,
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid var(--border2)",
    cursor: "pointer",
  },
  addForm: {
    padding: "0 14px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  input: {
    background: "var(--surface2)",
    border: "1px solid var(--border2)",
    color: "var(--text)",
    borderRadius: 6,
    padding: "7px 10px",
    fontSize: 12,
    width: "100%",
  },
  saveBtn: {
    background: "var(--accent)",
    color: "#fff",
    borderRadius: 6,
    padding: "7px",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "var(--sans)",
    marginTop: 2,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "0 10px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "background 0.15s",
    position: "relative",
  },
  itemActive: {
    background: "var(--accent-glow)",
    border: "1px solid rgba(91,106,240,0.25)",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text)",
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  itemName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemMeta: {
    fontSize: 10,
    color: "var(--muted)",
    fontFamily: "var(--mono)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--accent)",
    flexShrink: 0,
  },
  empty: {
    color: "var(--muted)",
    fontSize: 12,
    textAlign: "center",
    padding: "20px 0",
  },
};