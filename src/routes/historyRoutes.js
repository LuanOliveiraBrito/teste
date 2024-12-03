import express from 'express';
import { execQuery } from '../database/db.js';

const router = express.Router();

router.get('/history', (req, res) => {
  try {
    const result = execQuery(`
      SELECT h.id, h.vehicleId, h.driverId, h.checkoutTime, h.returnTime,
             v.model as vehicleModel, d.name as driverName, d.department as driverDepartment
      FROM history h
      JOIN vehicles v ON h.vehicleId = v.id
      JOIN drivers d ON h.driverId = d.id
      ORDER BY h.checkoutTime DESC
    `);
    
    const history = result.length > 0 ? result[0].values.map(row => ({
      id: row[0],
      vehicleId: row[1],
      driverId: row[2],
      checkoutTime: row[3],
      returnTime: row[4],
      vehicleModel: row[5],
      driverName: row[6],
      driverDepartment: row[7]
    })) : [];
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;