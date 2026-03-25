const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// GET all clients
app.get("/clients", (req, res) => {
  db.all("SELECT * FROM clients ORDER BY company_name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single client
app.get("/clients/:id", (req, res) => {
  db.get("SELECT * FROM clients WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Client not found" });
    res.json(row);
  });
});

// POST create client
app.post("/clients", (req, res) => {
  const { company_name, country, entity_type } = req.body;
  if (!company_name) return res.status(400).json({ error: "Company name is required" });
  db.run(`INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)`,
    [company_name, country, entity_type],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, company_name, country, entity_type });
    });
});

// GET tasks for a client (filterable)
app.get("/tasks/:clientId", (req, res) => {
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

// POST create task
app.post("/tasks", (req, res) => {
  const { client_id, title, description, category, due_date, status, priority } = req.body;
  if (!title || !due_date) return res.status(400).json({ error: "Title and due date are required" });
  if (!client_id) return res.status(400).json({ error: "client_id is required" });
  db.run(`INSERT INTO tasks (client_id, title, description, category, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [client_id, title, description||"", category||"General", due_date, status||"Pending", priority||"Medium"],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(row);
      });
    });
});

// PUT update task
app.put("/tasks/:id", (req, res) => {
  const { status, title, description, category, due_date, priority } = req.body;
  db.run(`UPDATE tasks SET
    status=COALESCE(?,status), title=COALESCE(?,title),
    description=COALESCE(?,description), category=COALESCE(?,category),
    due_date=COALESCE(?,due_date), priority=COALESCE(?,priority)
    WHERE id=?`,
    [status, title, description, category, due_date, priority, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
      db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    });
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  db.run("DELETE FROM tasks WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ deleted: true, id: req.params.id });
  });
});

// GET stats for a client
app.get("/stats/:clientId", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  db.all(`SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status!='Completed' AND due_date<? THEN 1 ELSE 0 END) as overdue
    FROM tasks WHERE client_id=?`,
    [today, req.params.clientId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows[0]);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));