import { useState } from "react";
import { updateTask, deleteTask } from "../api";

const STATUS_COLORS = {
  Completed: { bg: "rgba(52,211,126,0.12)", color: "var(--green)", border: "rgba(52,211,126,0.3)" },
  "In Progress": { bg: "rgba(245,200,66,0.12)", color: "var(--yellow)", border: "rgba(245,200,66,0.3)" },
  Pending: { bg: "rgba(107,115,148,0.12)", color: "var(--muted)", border: "rgba(107,115,148,0.3)" },
  Overdue: { bg: "rgba(240,82,82,0.12)", color: "var(--red)", border: "rgba(240,82,82,0.3)" },
};

const PRIORITY_COLORS = {
  High: "var(--red)",
  Medium: "var(--yellow)",
  Low: "var(--green)",
};

function getEffectiveStatus(task) {
  const today = new Date().toISOString().split("T")[0];
  if (task.status !== "Completed" && task.due_date < today) return "Overdue";
  return task.status;
}

export default function TaskList({ tasks, loading, refresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatus = (task, status) => {
    setUpdatingId(task.id);
    updateTask(task.id, { status })
      .then(refresh)
      .finally(() => setUpdatingId(null));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this task?")) return;
    deleteTask(id).then(refresh);
  };

  if (loading) {
    return (
      <div style={styles.loadingRow}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={{ fontSize: 32 }}>📋</span>
        <p>No tasks found. Add one above!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {tasks.map((task) => {
        const effStatus = getEffectiveStatus(task);
        const sc = STATUS_COLORS[effStatus] || STATUS_COLORS.Pending;
        const isExpanded = expandedId === task.id;
        const today = new Date().toISOString().split("T")[0];
        const daysLeft = Math.round(
          (new Date(task.due_date) - new Date(today)) / (1000 * 60 * 60 * 24)
        );

        return (
          <div
            key={task.id}
            style={{
              ...styles.card,
              ...(effStatus === "Overdue" ? styles.cardOverdue : {}),
            }}
          >
            <div style={styles.cardMain} onClick={() => setExpandedId(isExpanded ? null : task.id)}>
              {/* Priority bar */}
              <div
                style={{
                  ...styles.priorityBar,
                  background: PRIORITY_COLORS[task.priority] || "var(--muted)",
                }}
              />

              <div style={styles.cardContent}>
                <div style={styles.cardTop}>
                  <span style={styles.cardTitle}>{task.title}</span>
                  <div style={styles.cardRight}>
                    <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {effStatus}
                    </span>
                    <span style={styles.chevron}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                <div style={styles.cardMeta}>
                  <span style={styles.metaChip}>📁 {task.category}</span>
                  <span style={styles.metaChip}>
                    🗓 {task.due_date}
                    {task.status !== "Completed" && (
                      <span style={{ color: daysLeft < 0 ? "var(--red)" : daysLeft <= 3 ? "var(--orange)" : "var(--muted)", marginLeft: 5 }}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </span>
                    )}
                  </span>
                  <span style={{ ...styles.metaChip, color: PRIORITY_COLORS[task.priority] }}>
                    ● {task.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div style={styles.expanded}>
                {task.description && (
                  <p style={styles.description}>{task.description}</p>
                )}
                <div style={styles.actions}>
                  <span style={styles.actionsLabel}>Update status:</span>
                  {["Pending", "In Progress", "Completed"].map((s) => (
                    <button
                      key={s}
                      style={{
                        ...styles.actionBtn,
                        ...(task.status === s ? styles.actionBtnActive : {}),
                        opacity: updatingId === task.id ? 0.5 : 1,
                      }}
                      onClick={() => handleStatus(task, s)}
                      disabled={updatingId === task.id || task.status === s}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(task.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  loadingRow: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  skeleton: {
    height: 72,
    background: "var(--surface)",
    borderRadius: "var(--radius)",
    animation: "pulse 1.4s ease-in-out infinite",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "48px 0",
    color: "var(--muted)",
    fontSize: 14,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    transition: "border-color 0.15s",
  },
  cardOverdue: {
    borderColor: "rgba(240,82,82,0.3)",
    background: "rgba(240,82,82,0.04)",
  },
  cardMain: {
    display: "flex",
    alignItems: "stretch",
    cursor: "pointer",
  },
  priorityBar: {
    width: 4,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 14,
    color: "var(--text)",
  },
  cardRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  statusBadge: {
    fontSize: 11,
    fontFamily: "var(--mono)",
    padding: "2px 10px",
    borderRadius: 99,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  chevron: {
    color: "var(--muted)",
    fontSize: 10,
  },
  cardMeta: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  metaChip: {
    fontSize: 11,
    color: "var(--muted)",
    fontFamily: "var(--mono)",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  expanded: {
    borderTop: "1px solid var(--border)",
    padding: "14px 20px",
    background: "var(--surface2)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  description: {
    fontSize: 13,
    color: "var(--muted)",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  actionsLabel: {
    fontSize: 11,
    color: "var(--muted)",
    fontFamily: "var(--mono)",
    marginRight: 4,
  },
  actionBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border2)",
    color: "var(--muted)",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    fontFamily: "var(--sans)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  actionBtnActive: {
    background: "var(--accent-glow)",
    border: "1px solid var(--accent)",
    color: "var(--accent)",
  },
  deleteBtn: {
    marginLeft: "auto",
    background: "transparent",
    border: "1px solid rgba(240,82,82,0.3)",
    color: "var(--red)",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    fontFamily: "var(--sans)",
    fontWeight: 600,
    cursor: "pointer",
  },
};