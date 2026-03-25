const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Create tables
db.exec(`CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  country TEXT,
  entity_type TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS tasks (
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

// Seed data if empty
const clientCount = db.prepare("SELECT COUNT(*) as count FROM clients").get();
if (clientCount.count === 0) {
  const seedClients = [
    ["ABC Pvt Ltd", "India", "Private"],
    ["XYZ Corp", "USA", "Corporation"],
    ["Omega Solutions", "India", "LLP"],
    ["Delta Enterprises", "UK", "Public"],
  ];
  
  const insertClient = db.prepare(`INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)`);
  seedClients.forEach(([name, country, type]) => {
    insertClient.run(name, country, type);
  });

  // Seed tasks
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

  const insertTask = db.prepare(`INSERT INTO tasks (client_id, title, description, category, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  seedTasks.forEach(([cid, title, desc, cat, due, status, priority]) => {
    insertTask.run(cid, title, desc, cat, due, status, priority);
  });
}

module.exports = db;