const pool = require('../config/db');

// ==========================================
// 1. GESTÃO DE SALAS DE DEFESA
// ==========================================

// Criar nova sala de defesa
exports.createRoom = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome da sala é obrigatório.' });
    }

    const [result] = await pool.query(
      'INSERT INTO defense_rooms (name, location, capacity) VALUES (?, ?, ?)',
      [name, location || null, capacity || 30]
    );

    return res.status(201).json({
      success: true,
      message: 'Sala de defesa cadastrada com sucesso.',
      data: { id: result.insertId, name, location, capacity: capacity || 30, is_active: true }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Listar todas as salas
exports.getRooms = async (req, res) => {
  try {
    const [rooms] = await pool.query('SELECT * FROM defense_rooms ORDER BY name ASC');
    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar dados ou status de uma sala
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, is_active } = req.body;

    const [rooms] = await pool.query('SELECT * FROM defense_rooms WHERE id = ?', [id]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Sala não encontrada.' });
    }

    await pool.query(
      `UPDATE defense_rooms SET 
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        capacity = COALESCE(?, capacity),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, location, capacity, is_active, id]
    );

    return res.status(200).json({ success: true, message: 'Sala de defesa atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. CALENDÁRIO E AGENDAMENTO DE DEFESAS
// ==========================================

// Criar agendamento de defesa com membros do júri (Coordenador)
exports.createSchedule = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const created_by = req.user.id;
    const {
      student_id,
      notebook_id,
      tcc_title,
      defense_date,
      start_time,
      end_time,
      room_id,
      tcc_document_url,
      jury_members // Array de objetos: [{ user_id: 1, role_in_jury: 'PRESIDENTE' }, ...]
    } = req.body;

    if (!student_id || !notebook_id || !tcc_title || !defense_date || !start_time || !end_time || !room_id || !tcc_document_url) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos obrigatórios (student_id, notebook_id, tcc_title, defense_date, start_time, end_time, room_id, tcc_document_url).'
      });
    }

    // 1. Verificar se a sala existe e está ativa
    const [rooms] = await connection.query('SELECT is_active FROM defense_rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0 || !rooms[0].is_active) {
      return res.status(400).json({ success: false, message: 'Sala selecionada é inválida ou está inativa.' });
    }

    // 2. Verificar conflito de sala/horário para o mesmo dia (sobreposição de horários)
    const [conflicts] = await connection.query(
      `SELECT id FROM defense_schedules 
       WHERE room_id = ? 
         AND defense_date = ? 
         AND status = 'AGENDADO'
         AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`,
      [room_id, defense_date, end_time, start_time, start_time, start_time, start_time, end_time]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma defesa agendada nesta sala para o horário especificado.'
      });
    }

    // 3. Verificar se o estudante ou o caderno já possuem defesa agendada
    const [existingStudentSchedule] = await connection.query(
      'SELECT id FROM defense_schedules WHERE student_id = ? OR notebook_id = ?',
      [student_id, notebook_id]
    );

    if (existingStudentSchedule.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este estudante ou caderno de orientação já possui uma defesa agendada.'
      });
    }

    // 4. Inserir o agendamento da defesa
    const [scheduleResult] = await connection.query(
      `INSERT INTO defense_schedules (
        student_id, notebook_id, tcc_title, defense_date, start_time, end_time, room_id, tcc_document_url, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AGENDADO', ?)`,
      [student_id, notebook_id, tcc_title, defense_date, start_time, end_time, room_id, tcc_document_url, created_by]
    );

    const scheduleId = scheduleResult.insertId;

    // 5. Inserir membros do Júri (se fornecidos)
    if (Array.isArray(jury_members) && jury_members.length > 0) {
      for (const member of jury_members) {
        if (!member.user_id || !member.role_in_jury) {
          continue;
        }
        await connection.query(
          `INSERT INTO defense_jury_members (defense_schedule_id, user_id, role_in_jury)
           VALUES (?, ?, ?)`,
          [scheduleId, member.user_id, member.role_in_jury]
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Defesa agendada e banca definida com sucesso.',
      data: { id: scheduleId, status: 'AGENDADO' }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Listar agendamentos com filtros (data, sala, status, estudante)
exports.getSchedules = async (req, res) => {
  try {
    const { defense_date, room_id, status, student_id } = req.query;

    let query = `
      SELECT ds.id, ds.student_id, ds.notebook_id, ds.tcc_title, ds.defense_date,
             ds.start_time, ds.end_time, ds.tcc_document_url, ds.status, ds.created_at,
             u.name AS student_name, u.email AS student_email,
             r.id AS room_id, r.name AS room_name, r.location AS room_location,
             cb.name AS created_by_name
      FROM defense_schedules ds
      INNER JOIN users u ON ds.student_id = u.id
      INNER JOIN defense_rooms r ON ds.room_id = r.id
      INNER JOIN users cb ON ds.created_by = cb.id
      WHERE 1=1
    `;
    const params = [];

    if (defense_date) {
      query += ` AND ds.defense_date = ?`;
      params.push(defense_date);
    }
    if (room_id) {
      query += ` AND ds.room_id = ?`;
      params.push(room_id);
    }
    if (status) {
      query += ` AND ds.status = ?`;
      params.push(status);
    }
    if (student_id) {
      query += ` AND ds.student_id = ?`;
      params.push(student_id);
    }

    query += ` ORDER BY ds.defense_date ASC, ds.start_time ASC`;

    const [schedules] = await pool.query(query, params);

    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter detalhes de um agendamento específico (com os membros do júri)
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [schedules] = await pool.query(
      `SELECT ds.*, 
              u.name AS student_name, u.email AS student_email,
              r.name AS room_name, r.location AS room_location,
              cb.name AS created_by_name
       FROM defense_schedules ds
       INNER JOIN users u ON ds.student_id = u.id
       INNER JOIN defense_rooms r ON ds.room_id = r.id
       INNER JOIN users cb ON ds.created_by = cb.id
       WHERE ds.id = ?`,
      [id]
    );

    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento de defesa não encontrado.' });
    }

    const schedule = schedules[0];

    // Buscar membros do júri
    const [jury] = await pool.query(
      `SELECT jm.id, jm.user_id, jm.role_in_jury, u.name AS member_name, u.email AS member_email
       FROM defense_jury_members jm
       INNER JOIN users u ON jm.user_id = u.id
       WHERE jm.defense_schedule_id = ?`,
      [id]
    );

    schedule.jury_members = jury;

    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar status ou informações do agendamento
exports.updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tcc_title, tcc_document_url } = req.body;

    const [schedules] = await pool.query('SELECT * FROM defense_schedules WHERE id = ?', [id]);
    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }

    await pool.query(
      `UPDATE defense_schedules SET
        status = COALESCE(?, status),
        tcc_title = COALESCE(?, tcc_title),
        tcc_document_url = COALESCE(?, tcc_document_url)
       WHERE id = ?`,
      [status, tcc_title, tcc_document_url, id]
    );

    return res.status(200).json({ success: true, message: 'Agendamento atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. GESTÃO DOS MEMBROS DO JÚRI
// ==========================================

// Adicionar um membro à banca
exports.addJuryMember = async (req, res) => {
  try {
    const { id } = req.params; // defense_schedule_id
    const { user_id, role_in_jury } = req.body;

    if (!user_id || !role_in_jury) {
      return res.status(400).json({ success: false, message: 'user_id e role_in_jury são obrigatórios.' });
    }

    // Verificar se o agendamento existe
    const [schedules] = await pool.query('SELECT id FROM defense_schedules WHERE id = ?', [id]);
    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento de defesa não encontrado.' });
    }

    // Adicionar membro
    const [result] = await pool.query(
      `INSERT INTO defense_jury_members (defense_schedule_id, user_id, role_in_jury)
       VALUES (?, ?, ?)`,
      [id, user_id, role_in_jury]
    );

    return res.status(201).json({
      success: true,
      message: 'Membro adicionado ao júri com sucesso.',
      data: { id: result.insertId, defense_schedule_id: id, user_id, role_in_jury }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Este utilizador já faz parte desta banca examinadora.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Remover um membro da banca
exports.removeJuryMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const [result] = await pool.query('DELETE FROM defense_jury_members WHERE id = ?', [memberId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Membro do júri não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Membro removido da banca examinadora.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};