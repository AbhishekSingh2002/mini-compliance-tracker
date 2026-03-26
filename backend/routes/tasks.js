const express = require("express");
const router = express.Router();
const db = require("../db");

// ⚠️ Static routes MUST come before dynamic /:param routes

// GET stats for a client
router.get("/stats/:clientId", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  db.get(
    `SELECT
      COUNT(*)                                                                  AS total,
      SUM(CASE WHEN status = 'Completed'   THEN 1 ELSE 0 END)                 AS completed,
      SUM(CASE WHEN status = 'Pending'     THEN 1 ELSE 0 END)                 AS pending,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END)                 AS in_progress,
      SUM(CASE WHEN status != 'Completed' AND due_date < ? THEN 1 ELSE 0 END) AS overdue
    FROM tasks WHERE client_id = ?`,
    [today, req.params.clientId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
});

// GET single task by ID
router.get("/single/:id", (req, res) => {
  db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(row);
  });
});

// GET tasks for a client with optional filters
router.get("/:clientId", (req, res) => {
  const { status, category, priority } = req.query;

  let query = "SELECT * FROM tasks WHERE client_id = ?";
  const params = [req.params.clientId];

  if (status)   { query += " AND status = ?";   params.push(status); }
  if (category) { query += " AND category = ?"; params.push(category); }
  if (priority) { query += " AND priority = ?"; params.push(priority); }

  query += " ORDER BY due_date ASC";

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST create a new task
router.post("/", (req, res) => {
  const { client_id, title, description, category, due_date, status, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (!due_date) {
    return res.status(400).json({ error: "Due date is required" });
  }
  if (!client_id) {
    return res.status(400).json({ error: "client_id is required" });
  }

  db.run(
    `INSERT INTO tasks (client_id, title, description, category, due_date, status, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      client_id,
      title.trim(),
      description || "",
      category || "General",
      due_date,
      status || "Pending",
      priority || "Medium",
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(row);
      });
    }
  );
});

// PUT update a task (any field via COALESCE — only sent fields are changed)
router.put("/:id", (req, res) => {
  const { status, title, description, category, due_date, priority } = req.body;

  db.run(
    `UPDATE tasks SET
      status      = COALESCE(?, status),
      title       = COALESCE(?, title),
      description = COALESCE(?, description),
      category    = COALESCE(?, category),
      due_date    = COALESCE(?, due_date),
      priority    = COALESCE(?, priority)
    WHERE id = ?`,
    [status, title, description, category, due_date, priority, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
      db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    }
  );
});

// DELETE a task
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM tasks WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ deleted: true, id: Number(req.params.id) });
  });
});

module.exports = router;