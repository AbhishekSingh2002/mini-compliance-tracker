const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all clients
router.get("/", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM clients ORDER BY company_name").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single client
router.get("/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Client not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create client
router.post("/", (req, res) => {
  try {
    const { company_name, country, entity_type } = req.body;
    if (!company_name || !company_name.trim())
      return res.status(400).json({ error: "Company name is required" });

    const result = db.prepare(
      "INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)"
    ).run(company_name.trim(), country || "", entity_type || "");

    res.status(201).json({
      id: result.lastInsertRowid,
      company_name: company_name.trim(),
      country: country || "",
      entity_type: entity_type || "",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update client
router.put("/:id", (req, res) => {
  try {
    const { company_name, country, entity_type } = req.body;
    const result = db.prepare(
      `UPDATE clients SET
        company_name = COALESCE(?, company_name),
        country      = COALESCE(?, country),
        entity_type  = COALESCE(?, entity_type)
      WHERE id = ?`
    ).run(company_name, country, entity_type, req.params.id);

    if (result.changes === 0) return res.status(404).json({ error: "Client not found" });
    const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE client and all their tasks
router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM tasks WHERE client_id = ?").run(req.params.id);
    const result = db.prepare("DELETE FROM clients WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Client not found" });
    res.json({ deleted: true, id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;