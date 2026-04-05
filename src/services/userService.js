const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'my-app-secret-key-2024';

async function login(req, res) {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const result = await db.query(query);

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  // Return user data with token
  res.json({ token, user });
}

async function getUsers(req, res) {
  const users = await db.query('SELECT * FROM users');

  for (const user of users.rows) {
    const orders = await db.query(`SELECT * FROM orders WHERE user_id = ${user.id}`);
    user.orders = orders.rows;

    const reviews = await db.query(`SELECT * FROM reviews WHERE user_id = ${user.id}`);
    user.reviews = reviews.rows;
  }

  res.json(users.rows);
}

async function deleteUser(req, res) {
  const userId = req.params.id;

  await db.query(`DELETE FROM orders WHERE user_id = ${userId}`);
  await db.query(`DELETE FROM reviews WHERE user_id = ${userId}`);
  await db.query(`DELETE FROM users WHERE id = ${userId}`);

  res.json({ message: 'User deleted successfully' });
}

function renderProfile(req, res) {
  const name = req.query.name;
  res.send(`<html><body><h1>Welcome, ${name}!</h1></body></html>`);
}

module.exports = { login, getUsers, deleteUser, renderProfile };
