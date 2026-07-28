const pool = require('../config/db');

// Auxiliar para registar histórico de transição de estado
const logStatusChange = async (connection, preProjectId, previousStatus, newStatus, changedBy, comments = null) => {
  await connection.query(
    `INSERT INTO pre_project_status_logs (pre_project_id, previous_status, new_status, changed_by, comments)
     VALUES (?, ?, ?, ?, ?)`,
    [preProjectId, previousStatus, newStatus, changedBy, comments]
  );
};

// Auxiliar para extrair a subpasta com base no mimetype (para construir a URL estática)
const getSubfolderByMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype === 'application/pdf') return 'pdf';
  if (
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'excel';
  }
  return 'others';
};

// ==========================================
// 1. GESTÃO E SUBMISSÃO DE PRÉ-PROJECTOS
// ==========================================

// Submeter um novo pré-projecto com Upload de Ficheiro (Estudante)
exports.submitPreProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { title, thematic_area, proposed_advisor_id, abstract } = req.body;
    const student_id = req.user.id; // Obtido a partir do JWT via authMiddleware

    // Validar se o ficheiro foi anexado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'O ficheiro do pré-projecto (document) é obrigatório.'
      });
    }

    if (!title || !thematic_area || !abstract) {
      return res.status(400).json({
        success: false,
        message: 'Título, área temática e resumo são obrigatórios.'
      });
    }

    // Gerar a URL relativa do ficheiro
    const subfolder = getSubfolderByMimeType(req.file.mimetype);
    const document_url = `/uploads/${subfolder}/${req.file.filename}`;

    // Criar o pré-projecto
    const [result] = await connection.query(
      `INSERT INTO pre_projects 
        (student_id, title, thematic_area, proposed_advisor_id, abstract, document_url, version, status)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'SUBMETIDO')`,
      [student_id, title, thematic_area, proposed_advisor_id || null, abstract, document_url]
    );

    const preProjectId = result.insertId;

    // Registar log de estado inicial
    await logStatusChange(connection, preProjectId, null, 'SUBMETIDO', student_id, 'Primeira submissão do pré-projecto.');

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Pré-projecto e ficheiro submetidos com sucesso.',
      data: {
        id: preProjectId,
        status: 'SUBMETIDO',
        version: 1,
        document_url
      }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Re-submeter pré-projecto corrigido com Upload de Ficheiro (Estudante)
