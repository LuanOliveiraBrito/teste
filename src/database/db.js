import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';

let db;

if (isDevelopment) {
  const initSqlJs = (await import('sql.js')).default;
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const fs = await import('fs');
  
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dbFile = join(__dirname, '..', '..', 'vehicles.db');

  const SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(dbFile)) {
      const filebuffer = fs.readFileSync(dbFile);
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
      await initializeTables();
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbFile, buffer);
    }
  } catch (err) {
    console.error('Error initializing development database:', err);
    db = new SQL.Database();
    await initializeTables();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFile, buffer);
  }
} else {
  // Production: Use Turso
  db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  });
}

async function initializeTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      model TEXT NOT NULL,
      isCheckedOut BOOLEAN DEFAULT FALSE,
      currentDriver TEXT,
      FOREIGN KEY (currentDriver) REFERENCES drivers (id)
    )`,
    `CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId TEXT NOT NULL,
      driverId TEXT NOT NULL,
      checkoutTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      returnTime DATETIME,
      FOREIGN KEY (vehicleId) REFERENCES vehicles (id),
      FOREIGN KEY (driverId) REFERENCES drivers (id)
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'driver')),
      driverId TEXT,
      driverName TEXT,
      FOREIGN KEY (driverId) REFERENCES drivers (id)
    )`
  ];

  const initialData = [
    ["INSERT INTO drivers (id, name, department) VALUES (?, ?, ?)", ['1', 'Luan Oliveira de Brito Nunes', 'Administração']],
    ["INSERT INTO drivers (id, name, department) VALUES (?, ?, ?)", ['2', 'José Borges', 'Motorista']],
    ["INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", ['RSB7C87', 'NISSAN VERSA']],
    ["INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", ['QKE1B38', 'HILUX MARCELO']],
    ["INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", ['QKI7G71', 'PRESIDÊNCIA']],
    ["INSERT INTO vehicles (id, model, isCheckedOut) VALUES (?, ?, FALSE)", ['QKE1B6', 'HILUX ADMINISTRAÇÃO']]
  ];

  if (isDevelopment) {
    for (const query of queries) {
      db.run(query);
    }
    for (const [query, params] of initialData) {
      db.run(query, params);
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.run(
      "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
      ['admin', 'admin', hashedPassword, 'admin']
    );
  } else {
    for (const query of queries) {
      await db.execute(query);
    }
    for (const [query, params] of initialData) {
      await db.execute(query, params);
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.execute(
      "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
      ['admin', 'admin', hashedPassword, 'admin']
    );
  }
}

export async function initializeDatabase() {
  if (!isDevelopment) {
    await initializeTables();
  }
}

export async function runQuery(query, params = []) {
  try {
    if (isDevelopment) {
      return db.run(query, params);
    } else {
      return await db.execute(query, params);
    }
  } catch (error) {
    console.error('Error running query:', query, error);
    throw error;
  }
}

export async function execQuery(query, params = []) {
  try {
    if (isDevelopment) {
      return db.exec(query, params);
    } else {
      const result = await db.execute(query, params);
      return [{
        columns: result.columns,
        values: result.rows
      }];
    }
  } catch (error) {
    console.error('Error executing query:', query, error);
    throw error;
  }
}

export function saveDatabase() {
  // Only needed for development
  if (isDevelopment) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      const { fileURLToPath } = await import('url');
      const { dirname, join } = await import('path');
      const fs = await import('fs');
      
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const dbFile = join(__dirname, '..', '..', 'vehicles.db');
      
      fs.writeFileSync(dbFile, buffer);
      console.log('Database saved successfully');
    } catch (error) {
      console.error('Error saving database:', error);
      throw error;
    }
  }
}

export function getDb() {
  return db;
}
