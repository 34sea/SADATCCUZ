const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// AUTENTICAÇÃO E PERFIL DO UTILIZADOR
// ==========================================

// Login de Utilizador
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e palavra-passe são obrigatórios.' });
    }

    // Buscar utilizador com os seus papeis/roles
    const [users] = await pool.query(
      `SELECT u.*, GROUP_CONCAT(r.name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = ?
       GROUP BY u.id`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Esta conta de utilizador está desativada.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const userRoles = user.roles ? user.roles.split(',') : [];

    // Gerar Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, roles: userRoles },
      process.env.JWT_SECRET || 'secret_key_sgpd_2026',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Autenticação realizada com sucesso.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          code_number: user.code_number,
          roles: userRoles
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter perfil do utilizador autenticado
exports.getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.code_number, u.is_active, u.created_at,
              GROUP_CONCAT(r.name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    const user = users[0];
    user.roles = user.roles ? user.roles.split(',') : [];

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// GESTÃO DE UTILIZADORES (USERS)
// ==========================================

// Listar todos os utilizadores (com suporte a filtro por role e estado)
exports.getUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.code_number, u.is_active, u.created_at,
             GROUP_CONCAT(r.name) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (is_active !== undefined) {
      query += ` AND u.is_active = ?`;
      params.push(is_active === 'true' || is_active === '1');
    }

    if (role) {
      query += ` AND r.name = ?`;
      params.push(role);
    }

    query += ` GROUP BY u.id ORDER BY u.name ASC`;

    const [rows] = await pool.query(query, params);

    const formattedRows = rows.map((u) => ({
      ...u,
      roles: u.roles ? u.roles.split(',') : []
    }));

    return res.status(200).json({ success: true, data: formattedRows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter detalhes de um utilizador por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.code_number, u.is_active, u.created_at,
              GROUP_CONCAT(r.name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    const user = users[0];
    user.roles = user.roles ? user.roles.split(',') : [];

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Registar novo utilizador (com atribuição opcional de roles)
exports.createUser = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, email, password, code_number, role_ids } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nome, email e palavra-passe são obrigatórios.' });
    }

    await connection.beginTransaction();

    // Verificar se o email já existe
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Este email já está registado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await connection.query(
      `INSERT INTO users (name, email, password_hash, code_number) VALUES (?, ?, ?, ?)`,
      [name, email, password_hash, code_number || null]
    );

    const userId = result.insertId;

    // Atribuir papéis se fornecidos
    if (Array.isArray(role_ids) && role_ids.length > 0) {
      const roleValues = role_ids.map((rId) => [userId, rId]);
      await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES ?', [roleValues]);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Utilizador criado com sucesso.',
      data: { id: userId, name, email, code_number }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

exports.seedAdmin = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('Admin123!', salt);

    // 1. Criar ou atualizar o Utilizador Admin
    const [users] = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, code_number)
       VALUES (1, 'Administrador do Sistema', 'admin@sadatcc.ac.mz', ?, 'ADM001')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [password_hash]
    );

    // 2. Garantir que a Role 'ADMIN' existe
    const [roles] = await pool.query(`SELECT id FROM roles WHERE name = 'ADMIN'`);
    let roleId = roles[0]?.id;

    if (!roleId) {
      const [newRole] = await pool.query(`INSERT INTO roles (name, description) VALUES ('ADMIN', 'Administrador do Sistema')`);
      roleId = newRole.insertId;
    }

    // 3. Associar o Admin à Role 'ADMIN'
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES (1, ?)
       ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`,
      [roleId]
    );

    return res.status(200).json({ success: true, message: 'Administrador configurado com sucesso! Login: admin@sadatcc.ac.mz | Senha: Admin123!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar utilizador
exports.updateUser = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { name, email, code_number, is_active, password, role_ids } = req.body;

    await connection.beginTransaction();

    let password_hash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    const [result] = await connection.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        code_number = COALESCE(?, code_number),
        is_active = COALESCE(?, is_active),
        password_hash = COALESCE(?, password_hash)
       WHERE id = ?`,
      [name, email, code_number, is_active, password_hash, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    // Se um novo array de role_ids for enviado, reatribui
    if (Array.isArray(role_ids)) {
      await connection.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
      if (role_ids.length > 0) {
        const roleValues = role_ids.map((rId) => [id, rId]);
        await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES ?', [roleValues]);
      }
    }

    await connection.commit();
    return res.status(200).json({ success: true, message: 'Utilizador atualizado com sucesso.' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Eliminar utilizador
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Utilizador eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// GESTÃO DE ROLES E PERMISSÕES
// ==========================================

// Listar todas as Roles com permissões associadas
exports.getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query(`
      SELECT r.*, GROUP_CONCAT(p.name) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id ORDER BY r.name ASC
    `);

    const formattedRoles = roles.map((r) => ({
      ...r,
      permissions: r.permissions ? r.permissions.split(',') : []
    }));

    return res.status(200).json({ success: true, data: formattedRoles });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Criar nova Role
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome da role é obrigatório.' });
    }

    const [result] = await pool.query(
      'INSERT INTO roles (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Role criada com sucesso.',
      data: { id: result.insertId, name, description }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Listar todas as Permissões
exports.getPermissions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM permissions ORDER BY name ASC');
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Criar nova Permissão
exports.createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome da permissão é obrigatório.' });
    }

    const [result] = await pool.query(
      'INSERT INTO permissions (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Permissão criada com sucesso.',
      data: { id: result.insertId, name, description }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Sincronizar/Atribuir Permissões a uma Role
exports.assignPermissionsToRole = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { role_id } = req.params;
    const { permission_ids } = req.body; // Array de IDs de permissões

    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({ success: false, message: 'permission_ids deve ser um array.' });
    }

    await connection.beginTransaction();

    // Limpa permissões antigas da role
    await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [role_id]);

    // Insere as novas
    if (permission_ids.length > 0) {
      const values = permission_ids.map((pId) => [role_id, pId]);
      await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
    }

    await connection.commit();

    return res.status(200).json({ success: true, message: 'Permissões atualizadas para a role com sucesso.' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};