exports.resubmitPreProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { title, thematic_area, proposed_advisor_id, abstract, comments } = req.body;
    const student_id = req.user.id;

    // Buscar estado atual
    const [rows] = await connection.query('SELECT * FROM pre_projects WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pré-projecto não encontrado.' });
    }

    const currentProject = rows[0];

    // Verificar se o estudante é o dono
    if (currentProject.student_id !== student_id) {
      return res.status(403).json({ success: false, message: 'Não tem permissão para alterar este pré-projecto.' });
    }

    // Apenas pré-projectos 'EM_REVISAO' podem ser ressubmetidos
    if (currentProject.status !== 'EM_REVISAO') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pré-projectos com o estado EM_REVISAO podem ser re-submetidos.'
      });
    }

    const newVersion = currentProject.version + 1;
    const previousStatus = currentProject.status;
    const newStatus = 'RESUBMETIDO';

    // Determinar URL do documento (se um novo ficheiro foi enviado, atualiza; caso contrário, mantém o anterior)
    let document_url = currentProject.document_url;
    if (req.file) {
      const subfolder = getSubfolderByMimeType(req.file.mimetype);
      document_url = `/uploads/${subfolder}/${req.file.filename}`;
    }

    await connection.query(
      `UPDATE pre_projects SET
        title = COALESCE(?, title),
        thematic_area = COALESCE(?, thematic_area),
        proposed_advisor_id = COALESCE(?, proposed_advisor_id),
        abstract = COALESCE(?, abstract),
        document_url = ?,
        version = ?,
        status = ?
       WHERE id = ?`,
      [title, thematic_area, proposed_advisor_id, abstract, document_url, newVersion, newStatus, id]
    );

    // Registar no Histórico
    await logStatusChange(
      connection,
      id,
      previousStatus,
      newStatus,
      student_id,
      comments || `Re-submissão da versão ${newVersion}`
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Pré-projecto re-submetido com sucesso (Versão ${newVersion}).`,
      data: {
        id,
        version: newVersion,
        status: newStatus,
        document_url
      }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Listar todos os pré-projectos
exports.getPreProjects = async (req, res) => {
  try {
    const { status, student_id, advisor_id } = req.query;

    let query = `
      SELECT p.*, 
             u_student.name AS student_name, u_student.email AS student_email,
             u_advisor.name AS proposed_advisor_name
      FROM pre_projects p
      INNER JOIN users u_student ON p.student_id = u_student.id
      LEFT JOIN users u_advisor ON p.proposed_advisor_id = u_advisor.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (student_id) {
      query += ` AND p.student_id = ?`;
      params.push(student_id);
    }
    if (advisor_id) {
      query += ` AND p.proposed_advisor_id = ?`;
      params.push(advisor_id);
    }

    query += ` ORDER BY p.updated_at DESC`;

    const [projects] = await pool.query(query, params);

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter detalhes de um pré-projecto por ID
exports.getPreProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const [projects] = await pool.query(
      `SELECT p.*, 
              u_student.name AS student_name, u_student.email AS student_email,
              u_advisor.name AS proposed_advisor_name
       FROM pre_projects p
       INNER JOIN users u_student ON p.student_id = u_student.id
       LEFT JOIN users u_advisor ON p.proposed_advisor_id = u_advisor.id
       WHERE p.id = ?`,
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Pré-projecto não encontrado.' });
    }

    const project = projects[0];

    const [evaluators] = await pool.query(
      `SELECT pe.id AS evaluator_assignment_id, pe.evaluator_id, u_eval.name AS evaluator_name,
              pe.assigned_at, u_coord.name AS assigned_by_name,
              pr.id AS review_id, pr.score, pr.opinion, pr.observations, pr.submitted_at
       FROM pre_project_evaluators pe
       INNER JOIN users u_eval ON pe.evaluator_id = u_eval.id
       INNER JOIN users u_coord ON pe.assigned_by = u_coord.id
       LEFT JOIN pre_project_reviews pr ON pr.pre_project_evaluator_id = pe.id
       WHERE pe.pre_project_id = ?`,
      [id]
    );

    const [logs] = await pool.query(
      `SELECT l.*, u.name AS changed_by_name 
       FROM pre_project_status_logs l
       INNER JOIN users u ON l.changed_by = u.id
       WHERE l.pre_project_id = ?
       ORDER BY l.created_at ASC`,
      [id]
    );

    project.evaluators = evaluators;
    project.status_history = logs;

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. ATRIBUIÇÃO DE AVALIADORES (COORDENAÇÃO)
// ==========================================

exports.assignEvaluators = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { evaluator_ids } = req.body;
    const assigned_by = req.user.id;

    if (!Array.isArray(evaluator_ids) || evaluator_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'A lista evaluator_ids é obrigatória.' });
    }

    const [projects] = await connection.query('SELECT status FROM pre_projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Pré-projecto não encontrado.' });
    }

    const previousStatus = projects[0].status;

    for (const evalId of evaluator_ids) {
      await connection.query(
        `INSERT INTO pre_project_evaluators (pre_project_id, evaluator_id, assigned_by)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by)`,
        [id, evalId, assigned_by]
      );
    }

    const newStatus = 'EM_AVALIACAO';
    await connection.query('UPDATE pre_projects SET status = ? WHERE id = ?', [newStatus, id]);

    await logStatusChange(
      connection,
      id,
      previousStatus,
      newStatus,
      assigned_by,
      `Avaliadores atribuídos pelo coordenador (IDs: ${evaluator_ids.join(', ')}).`
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Avaliadores atribuídos e estado atualizado para EM_AVALIACAO.'
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// ==========================================
// 3. PARECERES E AVALIAÇÃO (AVALIADORES)
// ==========================================

exports.submitReview = async (req, res) => {
  try {
    const { evaluator_assignment_id, score, opinion, observations } = req.body;
    const evaluator_id = req.user.id;

    if (!evaluator_assignment_id || !opinion) {
      return res.status(400).json({
        success: false,
        message: 'evaluator_assignment_id e opinion são obrigatórios.'
      });
    }

    const [assignment] = await pool.query(
      'SELECT pre_project_id, evaluator_id FROM pre_project_evaluators WHERE id = ?',
      [evaluator_assignment_id]
    );

    if (assignment.length === 0) {
      return res.status(404).json({ success: false, message: 'Atribuição de avaliação não encontrada.' });
    }

    if (assignment[0].evaluator_id !== evaluator_id) {
      return res.status(403).json({ success: false, message: 'Não tem permissão para submeter parecer nesta atribuição.' });
    }

    await pool.query(
      `INSERT INTO pre_project_reviews (pre_project_evaluator_id, score, opinion, observations)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         score = VALUES(score),
         opinion = VALUES(opinion),
         observations = VALUES(observations),
         submitted_at = CURRENT_TIMESTAMP`,
      [evaluator_assignment_id, score || null, opinion, observations || null]
    );

    return res.status(200).json({
      success: true,
      message: 'Parecer do avaliador submetido com sucesso.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.finalizeDecision = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { final_decision, comments } = req.body;
    const coordinator_id = req.user.id;

    if (!['APROVADO', 'REPROVADO', 'EM_REVISAO'].includes(final_decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decisão inválida. Opções aceites: APROVADO, REPROVADO, EM_REVISAO.'
      });
    }

    const [projects] = await connection.query('SELECT status FROM pre_projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Pré-projecto não encontrado.' });
    }

    const previousStatus = projects[0].status;
    const newStatus = final_decision;

    await connection.query(
      `UPDATE pre_projects SET status = ?, final_decision = ? WHERE id = ?`,
      [newStatus, final_decision, id]
    );

    await logStatusChange(
      connection,
      id,
      previousStatus,
      newStatus,
      coordinator_id,
      comments || `Decisão final registada: ${final_decision}`
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Decisão final (${final_decision}) homologada com sucesso.`,
      data: { id, status: newStatus, final_decision }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};