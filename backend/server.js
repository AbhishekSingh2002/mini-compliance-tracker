const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// GET all clients
app.get("/clients", (req, res) => {
  try {
    const rows = db.all("SELECT * FROM clients ORDER BY company_name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single client
app.get("/clients/:id", (req, res) => {
  try {
    const row = db.get("SELECT * FROM clients WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Client not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create client
app.post("/clients", (req, res) => {
  try {
    const { company_name, country, entity_type } = req.body;
    if (!company_name) return res.status(400).json({ error: "Company name is required" });
    const stmt = db.prepare(`INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)`);
    const result = stmt.run(company_name, country, entity_type);
    res.status(201).json({ id: result.lastInsertRowid, company_name, country, entity_type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tasks for a client (filterable)
app.get("/tasks/:clientId", (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = "SELECT * FROM tasks WHERE client_id = ?";
    const params = [req.params.clientId];
    if (status)   { query += " AND status = ?";   params.push(status); }
    if (category) { query += " AND category = ?"; params.push(category); }
    if (priority) { query += " AND priority = ?"; params.push(priority); }
    query += " ORDER BY due_date ASC";
    const rows = db.all(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create task
app.post("/tasks", (req, res) => {
  try {
    const { client_id, title, description, category, due_date, status, priority } = req.body;
    if (!title || !due_date) return res.status(400).json({ error: "Title and due date are required" });
    if (!client_id) return res.status(400).json({ error: "client_id is required" });
    const stmt = db.prepare(`INSERT INTO tasks (client_id, title, description, category, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const result = stmt.run(client_id, title, description||"", category||"General", due_date, status||"Pending", priority||"Medium");
    const row = db.get("SELECT * FROM tasks WHERE id = ?", [result.lastInsertRowid]);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update task
app.put("/tasks/:id", (req, res) => {
  try {
    const { status, title, description, category, due_date, priority } = req.body;
    const stmt = db.prepare(`UPDATE tasks SET
      status=COALESCE(?,status), title=COALESCE(?,title),
      description=COALESCE(?,description), category=COALESCE(?,category),
      due_date=COALESCE(?,due_date), priority=COALESCE(?,priority)
      WHERE id=?`);
    const result = stmt.run(status, title, description, category, due_date, priority, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Task not found" });
    const row = db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  try {
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
    const result = stmt.run([req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats for a client
app.get("/stats/:clientId", (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const row = db.get(`SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status!='Completed' AND due_date<? THEN 1 ELSE 0 END) as overdue
      FROM tasks WHERE client_id=?`,
      [today, req.params.clientId]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));