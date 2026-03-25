export default function Filters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val || undefined });
  const clear = () => onChange({});
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Filter:</span>

      <select style={styles.select} value={filters.status || ""} onChange={(e) => set("status", e.target.value)}>
        <option value="">All Status</option>
        {["Pending", "In Progress", "Completed"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select style={styles.select} value={filters.category || ""} onChange={(e) => set("category", e.target.value)}>
        <option value="">All Categories</option>
        {["Tax", "Compliance", "Legal", "HR", "Regulatory", "Audit", "General"].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select style={styles.select} value={filters.priority || ""} onChange={(e) => set("priority", e.target.value)}>
        <option value="">All Priority</option>
        {["High", "Medium", "Low"].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {hasFilters && (
        <button style={styles.clearBtn} onClick={clear}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 11,
    color: "var(--muted)",
    fontFamily: "var(--mono)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  select: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 7,
    padding: "7px 12px",
    fontSize: 12,
    fontFamily: "var(--mono)",
    cursor: "pointer",
    colorScheme: "dark",
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid var(--border2)",
    color: "var(--muted)",
    borderRadius: 7,
    padding: "7px 12px",
    fontSize: 12,
    fontFamily: "var(--mono)",
    cursor: "pointer",
  },
};