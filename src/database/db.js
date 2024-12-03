import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '..', '..', 'vehicles.db');

let db;
let SQL;

export async function initializeDatabase() {
  SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(dbFile)) {
      const filebuffer = fs.readFileSync(dbFile);
      db = new SQL.Database(filebuffer);
      // Adicionar coluna driverName se não existir
      try {
        db.run('ALTER TABLE users ADD COLUMN driverName TEXT');
        saveDatabase();
      } catch (err) {
        // Coluna já existe, ignorar erro
      }
    } else {
      db = new SQL.Database();
      await initializeTables();
      saveDatabase();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    db = new SQL.Database();
    await initializeTables();
    saveDatabase();
  }
}

async function initializeTables() {
  // Drop existing tables to ensure clean initialization
  db.run('DROP TABLE IF EXISTS history');
  db.run('DROP TABLE IF EXISTS vehicles');
  db.run('DROP TABLE IF EXISTS drivers');
  db.run('DROP TABLE IF EXISTS users');

  // Create tables in correct order
  db.run(`
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      model TEXT NOT NULL,
      isCheckedOut BOOLEAN DEFAULT FALSE,
      currentDriver TEXT,
      FOREIGN KEY (currentDriver) REFERENCES drivers (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId TEXT NOT NULL,
      driverId TEXT NOT NULL,
      checkoutTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      returnTime DATETIME,
      FOREIGN KEY (vehicleId) REFERENCES vehicles (id),
      FOREIGN KEY (driverId) REFERENCES drivers (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'driver')),
      driverId TEXT,
      driverName TEXT,
      FOREIGN KEY (driverId) REFERENCES drivers (id)
    )
  `);

  // Insert initial data
  db.run("INSERT INTO drivers (id, name, department) VALUES (?, ?, ?)", 
    ['1', 'Luan Oliveira de Brito Nunes', 'Administração']);
  db.run("INSERT INTO drivers (id, name, department) VALUES (?, ?, ?)", 
    ['2', 'José Borges', 'Motorista']);

  db.run("INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", 
    ['RSB7C87', 'NISSAN VERSA']);
  db.run("INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", 
    ['QKE1B38', 'HILUX MARCELO']);
  db.run("INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", 
    ['QKI7G71', 'PRESIDÊNCIA']);
  db.run("INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", 
    ['QKE1B6', 'HILUX ADMINISTRAÇÃO']);

  // Create default admin user with password: admin123
  const hashedPassword = await bcrypt.hash('admin123', 10);
  db.run("INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
    ['admin', 'admin', hashedPassword, 'admin']);
}

export function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFile, buffer);
    console.log('Database saved successfully');
  } catch (error) {
    console.error('Error saving database:', error);
    throw error;
  }
}

export function getDb() {
  return db;
}

export function runQuery(query, params = []) {
  try {
    return db.run(query, params);
  } catch (error) {
    console.error('Error running query:', query, error);
    throw error;
  }
}

export function execQuery(query, params = []) {
  try {
    return db.exec(query, params);
  } catch (error) {
    console.error('Error executing query:', query, error);
    throw error;
  }
}