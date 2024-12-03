import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb, runQuery, execQuery, saveDatabase } from '../database/db.js';

const router = express.Router();
const JWT_SECRET = 'your-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

router.get('/vehicles', authenticateToken, (req, res) => {
  try {
    const result = execQuery(`
      SELECT v.*, d.name as driverName 
      FROM vehicles v 
      LEFT JOIN drivers d ON v.currentDriver = d.id
    `);
    const vehicles = result.length > 0 ? result[0].values.map(row => ({
      id: row[0],
      model: row[1],
      isCheckedOut: Boolean(row[2]),
      currentDriver: row[3],
      driverName: row[4]
    })) : [];
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.post('/vehicles/checkout', authenticateToken, async (req, res) => {
  const { vehicleId, driverId } = req.body;
  
  try {
    runQuery('BEGIN TRANSACTION');
    
    const vehicle = execQuery('SELECT isCheckedOut FROM vehicles WHERE id = ?', [vehicleId])[0];
    if (!vehicle || !vehicle.values.length) {
      runQuery('ROLLBACK');
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    if (Boolean(vehicle.values[0][0])) {
      runQuery('ROLLBACK');
      return res.status(400).json({ error: 'Veículo já está em uso' });
    }

    runQuery(`
      UPDATE vehicles
      SET isCheckedOut = TRUE, currentDriver = ?
      WHERE id = ?
    `, [driverId, vehicleId]);

    runQuery(`
      INSERT INTO history (vehicleId, driverId, checkoutTime)
      VALUES (?, ?, datetime('now', 'localtime'))
    `, [vehicleId, driverId]);

    runQuery('COMMIT');
    saveDatabase();
    
    res.json({ success: true });
  } catch (error) {
    runQuery('ROLLBACK');
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Erro ao retirar veículo' });
  }
});

router.post('/vehicles/return', authenticateToken, async (req, res) => {
  const { vehicleId } = req.body;
  
  try {
    runQuery('BEGIN TRANSACTION');
    
    // Buscar informações do veículo
    const vehicleResult = execQuery(`
      SELECT isCheckedOut, currentDriver
      FROM vehicles
      WHERE id = ?
    `, [vehicleId])[0];

    if (!vehicleResult || !vehicleResult.values.length) {
      runQuery('ROLLBACK');
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    const isCheckedOut = Boolean(vehicleResult.values[0][0]);
    const currentDriver = vehicleResult.values[0][1];

    if (!isCheckedOut) {
      runQuery('ROLLBACK');
      return res.status(400).json({ error: 'Veículo não está em uso' });
    }

    // Buscar informações do usuário atual
    const userResult = execQuery(`
      SELECT driverId
      FROM users
      WHERE id = ?
    `, [req.user.id])[0];

    if (!userResult || !userResult.values.length) {
      runQuery('ROLLBACK');
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }

    const userDriverId = userResult.values[0][0];
    const isAdmin = req.user.role === 'admin';

    // Verificar se o usuário tem permissão para devolver o veículo
    if (!isAdmin && userDriverId !== currentDriver) {
      runQuery('ROLLBACK');
      return res.status(403).json({ error: 'Apenas o motorista que retirou o veículo ou um administrador pode devolvê-lo' });
    }

    // Atualizar o veículo
    runQuery(`
      UPDATE vehicles
      SET isCheckedOut = FALSE, currentDriver = NULL
      WHERE id = ?
    `, [vehicleId]);

    // Atualizar o histórico
    runQuery(`
      UPDATE history
      SET returnTime = datetime('now', 'localtime')
      WHERE vehicleId = ? AND driverId = ? AND returnTime IS NULL
    `, [vehicleId, currentDriver]);

    runQuery('COMMIT');
    saveDatabase();
    
    res.json({ success: true });
  } catch (error) {
    runQuery('ROLLBACK');
    console.error('Return error:', error);
    res.status(500).json({ error: 'Erro ao devolver veículo' });
  }
});

export default router;