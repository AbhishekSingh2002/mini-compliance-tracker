const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all clients
router.get("/", (req, res) => {
  db.all("SELECT * FROM clients ORDER BY company_name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single client by ID
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM clients WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Client not found" });
    res.json(row);
  });
});

// POST create new client
router.post("/", (req, res) => {
  const { company_name, country, entity_type } = req.body;

  if (!company_name || !company_name.trim()) {
    return res.status(400).json({ error: "Company name is required" });
  }

  db.run(
    `INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)`,
    [company_name.trim(), country || "", entity_type || ""],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        company_name: company_name.trim(),
        country: country || "",
        entity_type: entity_type || "",
      });
    }
  );
});

// PUT update client
router.put("/:id", (req, res) => {
  const { company_name, country, entity_type } = req.body;

  db.run(
    `UPDATE clients SET
      company_name = COALESCE(?, company_name),
      country      = COALESCE(?, country),
      entity_type  = COALESCE(?, entity_type)
    WHERE id = ?`,
    [company_name, country, entity_type, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Client not found" });
      db.get("SELECT * FROM clients WHERE id = ?", [req.params.id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    }
  );
});

// DELETE client (and all their tasks)
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM tasks WHERE client_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.run("DELETE FROM clients WHERE id = ?", [req.params.id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      if (this.changes === 0) return res.status(404).json({ error: "Client not found" });
      res.json({ deleted: true, id: Number(req.params.id) });
    });
  });
});

module.exports = router;