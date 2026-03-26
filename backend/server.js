const express = require("express");
const cors = require("cors");
const db = require("./db");

const clientRoutes = require("./routes/clients");
const taskRoutes   = require("./routes/tasks");

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/clients", clientRoutes);
app.use("/tasks",   taskRoutes);

// Stats — top-level route for frontend
app.get("/stats/:clientId", (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const row = db.prepare(
      `SELECT
        COUNT(*)                                                                 AS total,
        SUM(CASE WHEN status = 'Completed'   THEN 1 ELSE 0 END)                 AS completed,
        SUM(CASE WHEN status = 'Pending'     THEN 1 ELSE 0 END)                 AS pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END)                 AS in_progress,
        SUM(CASE WHEN status != 'Completed' AND due_date < ? THEN 1 ELSE 0 END) AS overdue
      FROM tasks WHERE client_id = ?`
    ).get(today, req.params.clientId);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));