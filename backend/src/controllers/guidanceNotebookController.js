const pool = require('../config/db');

// Auxiliar para extrair a subpasta com base no mimetype
const getSubfolderByMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype === 'application/pdf') return 'pdf';
  return 'others';
};

// ==========================================
// 1. GESTÃO DO CADERNO DE ORIENTAÇÃO
// ==========================================

// Criar/Inicializar um Caderno de Orientação (Geralmente acionado pelo Depto ou Orientador)
exports.createNotebook = async (req, res) => {
  try {
    const { student_id, advisor_id, pre_project_id } = req.body;

    if (!student_id || !advisor_id || !pre_project_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id, advisor_id e pre_project_id são obrigatórios.'
      });
    }

    // Verificar se já existe caderno para o pré-projecto
    const [existing] = await pool.query(
      'SELECT id FROM guidance_notebooks WHERE pre_project_id = ?',
      [pre_project_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um caderno de orientação associado a este pré-projecto.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO guidance_notebooks (student_id, advisor_id, pre_project_id)
       VALUES (?, ?, ?)`,
      [student_id, advisor_id, pre_project_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Caderno de orientação criado com sucesso.',
      data: { id: result.insertId, student_id, advisor_id, pre_project_id }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter detalhes completos do caderno
exports.getNotebookById = async (req, res) => {
  try {
    const { id } = req.params;

    const [notebooks] = await pool.query(
      `SELECT g.*, 
              u_student.name AS student_name, u_student.email AS student_email,
              u_advisor.name AS advisor_name, u_advisor.email AS advisor_email,
              p.title AS pre_project_title
       FROM guidance_notebooks g
       INNER JOIN users u_student ON g.student_id = u_student.id
       INNER JOIN users u_advisor ON g.advisor_id = u_advisor.id
       INNER JOIN pre_projects p ON g.pre_project_id = p.id
       WHERE g.id = ?`,
      [id]
    );

    if (notebooks.length === 0) {
      return res.status(404).json({ success: false, message: 'Caderno de orientação não encontrado.' });
    }

    const notebook = notebooks[0];

    // Buscar Sessões
    const [sessions] = await pool.query(
      `SELECT * FROM guidance_sessions WHERE notebook_id = ? ORDER BY session_date DESC`,
      [id]
    );

    // Buscar Tarefas
    const [tasks] = await pool.query(
      `SELECT * FROM guidance_tasks WHERE notebook_id = ? ORDER BY created_at DESC`,
      [id]
    );

    // Buscar Verificações do Departamento
    const [verifications] = await pool.query(
      `SELECT v.*, u.name AS verified_by_name
       FROM guidance_department_verifications v
       INNER JOIN users u ON v.verified_by = u.id
       WHERE v.notebook_id = ?
       ORDER BY v.verified_at DESC`,
      [id]
    );

    notebook.sessions = sessions;
    notebook.tasks = tasks;
    notebook.verifications = verifications;

    return res.status(200).json({ success: true, data: notebook });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Upload das Declarações Finais (Orientador ou Estudante)
exports.uploadDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    const { declaration_type } = req.body; // 'ADVISOR' ou 'STUDENT'

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Ficheiro da declaração é obrigatório.' });
    }

    if (!['ADVISOR', 'STUDENT'].includes(declaration_type)) {
      return res.status(400).json({
        success: false,
        message: 'declaration_type inválido. Escolha "ADVISOR" ou "STUDENT".'
      });
    }

    const subfolder = getSubfolderByMimeType(req.file.mimetype);
    const declaration_url = `/uploads/${subfolder}/${req.file.filename}`;

    const fieldToUpdate = declaration_type === 'ADVISOR' 
      ? 'advisor_declaration_url' 
      : 'student_declaration_url';

    const [result] = await pool.query(
      `UPDATE guidance_notebooks SET ${fieldToUpdate} = ? WHERE id = ?`,
      [declaration_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Caderno de orientação não encontrado.' });
    }

    return res.status(200).json({
      success: true,
      message: `Declaração do ${declaration_type === 'ADVISOR' ? 'Orientador' : 'Estudante'} enviada com sucesso.`,
      data: { declaration_url }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. ESTRUTURA DE BLOCOS E INDICADORES (ESTÁTICO/CONFIGURAÇÃO)
// ==========================================

// Listar todos os blocos e respetivos indicadores
exports.getBlocksWithIndicators = async (req, res) => {
  try {
    const [blocks] = await pool.query('SELECT * FROM guidance_blocks ORDER BY block_number ASC');
    const [indicators] = await pool.query('SELECT * FROM guidance_indicators');

    const result = blocks.map((block) => ({
      ...block,
      indicators: indicators.filter((ind) => ind.block_id === block.id)
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. SESSÕES DE ORIENTAÇÃO & AVALIAÇÃO DE INDICADORES
// ==========================================

// Registar uma Sessão de Orientação com avaliações dos Indicadores
exports.createSession = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { notebook_id, session_date, advisor_notes, evaluations } = req.body;

    if (!notebook_id || !session_date) {
      return res.status(400).json({ success: false, message: 'notebook_id e session_date são obrigatórios.' });
    }

    // Criar a Sessão
    const [sessionResult] = await connection.query(
      `INSERT INTO guidance_sessions (notebook_id, session_date, advisor_notes)
       VALUES (?, ?, ?)`,
      [notebook_id, session_date, advisor_notes || null]
    );

    const sessionId = sessionResult.insertId;

    // Registar Avaliações de Indicadores (se enviadas)
    if (Array.isArray(evaluations) && evaluations.length > 0) {
      for (const evalItem of evaluations) {
        const { indicator_id, status, observations } = evalItem;

        if (indicator_id && status) {
          await connection.query(
            `INSERT INTO guidance_indicator_evaluations (session_id, indicator_id, status, observations)
             VALUES (?, ?, ?, ?)`,
            [sessionId, indicator_id, status, observations || null]
          );
        }
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Sessão de orientação e avaliações registadas com sucesso.',
      data: { session_id: sessionId }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Obter detalhes de uma sessão específica e suas avaliações
exports.getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [sessions] = await pool.query('SELECT * FROM guidance_sessions WHERE id = ?', [sessionId]);
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Sessão não encontrada.' });
    }

    const session = sessions[0];

    const [evaluations] = await pool.query(
      `SELECT e.*, i.indicator_text, b.block_number, b.name AS block_name
       FROM guidance_indicator_evaluations e
       INNER JOIN guidance_indicators i ON e.indicator_id = i.id
       INNER JOIN guidance_blocks b ON i.block_id = b.id
       WHERE e.session_id = ?`,
      [sessionId]
    );

    session.evaluations = evaluations;

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 4. TAREFAS DE ORIENTAÇÃO
// ==========================================

// Criar Tarefa para o Estudante
exports.createTask = async (req, res) => {
  try {
    const { notebook_id, session_id, title, description, deadline } = req.body;

    if (!notebook_id || !title) {
      return res.status(400).json({ success: false, message: 'notebook_id e title são obrigatórios.' });
    }

    const [result] = await pool.query(
      `INSERT INTO guidance_tasks (notebook_id, session_id, title, description, deadline, status)
       VALUES (?, ?, ?, ?, ?, 'PENDENTE')`,
      [notebook_id, session_id || null, title, description || null, deadline || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso.',
      data: { id: result.insertId, title, status: 'PENDENTE' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar Estado da Tarefa (Estudante/Orientador)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDENTE', 'EM_PROGRESSO', 'ENTREGUE', 'CONCLUIDA'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores aceites: ${validStatuses.join(', ')}`
      });
    }

    const [result] = await pool.query(
      'UPDATE guidance_tasks SET status = ? WHERE id = ?',
      [status, taskId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Tarefa não encontrada.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Estado da tarefa atualizado com sucesso.',
      data: { id: taskId, status }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 5. VERIFICAÇÕES DO DEPARTAMENTO E CONCLUSAO
// ==========================================

// Registar Verificação Intermédia ou Final do Departamento
exports.verifyByDepartment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params; // notebook_id
    const { verification_type, status, comments } = req.body;
    const verified_by = req.user.id; // Usuário logado (Chefe/Representante do Depto)

    if (!['INTERMEDIA', 'FINAL'].includes(verification_type)) {
      return res.status(400).json({ success: false, message: 'verification_type deve ser INTERMEDIA ou FINAL.' });
    }

    if (!['APROVADO', 'REPROVADO', 'PENDENTE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status deve ser APROVADO, REPROVADO ou PENDENTE.' });
    }

    // Registar verificação
    await connection.query(
      `INSERT INTO guidance_department_verifications (notebook_id, verification_type, verified_by, status, comments)
       VALUES (?, ?, ?, ?, ?)`,
      [id, verification_type, verified_by, status, comments || null]
    );

    // Atualizar flags na tabela principal
    const passed = status === 'APROVADO';
    let updateQuery = '';

    if (verification_type === 'INTERMEDIA') {
      updateQuery = 'UPDATE guidance_notebooks SET intermediate_check_passed = ? WHERE id = ?';
    } else {
      updateQuery = 'UPDATE guidance_notebooks SET final_check_passed = ? WHERE id = ?';
    }

    await connection.query(updateQuery, [passed, id]);

    // Atualizar is_completed caso ambas as verificações finais e requisitos estejam ok
    const [notebookRows] = await connection.query(
      'SELECT intermediate_check_passed, final_check_passed FROM guidance_notebooks WHERE id = ?',
      [id]
    );

    if (notebookRows.length > 0) {
      const nb = notebookRows[0];
      const isCompleted = nb.intermediate_check_passed && nb.final_check_passed;
      
      await connection.query(
        'UPDATE guidance_notebooks SET is_completed = ? WHERE id = ?',
        [isCompleted, id]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Verificação ${verification_type} registada com sucesso.`,
      data: { verification_type, status }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};