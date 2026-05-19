const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 📦 Utility to promisify db.query
function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// ➤ Add new financial year
router.post('/add', async (req, res) => {
  const { start_date, end_date } = req.body;

  // Required validation
  if (!start_date || !end_date)
    return res.status(400).json({ error: 'Start date and end date are required.' });

  // End date must be after start date
  if (new Date(end_date) <= new Date(start_date))
    return res.status(400).json({ error: 'End date must be after start date.' });

  // Duration must be approximately 1 year (between 350 and 380 days)
  const diffDays = (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24);
  if (diffDays < 350 || diffDays > 380)
    return res.status(400).json({ error: 'Financial year must be approximately 1 year (365 days).' });

  try {

    // Prevent overlapping financial years
const overlapping = await query(
  `SELECT * FROM financial_years 
   WHERE NOT (
     end_date < ? OR start_date > ?
   )`,
  [start_date, end_date]
);

if (overlapping.length > 0) {
    return res.status(400).json({ error: 'Financial year overlaps with an existing year.' });
  }
  
    // Optional check for duplicate
    const existing = await query(
      'SELECT * FROM financial_years WHERE start_date >= ? AND end_date <= ?',
      [start_date, end_date]
    );

    const allexisting = await query(
      'SELECT * FROM financial_years WHERE is_active = 1',
      
    );

    var isActive = 0; // Default to active

    if(allexisting.length == 0) isActive=1;
   

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Financial year with same year is  already exists.' });
      isActive = 0; // If exists, set to active
    }

    const result = await query(
      'INSERT INTO financial_years (start_date, end_date, is_active) VALUES (?, ?, ?)',
      [start_date, end_date, isActive]
    );

    res.status(201).json({ message: 'Financial year created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ➤ Activate a specific financial year
router.post('/activate/:id', async (req, res) => {
  const { id } = req.params;
  try {
   await query('UPDATE financial_years SET is_active = FALSE');
await query('UPDATE financial_years SET is_active = TRUE WHERE id = ?', [id]);

    res.status(200).json({ message: 'Financial year activated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Activation error' });
  }
});

// ➤ Deactivate a specific financial year
router.post('/deactivate/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('UPDATE financial_years SET is_active = FALSE WHERE id = ?', [id]); // deactivate only target
    res.status(200).json({ message: 'Deactivated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Deactivation error' });
  }
});


// ➤ Get active financial year(s)
router.get('/active', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM financial_years WHERE is_active = TRUE');
    if (rows.length === 0) {
      return res.status(200).json({ message: 'No active financial year' });
    }
    res.status(200).json({ active: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching active year' });
  }
});

// ➤ Get all financial years
router.get('/all', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM financial_years ORDER BY created_at DESC');
    res.status(200).json({ financialYears: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching years' });
  }
});

module.exports = router;
