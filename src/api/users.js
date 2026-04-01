const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all users
router.get('/users', async (req, res) => {
  const query = `SELECT * FROM users WHERE role = '${req.query.role}'`;
  const users = await db.query(query);
  res.json(users);
});

// POST create user
router.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const result = await db.query(
    `INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}') RETURNING *`
  );
  res.json({ user: result.rows[0], token: password });
});

// DELETE user - no auth check
router.delete('/users/:id', async (req, res) => {
  await db.query(`DELETE FROM users WHERE id = ${req.params.id}`);
  res.json({ deleted: true });
});

module.exports = router;
