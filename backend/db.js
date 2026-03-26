const Database = require("better-sqlite3");
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
    const tempDb = new Database(dbPath);
    tempDb.close();
  }
  
  db = new Database(dbPath);
  console.log("✅ Database connected successfully");
} catch (err) {
  console.error("❌ Database connection failed:", err.message);
  console.error("Database path:", dbPath);
  process.exit(1);
}

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

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
const clientCount = db.prepare("SELECT COUNT(*) as count FROM clients").get();

if (clientCount.count === 0) {
  const insertClient = db.prepare(
    "INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)"
  );
  const insertTask = db.prepare(
    `INSERT INTO tasks (client_id, title, description, category, due_date, status, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

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

  // Seed clients and tasks in a transaction
  const seedAll = db.transaction(() => {
    const c1 = insertClient.run("ABC Pvt Ltd",       "India", "Private");
    const c2 = insertClient.run("XYZ Corp",          "USA",   "Corporation");
    const c3 = insertClient.run("Omega Solutions",   "India", "LLP");
    const c4 = insertClient.run("Delta Enterprises", "UK",    "Public");

    // ABC Pvt Ltd tasks
    insertTask.run(c1.lastInsertRowid, "GST Filing – Q1",        "Quarterly GST return filing",      "Tax",        past(10),   "Pending",     "High");
    insertTask.run(c1.lastInsertRowid, "TDS Payment",            "Monthly TDS deposit",              "Tax",        past(3),    "Pending",     "High");
    insertTask.run(c1.lastInsertRowid, "Annual Report Submission","File annual report with ROC",     "Compliance", future(15), "Pending",     "Medium");
    insertTask.run(c1.lastInsertRowid, "Payroll Audit",          "Internal payroll compliance check","HR",         future(30), "In Progress", "Low");

    // XYZ Corp tasks
    insertTask.run(c2.lastInsertRowid, "SEC Filing",   "Quarterly SEC disclosure",        "Regulatory", past(5),    "Pending",     "High");
    insertTask.run(c2.lastInsertRowid, "Tax Return",   "Federal tax return preparation",  "Tax",        future(20), "Pending",     "High");

    // Omega Solutions tasks
    insertTask.run(c3.lastInsertRowid, "LLP Agreement Renewal", "Renew partnership agreement",  "Legal", future(10), "Pending",   "Medium");
    insertTask.run(c3.lastInsertRowid, "GST Reconciliation",    "Reconcile GSTR-2A vs books",   "Tax",   past(7),    "Completed", "Medium");

    // Delta Enterprises tasks
    insertTask.run(c4.lastInsertRowid, "HMRC Filing",          "VAT return submission",       "Tax",        future(5),  "In Progress", "High");
    insertTask.run(c4.lastInsertRowid, "Companies House Update","Update director information", "Compliance", future(25), "Pending",     "Low");
  });

  seedAll();
  console.log("✅ Database seeded");
}

module.exports = db;