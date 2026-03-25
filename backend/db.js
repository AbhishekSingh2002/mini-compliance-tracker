const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  // Create clients table
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    country TEXT,
    entity_type TEXT
  )`);

  // Create tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Medium',
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )`);

  // Seed clients
  db.get("SELECT COUNT(*) as count FROM clients", (err, row) => {
    if (!err && row.count === 0) {
      const seedClients = [
        ["ABC Pvt Ltd", "India", "Private"],
        ["XYZ Corp", "USA", "Corporation"],
        ["Omega Solutions", "India", "LLP"],
        ["Delta Enterprises", "UK", "Public"],
      ];
      seedClients.forEach(([name, country, type]) => {
        db.run(
          `INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)`,
          [name, country, type]
        );
      });

      // Seed tasks after clients
      setTimeout(() => {
        const today = new Date();
        const past = (days) => {
          const d = new Date(today);
          d.setDate(d.getDate() - days);
          return d.toISOString().split("T")[0];
        };
        const future = (days) => {
          const d = new Date(today);
          d.setDate(d.getDate() + days);
          return d.toISOString().split("T")[0];
        };

        const seedTasks = [
          [1, "GST Filing – Q1", "Quarterly GST return filing", "Tax", past(10), "Pending", "High"],
          [1, "TDS Payment", "Monthly TDS deposit", "Tax", past(3), "Pending", "High"],
          [1, "Annual Report Submission", "File annual report with ROC", "Compliance", future(15), "Pending", "Medium"],
          [1, "Payroll Audit", "Internal payroll compliance check", "HR", future(30), "In Progress", "Low"],
          [2, "SEC Filing", "Quarterly SEC disclosure", "Regulatory", past(5), "Pending", "High"],
          [2, "Tax Return", "Federal tax return preparation", "Tax", future(20), "Pending", "High"],
          [3, "LLP Agreement Renewal", "Renew partnership agreement", "Legal", future(10), "Pending", "Medium"],
          [3, "GST Reconciliation", "Reconcile GSTR-2A vs books", "Tax", past(7), "Completed", "Medium"],
          [4, "HMRC Filing", "VAT return submission", "Tax", future(5), "In Progress", "High"],
          [4, "Companies House Update", "Update director information", "Compliance", future(25), "Pending", "Low"],
        ];

        seedTasks.forEach(([cid, title, desc, cat, due, status, priority]) => {
          db.run(
            `INSERT INTO tasks (client_id, title, description, category, due_date, status, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cid, title, desc, cat, due, status, priority]
          );
        });
      }, 200);
    }
  });
});

module.exports = db;