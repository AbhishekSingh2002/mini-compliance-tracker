import { useEffect, useState, useMemo } from "react";
import { getClients, getTasks, getStats } from "./api";
import ClientList from "./components/ClientList";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";
import Filters from "./components/Filters";
import SearchSort from "./components/SearchSort";
import StatsChart from "./components/StatsChart";

const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };
const STATUS_RANK = { Overdue: 4, Pending: 3, "In Progress": 2, Completed: 1 };

function getEffectiveStatus(task) {
  const today = new Date().toISOString().split("T")[0];
  if (task.status !== "Completed" && task.due_date < today) return "Overdue";
  return task.status;
}

function applySearchSortFilter(tasks, search, sort) {
  let result = [...tasks];

  // Search across title, description, category
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q)
    );
  }

  // Sort
  result.sort((a, b) => {
    switch (sort) {
      case "due_date_asc":  return a.due_date.localeCompare(b.due_date);
      case "due_date_desc": return b.due_date.localeCompare(a.due_date);
      case "priority_desc": return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
      case "title_asc":     return a.title.localeCompare(b.title);
      case "status_asc": {
        const sa = STATUS_RANK[getEffectiveStatus(a)] || 0;
        const sb = STATUS_RANK[getEffectiveStatus(b)] || 0;
        return sb - sa;
      }
      default: return 0;
    }
  });

  return result;
}

export default function App() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("due_date_asc");
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    getClients().then((res) => {
      setClients(res.data);
      if (res.data.length > 0) selectClient(res.data[0]);
    });
  }, []);

  const selectClient = (client) => {
    setSelectedClient(client);
    setFilters({});
    setSearch("");
    loadTasks(client.id, {});
    loadStats(client.id);
    setShowAdd(false);
  };

  const loadTasks = (clientId, f) => {
    setLoading(true);
    getTasks(clientId, f)
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false));
  };

  const loadStats = (clientId) => {
    getStats(clientId).then((res) => setStats(res.data));
  };

  const refresh = () => {
    if (selectedClient) {
      loadTasks(selectedClient.id, filters);
      loadStats(selectedClient.id);
    }
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    if (selectedClient) loadTasks(selectedClient.id, newFilters);
  };

  const handleClientsUpdated = () => {
    getClients().then((res) => setClients(res.data));
  };

  // Search + sort applied client-side; filters handled server-side via SQL
  const displayedTasks = useMemo(
    () => applySearchSortFilter(tasks, search, sort),
    [tasks, search, sort]
  );

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>ComplianceOS</span>
        </div>
        <ClientList
          clients={clients}
          selected={selectedClient}
          onSelect={selectClient}
          onClientsUpdated={handleClientsUpdated}
        />
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {selectedClient ? (
          <>
            {/* Header */}
            <div style={styles.header}>
              <div>
                <p style={styles.headerSub}>Client Workspace</p>
                <h1 style={styles.headerTitle}>{selectedClient.company_name}</h1>
                <div style={styles.headerMeta}>
                  <span style={styles.chip}>{selectedClient.entity_type}</span>
                  <span style={styles.chip}>{selectedClient.country}</span>
                  {stats && stats.overdue > 0 && (
                    <span style={{ ...styles.chip, color: "var(--red)", borderColor: "rgba(240,82,82,0.35)", background: "rgba(240,82,82,0.08)" }}>
                      ⚠ {stats.overdue} overdue
                    </span>
                  )}
                </div>
              </div>
              <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
                {showAdd ? "✕ Cancel" : "+ New Task"}
              </button>
            </div>

            {/* Dashboard Row: stat cards + donut chart */}
            {stats && (
              <div style={styles.dashRow}>
                <div style={styles.statCards}>
                  {[
                    { label: "Total",       value: stats.total,       color: "var(--accent)" },
                    { label: "Completed",   value: stats.completed,   color: "var(--green)"  },
                    { label: "In Progress", value: stats.in_progress, color: "var(--yellow)" },
                    { label: "Pending",     value: stats.pending,     color: "var(--muted)"  },
                    { label: "Overdue",     value: stats.overdue,     color: "var(--red)"    },
                  ].map((s) => (
                    <div key={s.label} style={styles.statCard}>
                      <span style={{ ...styles.statNum, color: s.color }}>{s.value}</span>
                      <span style={styles.statLabel}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <StatsChart stats={stats} />
              </div>
            )}

            {/* Add Task Panel */}
            {showAdd && (
              <AddTask
                clientId={selectedClient.id}
                refresh={() => { refresh(); setShowAdd(false); }}
              />
            )}

            {/* Search + Sort */}
            <SearchSort
              search={search}
              sort={sort}
              onSearch={setSearch}
              onSort={setSort}
            />

            {/* Filters */}
            <Filters filters={filters} onChange={handleFilter} />

            {/* Results count */}
            <p style={styles.resultsText}>
              {displayedTasks.length} task{displayedTasks.length !== 1 ? "s" : ""}
              {search ? ` matching "${search}"` : ""}
            </p>

            {/* Task List */}
            <TaskList tasks={displayedTasks} loading={loading} refresh={refresh} />
          </>
        ) : (
          <div style={styles.empty}>
            <span style={{ fontSize: 48 }}>◈</span>
            <p>Select a client to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: "flex", height: "100vh", overflow: "hidden" },
  sidebar: {
    width: 260, minWidth: 260, background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  logo: {
    padding: "24px 20px 20px", display: "flex", alignItems: "center",
    gap: 10, borderBottom: "1px solid var(--border)",
  },
  logoIcon: { fontSize: 22, color: "var(--accent)" },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: "var(--text)" },
  main: {
    flex: 1, overflow: "auto", padding: "32px 36px",
    display: "flex", flexDirection: "column", gap: 18,
  },
  header: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", gap: 16,
  },
  headerSub: {
    fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em",
    textTransform: "uppercase", marginBottom: 4, fontFamily: "var(--mono)",
  },
  headerTitle: { fontSize: 28, fontWeight: 800, color: "var(--text)", lineHeight: 1.1, marginBottom: 10 },
  headerMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    fontSize: 11, fontFamily: "var(--mono)", background: "var(--surface2)",
    border: "1px solid var(--border2)", color: "var(--muted)",
    padding: "3px 10px", borderRadius: 99,
  },
  addBtn: {
    background: "var(--accent)", color: "#fff", fontSize: 13,
    fontWeight: 700, padding: "10px 20px", borderRadius: "var(--radius-sm)",
    whiteSpace: "nowrap", letterSpacing: "0.02em",
  },
  dashRow: { display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" },
  statCards: { display: "flex", gap: 10, flexWrap: "wrap", flex: 1 },
  statCard: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: "14px 22px",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 4, minWidth: 80,
  },
  statNum: { fontSize: 26, fontWeight: 800, lineHeight: 1, fontFamily: "var(--mono)" },
  statLabel: { fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" },
  resultsText: { fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "100%", gap: 16,
    color: "var(--muted)", fontSize: 15,
  },
};