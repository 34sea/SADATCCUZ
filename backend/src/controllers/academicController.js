const pool = require('../config/db');

// ==========================================
// 1. GESTÃO DE CURSOS (COURSES)
// ==========================================

// Listar todos os cursos
exports.getCourses = async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT c.*, COUNT(sp.user_id) AS total_students
       FROM courses c
       LEFT JOIN student_profiles sp ON c.id = sp.course_id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter curso por ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const [courses] = await pool.query(
      `SELECT c.*, COUNT(sp.user_id) AS total_students
       FROM courses c
       LEFT JOIN student_profiles sp ON c.id = sp.course_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    }

    return res.status(200).json({ success: true, data: courses[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Criar novo curso
exports.createCourse = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Nome e código do curso são obrigatórios.' });
    }

    // Verificar se código já existe
    const [existing] = await pool.query('SELECT id FROM courses WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Já existe um curso registrado com este código.' });
    }

    const [result] = await pool.query(
      'INSERT INTO courses (name, code) VALUES (?, ?)',
      [name, code]
    );

    return res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso.',
      data: { id: result.insertId, name, code }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar curso
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const [result] = await pool.query(
      `UPDATE courses SET 
        name = COALESCE(?, name),
        code = COALESCE(?, code)
       WHERE id = ?`,
      [name, code, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Curso atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar curso
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Curso eliminado com sucesso.' });
  } catch (error) {
    // Tratamento caso existam estudantes vinculados (FOREIGN KEY RESTRICT)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível eliminar um curso que possui estudantes associados.'
      });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. PERFIS ACADÉMICOS DE ESTUDANTES
// ==========================================

// Listar perfis de estudantes (com filtros por curso e ano de ingresso)
exports.getStudentProfiles = async (req, res) => {
  try {
    const { course_id, enrollment_year } = req.query;

    let query = `
      SELECT sp.user_id, u.name AS student_name, u.email, u.code_number,
             sp.enrollment_year, c.id AS course_id, c.name AS course_name, c.code AS course_code
      FROM student_profiles sp
      INNER JOIN users u ON sp.user_id = u.id
      INNER JOIN courses c ON sp.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      query += ` AND sp.course_id = ?`;
      params.push(course_id);
    }

    if (enrollment_year) {
      query += ` AND sp.enrollment_year = ?`;
      params.push(enrollment_year);
    }

    query += ` ORDER BY u.name ASC`;

    const [profiles] = await pool.query(query, params);

    return res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter perfil académico de um estudante específico
exports.getStudentProfileByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [profiles] = await pool.query(
      `SELECT sp.user_id, u.name AS student_name, u.email, u.code_number,
              sp.enrollment_year, c.id AS course_id, c.name AS course_name, c.code AS course_code
       FROM student_profiles sp
       INNER JOIN users u ON sp.user_id = u.id
       INNER JOIN courses c ON sp.course_id = c.id
       WHERE sp.user_id = ?`,
      [user_id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ success: false, message: 'Perfil académico do estudante não encontrado.' });
    }

    return res.status(200).json({ success: true, data: profiles[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Criar ou Vincular Perfil Académico a um Utilizador (Estudante)
exports.createOrUpdateStudentProfile = async (req, res) => {
  try {
    const { user_id, course_id, enrollment_year } = req.body;

    if (!user_id || !course_id || !enrollment_year) {
      return res.status(400).json({
        success: false,
        message: 'user_id, course_id e enrollment_year são obrigatórios.'
      });
    }

    // Verificar se o utilizador existe
    const [userExists] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    // Verificar se o curso existe
    const [courseExists] = await pool.query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (courseExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    }

    // UPSERT (Insere se não existir ou atualiza se já existir)
    await pool.query(
      `INSERT INTO student_profiles (user_id, course_id, enrollment_year)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         course_id = VALUES(course_id),
         enrollment_year = VALUES(enrollment_year)`,
      [user_id, course_id, enrollment_year]
    );

    return res.status(200).json({
      success: true,
      message: 'Perfil académico do estudante registado/atualizado com sucesso.',
      data: { user_id, course_id, enrollment_year }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar perfil académico de um estudante
exports.deleteStudentProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [result] = await pool.query('DELETE FROM student_profiles WHERE user_id = ?', [user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Perfil académico não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Perfil académico eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};