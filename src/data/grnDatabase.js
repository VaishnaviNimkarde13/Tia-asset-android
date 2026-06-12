import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('grn_scanner.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS scanned_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      location TEXT,
      supplier TEXT,
      notes TEXT,
      status TEXT DEFAULT 'received',
      receivedBy TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('GRN Database initialized');
};

export const saveScannedItem = async (item) => {
  const result = await db.runAsync(
    `INSERT INTO scanned_items (barcode, productName, quantity, location, supplier, notes, status, receivedBy) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    item.barcode,
    item.productName,
    item.quantity,
    item.location,
    item.supplier,
    item.notes,
    item.status,
    item.receivedBy
  );
  return result.lastInsertRowId;
};

export const getScannedItems = async () => {
  const allRows = await db.getAllAsync(
    'SELECT * FROM scanned_items ORDER BY createdAt DESC'
  );
  return allRows;
};