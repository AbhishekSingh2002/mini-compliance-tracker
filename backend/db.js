const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "database.db");

// Ensure database directory exists and create database if it doesn't exist
let db;
try {
  // Create database file if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    console.log(" Creating new database file...");
    // Create empty database file
    const tempDb = new sqlite3.Database(dbPath);
    tempDb.close();
  }
  
  db = new sqlite3.Database(dbPath);
  console.log("✅ Database connected successfully");
} catch (err) {
  console.error("❌ Database connection failed:", err.message);
  console.error("Database path:", dbPath);
  process.exit(1);
}

// Enable WAL mode for better performance
db.run("PRAGMA journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    country      TEXT DEFAULT '',
    entity_type  TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER NOT NULL,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    category    TEXT DEFAULT 'General',
    due_date    TEXT NOT NULL,
    status      TEXT DEFAULT 'Pending',
    priority    TEXT DEFAULT 'Medium',
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );
`);

// Seed only if empty
db.get("SELECT COUNT(*) as count FROM clients", (err, row) => {
  if (err) {
    console.error("❌ Error checking client count:", err.message);
    return;
  }

  if (row.count === 0) {
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

    // Seed clients
    const clients = [
      ["ABC Pvt Ltd", "India", "Private"],
      ["XYZ Corp", "USA", "Corporation"],
      ["Omega Solutions", "India", "LLP"],
      ["Delta Enterprises", "UK", "Public"],
    ];

    const insertClient = db.prepare("INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)");
    const insertTask = db.prepare(`INSERT INTO tasks (client_id, title, description, category, due_date, status, priority)
                               VALUES (?, ?, ?, ?, ?, ?, ?)`);

    db.serialize(() => {
      let clientId = 1;
      
      clients.forEach(([name, country, type]) => {
        insertClient.run([name, country, type], function(err) {
          if (err) {
            console.error("❌ Error inserting client:", err.message);
            return;
          }
          
          const currentClientId = this.lastID;
          
          // Insert tasks for this client
          if (currentClientId === 1) { // ABC Pvt Ltd
            const tasks = [
              [currentClientId, "GST Filing – Q1", "Quarterly GST return filing", "Tax", past(10), "Pending", "High"],
              [currentClientId, "TDS Payment", "Monthly TDS deposit", "Tax", past(3), "Pending", "High"],
              [currentClientId, "Annual Report Submission", "File annual report with ROC", "Compliance", future(15), "Pending", "Medium"],
              [currentClientId, "Payroll Audit", "Internal payroll compliance check", "HR", future(30), "In Progress", "Low"],
            ];
            tasks.forEach(task => insertTask.run(task));
          } else if (currentClientId === 2) { // XYZ Corp
            const tasks = [
              [currentClientId, "SEC Filing", "Quarterly SEC disclosure", "Regulatory", past(5), "Pending", "High"],
              [currentClientId, "Tax Return", "Federal tax return preparation", "Tax", future(20), "Pending", "High"],
            ];
            tasks.forEach(task => insertTask.run(task));
          } else if (currentClientId === 3) { // Omega Solutions
            const tasks = [
              [currentClientId, "LLP Agreement Renewal", "Renew partnership agreement", "Legal", future(10), "Pending", "Medium"],
              [currentClientId, "GST Reconciliation", "Reconcile GSTR-2A vs books", "Tax", past(7), "Completed", "Medium"],
            ];
            tasks.forEach(task => insertTask.run(task));
          } else if (currentClientId === 4) { // Delta Enterprises
            const tasks = [
              [currentClientId, "HMRC Filing", "VAT return submission", "Tax", future(5), "In Progress", "High"],
              [currentClientId, "Companies House Update", "Update director information", "Compliance", future(25), "Pending", "Low"],
            ];
            tasks.forEach(task => insertTask.run(task));
          }
        });
      });
    });

    console.log("✅ Database seeded");
  }
});

module.exports = db;