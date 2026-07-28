const pool = require('../config/db');

// ==========================================
// 1. FICHA DE AVALIAÇÃO INDIVIDUAL DO JÚRI
// ==========================================

// Criar/Submeter Ficha de Avaliação Individual (por membro do júri)
exports.submitEvaluationSheet = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { jury_member_id, individual_score, considerations, publication_recommended, criteria } = req.body;

    if (!jury_member_id) {
      return res.status(400).json({ success: false, message: 'O id do membro do júri (jury_member_id) é obrigatório.' });
    }

    // 1. Verificar se o membro do júri existe e se pertence ao utilizador autenticado
    const [juryMembers] = await connection.query(
      'SELECT id, user_id FROM defense_jury_members WHERE id = ?',
      [jury_member_id]
    );

    if (juryMembers.length === 0) {
      return res.status(404).json({ success: false, message: 'Membro do júri não encontrado.' });
    }

    if (juryMembers[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o próprio membro da banca pode submeter a sua ficha de avaliação.'
      });
    }

    // 2. Verificar se a ficha já foi criada (devido ao constraint UNIQUE em jury_member_id)
    const [existingSheet] = await connection.query(
      'SELECT id FROM jury_evaluation_sheets WHERE jury_member_id = ?',
      [jury_member_id]
    );

    if (existingSheet.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A ficha de avaliação para este membro do júri já foi submetida.'
      });
    }

    // 3. Inserir a ficha de avaliação
    const [sheetResult] = await connection.query(
      `INSERT INTO jury_evaluation_sheets (jury_member_id, individual_score, considerations, publication_recommended)
       VALUES (?, ?, ?, ?)`,
      [
        jury_member_id,
        individual_score !== undefined ? individual_score : null,
        considerations || null,
        publication_recommended || false
      ]
    );

    const sheetId = sheetResult.insertId;

    // 4. Inserir os critérios detalhados (se informados)
    if (Array.isArray(criteria) && criteria.length > 0) {
      for (const item of criteria) {
        if (item.criterion_name && item.score !== undefined) {
          await connection.query(
            `INSERT INTO jury_evaluation_criteria (sheet_id, criterion_name, score)
             VALUES (?, ?, ?)`,
            [sheetId, item.criterion_name, item.score]
          );
        }
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Ficha de avaliação submetida com sucesso.',
      data: { sheet_id: sheetId }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Obter a ficha de avaliação de um membro do júri
exports.getEvaluationSheetByJuryMember = async (req, res) => {
  try {
    const { juryMemberId } = req.params;

    const [sheets] = await pool.query(
      `SELECT jes.*, jm.defense_schedule_id, jm.user_id, jm.role_in_jury, u.name AS member_name
       FROM jury_evaluation_sheets jes
       INNER JOIN defense_jury_members jm ON jes.jury_member_id = jm.id
       INNER JOIN users u ON jm.user_id = u.id
       WHERE jes.jury_member_id = ?`,
      [juryMemberId]
    );

    if (sheets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ficha de avaliação não encontrada.' });
    }

    const sheet = sheets[0];

    // Buscar os critérios detalhados
    const [criteria] = await pool.query(
      'SELECT id, criterion_name, score FROM jury_evaluation_criteria WHERE sheet_id = ?',
      [sheet.id]
    );

    sheet.criteria = criteria;

    return res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Listar todas as fichas de avaliação de um agendamento de defesa específico
exports.getEvaluationSheetsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const [sheets] = await pool.query(
      `SELECT jes.*, jm.user_id, jm.role_in_jury, u.name AS member_name
       FROM jury_evaluation_sheets jes
       INNER JOIN defense_jury_members jm ON jes.jury_member_id = jm.id
       INNER JOIN users u ON jm.user_id = u.id
       WHERE jm.defense_schedule_id = ?`,
      [scheduleId]
    );

    return res.status(200).json({ success: true, data: sheets });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. ACTA DA DEFESA PÚBLICA
// ==========================================

// Gerar/Registar a Acta de Defesa (Presidente do Júri)
exports.createDefenseMinutes = async (req, res) => {
  try {
    const president_id = req.user.id;
    const {
      defense_schedule_id,
      institutional_header,
      final_score,
      decision,
      deliberation_notes,
      pdf_url,
      docx_url
    } = req.body;

    if (!defense_schedule_id || final_score === undefined || !decision) {
      return res.status(400).json({
        success: false,
        message: 'Preencha os campos obrigatórios (defense_schedule_id, final_score, decision).'
      });
    }

    // 1. Verificar se a defesa existe
    const [schedules] = await pool.query(
      'SELECT id FROM defense_schedules WHERE id = ?',
      [defense_schedule_id]
    );

    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento de defesa não encontrado.' });
    }

    // 2. Verificar se quem está a registar é o Presidente do Júri para este agendamento
    const [presidents] = await pool.query(
      `SELECT id FROM defense_jury_members 
       WHERE defense_schedule_id = ? AND user_id = ? AND role_in_jury = 'PRESIDENTE'`,
      [defense_schedule_id, president_id]
    );

    if (presidents.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o Presidente do Júri designado para esta defesa pode registar a acta.'
      });
    }

    // 3. Verificar se já existe uma acta para este agendamento
    const [existingMinutes] = await pool.query(
      'SELECT id FROM defense_minutes WHERE defense_schedule_id = ?',
      [defense_schedule_id]
    );

    if (existingMinutes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A acta para esta defesa já foi lavrada.'
      });
    }

    // 4. Inserir a Acta
    const [result] = await pool.query(
      `INSERT INTO defense_minutes (
        defense_schedule_id, institutional_header, final_score, decision, deliberation_notes, president_id, pdf_url, docx_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        defense_schedule_id,
        institutional_header || null,
        final_score,
        decision,
        deliberation_notes || null,
        president_id,
        pdf_url || null,
        docx_url || null
      ]
    );

    // 5. Atualizar o estado da defesa para 'REALIZADO'
    await pool.query(
      `UPDATE defense_schedules SET status = 'REALIZADO' WHERE id = ?`,
      [defense_schedule_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Acta de defesa lavrada e status da defesa atualizado para REALIZADO com sucesso.',
      data: { id: result.insertId }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter a Acta de Defesa de um agendamento
exports.getDefenseMinutesBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const [minutes] = await pool.query(
      `SELECT dm.*, 
              ds.tcc_title, ds.defense_date,
              u_student.name AS student_name,
              u_pres.name AS president_name
       FROM defense_minutes dm
       INNER JOIN defense_schedules ds ON dm.defense_schedule_id = ds.id
       INNER JOIN users u_student ON ds.student_id = u_student.id
       INNER JOIN users u_pres ON dm.president_id = u_pres.id
       WHERE dm.defense_schedule_id = ?`,
      [scheduleId]
    );

    if (minutes.length === 0) {
      return res.status(404).json({ success: false, message: 'Acta de defesa não encontrada.' });
    }

    return res.status(200).json({ success: true, data: minutes[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar ficheiros anexos/documentos da Acta (ex: PDF ou DOCX gerados post-hoc)
exports.updateMinutesDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdf_url, docx_url, institutional_header, deliberation_notes } = req.body;

    const [minutes] = await pool.query('SELECT * FROM defense_minutes WHERE id = ?', [id]);
    if (minutes.length === 0) {
      return res.status(404).json({ success: false, message: 'Acta de defesa não encontrada.' });
    }

    await pool.query(
      `UPDATE defense_minutes SET
        pdf_url = COALESCE(?, pdf_url),
        docx_url = COALESCE(?, docx_url),
        institutional_header = COALESCE(?, institutional_header),
        deliberation_notes = COALESCE(?, deliberation_notes)
       WHERE id = ?`,
      [pdf_url, docx_url, institutional_header, deliberation_notes, id]
    );

    return res.status(200).json({ success: true, message: 'Documentos da acta atualizados com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};