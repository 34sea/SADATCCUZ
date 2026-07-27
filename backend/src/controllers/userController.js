const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';

// ==========================================
// AUTH CONTROLLER (LOGIN)
// ==========================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = rows[0];

    // Comparação simples (em produção recomenda-se o uso do bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gera o token JWT com validade de 8h
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// ROTA /me (Identificado pelo Token JWT)
// ==========================================
exports.getMe = async (req, res) => {
  // Pega o ID do usuário injetado pelo authMiddleware
  const userId = req.user.id;

  try {
    const [userRows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at, r.name AS role
       FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
      [userId]
    );

    if (userRows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    const [permRows] = await pool.query(
      `SELECT p.name FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN users u ON u.role_id = rp.role_id WHERE u.id = ?`,
      [userId]
    );

    res.json({
      ...userRows[0],
      permissions: permRows.map((p) => p.name)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// CONTROLLERS DE USUÁRIOS
// ==========================================

exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at, r.name AS role 
       FROM users u LEFT JOIN roles r ON u.role_id = r.id`
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role_id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [name, email, password, role_id]
    );
    res.status(201).json({ id: result.insertId, name, email, role_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { name, email, password, role_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, password = ?, role_id = ? WHERE id = ?',
      [name, email, password, role_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.patchUser = async (req, res) => {
  const fields = req.body;
  const updates = [];
  const values = [];

  Object.keys(fields).forEach((key) => {
    updates.push(`${key} = ?`);
    values.push(fields[key]);
  });

  if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo enviado para atualização' });

  values.push(req.params.id);

  try {
    const [result] = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário atualizado com sucesso (PATCH)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// CONTROLLERS DE ROLES
// ==========================================

exports.getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles');
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Role não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRole = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'O nome da role é obrigatório.' });

  try {
    const [result] = await pool.query('INSERT INTO roles (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Role com este nome já existe.' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'O nome da role é obrigatório.' });

  try {
    const [result] = await pool.query('UPDATE roles SET name = ? WHERE id = ?', [name, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Role não encontrada' });
    res.json({ message: 'Role atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM roles WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Role não encontrada' });
    res.json({ message: 'Role removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};