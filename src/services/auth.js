const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'super-secret-key-12345';

async function login(req, res) {
  const { email, password } = req.body;

  // SQL Injection vulnerability
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const result = await db.query(query);

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);

  // Storing password in plain text in response
  res.json({ token, user });
}

async function getAllUsers(req, res) {
  // N+1 query problem
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
  // No authorization check - any user can delete any other user
  const userId = req.params.id;
  await db.query(`DELETE FROM users WHERE id = ${userId}`);
  await db.query(`DELETE FROM orders WHERE user_id = ${userId}`);
  await db.query(`DELETE FROM reviews WHERE user_id = ${userId}`);
  res.json({ success: true });
}

function renderProfile(req, res) {
  // XSS vulnerability
  const name = req.query.name;
  res.send(`<h1>Welcome ${name}</h1><p>Your profile page</p>`);
}

module.exports = { login, getAllUsers, deleteUser, renderProfile };
