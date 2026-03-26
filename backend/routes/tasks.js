const express = require("express");
const router = express.Router();
const db = require("../db");

// ⚠️ Static routes MUST come before dynamic /:param routes

// GET stats for a client
router.get("/stats/:clientId", (req, res) => {
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

// GET single task by ID
router.get("/single/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tasks for a client with optional filters
router.get("/:clientId", (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = "SELECT * FROM tasks WHERE client_id = ?";
    const params = [req.params.clientId];

    if (status)   { query += " AND status = ?";   params.push(status); }
    if (category) { query += " AND category = ?"; params.push(category); }
    if (priority) { query += " AND priority = ?"; params.push(priority); }
    query += " ORDER BY due_date ASC";

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create task
router.post("/", (req, res) => {
  try {
    const { client_id, title, description, category, due_date, status, priority } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });
    if (!due_date)  return res.status(400).json({ error: "Due date is required" });
    if (!client_id) return res.status(400).json({ error: "client_id is required" });

    const result = db.prepare(
      `INSERT INTO tasks (client_id, title, description, category, due_date, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      client_id,
      title.trim(),
      description || "",
      category || "General",
      due_date,
      status || "Pending",
      priority || "Medium"
    );

    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update task
router.put("/:id", (req, res) => {
  try {
    const { status, title, description, category, due_date, priority } = req.body;
    const result = db.prepare(
      `UPDATE tasks SET
        status      = COALESCE(?, status),
        title       = COALESCE(?, title),
        description = COALESCE(?, description),
        category    = COALESCE(?, category),
        due_date    = COALESCE(?, due_date),
        priority    = COALESCE(?, priority)
      WHERE id = ?`
    ).run(status, title, description, category, due_date, priority, req.params.id);

    if (result.changes === 0) return res.status(404).json({ error: "Task not found" });
    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete("/:id", (req, res) => {
  try {
    const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ deleted: true, id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;