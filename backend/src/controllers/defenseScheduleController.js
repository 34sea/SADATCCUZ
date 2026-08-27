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
    // const {
    //   student_id,
    //   notebook_id,
    //   tcc_title,
    //   defense_date,
    //   start_time,
    //   end_time,
    //   room_id,
    //   tcc_document_url,
    //   jury_members // Array de objetos: [{ user_id: 1, role_in_jury: 'PRESIDENTE' }, ...]
    // } = req.body;

    const {
    student_id,
    notebook_id,
    tcc_title,
    defense_date,
    start_time,
    end_time,
    room_id,
    jury_members
} = req.body;

    if (!student_id || !notebook_id || !tcc_title || !defense_date || !start_time || !end_time || !room_id) {
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
    // const [scheduleResult] = await connection.query(
    // `INSERT INTO defense_schedules (
    //     student_id,
    //     notebook_id,
    //     tcc_title,
    //     defense_date,
    //     start_time,
    //     end_time,
    //     room_id,
    //     tcc_document_url,
    //     status,
    //     created_by
    // ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 'AGENDADO', ?)`,
    // [
    //     student_id,
    //     notebook_id,
    //     tcc_title,
    //     defense_date,
    //     start_time,
    //     end_time,
    //     room_id,
    //     created_by
    // ]

    // 4. Inserir o agendamento da defesa
    const [scheduleResult] = await connection.query(
      `INSERT INTO defense_schedules (
          student_id,
          notebook_id,
          tcc_title,
          defense_date,
          start_time,
          end_time,
          room_id,
          tcc_document_url,
          status,
          created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AGENDADO', ?)`,
      [
          student_id,
          notebook_id,
          tcc_title,
          defense_date,
          start_time,
          end_time,
          room_id,
          '', // Inicializado com string vazia para satisfazer a restrição NOT NULL
          created_by
      ]
    
);
    
    // await connection.query(
    //   `INSERT INTO defense_schedules (
    //     student_id, notebook_id, tcc_title, defense_date, start_time, end_time, room_id, tcc_document_url, status, created_by
    //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AGENDADO', ?)`,
    //   [student_id, notebook_id, tcc_title, defense_date, start_time, end_time, room_id, tcc_document_url, created_by]
    // );

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

    // 👇 COLOCA AQUI
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const schedulesWithUrl = schedules.map(schedule => ({
      ...schedule,
      tcc_document_url: schedule.tcc_document_url
        ? `${baseUrl}/${schedule.tcc_document_url}`
        : null
    }));

    // 👇 E TROCA O return antigo por este
    return res.status(200).json({
      success: true,
      data: schedulesWithUrl
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
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

// =====================================================
// CARREGAR DOCUMENTO DA DEFESA
// =====================================================
// =====================================================
// CARREGAR VERSÃO FINAL DA MONOGRAFIA
// =====================================================

exports.uploadDefenseDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================================================
    // VERIFICAR ARQUIVO
    // =====================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Selecione um arquivo PDF.'
      });
    }

    // =====================================================
    // VERIFICAR DEFESA
    // =====================================================

    const [schedules] = await pool.query(
      `
      SELECT
        id,
        student_id,
        status,
        tcc_document_url
      FROM defense_schedules
      WHERE id = ?
      `,
      [id]
    );

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento de defesa não encontrado.'
      });
    }

    const schedule = schedules[0];

    // =====================================================
    // GARANTIR QUE A DEFESA PERTENCE AO ESTUDANTE
    // =====================================================

    if (Number(schedule.student_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Não tem permissão para carregar o documento desta defesa.'
      });
    }

    // =====================================================
    // VERIFICAR STATUS
    // =====================================================

    if (schedule.status !== 'AGENDADO') {
      return res.status(400).json({
        success: false,
        message: 'A versão final só pode ser submetida para uma defesa agendada.'
      });
    }

    // =====================================================
    // GARANTIR PDF
    // =====================================================

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Apenas arquivos PDF são permitidos.'
      });
    }

    // =====================================================
    // CAMINHO DO DOCUMENTO
    // =====================================================

    const documentPath = path
      .join('uploads', 'pdf', req.file.filename)
      .replace(/\\/g, '/');

    // =====================================================
    // ATUALIZAR DEFESA
    // =====================================================

    await pool.query(
      `
      UPDATE defense_schedules
      SET tcc_document_url = ?
      WHERE id = ?
      `,
      [documentPath, id]
    );

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return res.status(200).json({
      success: true,
      message: 'Versão final da monografia submetida com sucesso.',
      data: {
        id: schedule.id,
        tcc_document_url: `${baseUrl}/${documentPath}`,
        filename: req.file.filename
      }
    });

  } catch (error) {
    console.error('Erro ao carregar versão final:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar a versão final da monografia.',
      error: error.message
    });
  }
};

// =====================================================
// CONSULTA DAS DEFESAS AGENDADAS PELO ESTUDANTE
// =====================================================

exports.getScheduledDefenses = async (req, res) => {
  try {
    const {
      search,
      defense_date,
      student_id
    } = req.query;

    let query = `
      SELECT
        ds.id,
        ds.student_id,
        ds.notebook_id,
        ds.tcc_title,
        ds.defense_date,
        ds.start_time,
        ds.end_time,
        ds.status,

        -- Estudante
        u.name AS student_name,
        u.email AS student_email,

        -- Sala
        r.id AS room_id,
        r.name AS room_name,
        r.location AS room_location,
        r.capacity AS room_capacity

      FROM defense_schedules ds

      INNER JOIN users u
        ON ds.student_id = u.id

      INNER JOIN defense_rooms r
        ON ds.room_id = r.id

      WHERE ds.status = 'AGENDADO'
    `;

    const params = [];

    // =====================================================
    // PESQUISA POR NOME OU TÍTULO
    // =====================================================

    if (search) {
      query += `
        AND (
          u.name LIKE ?
          OR ds.tcc_title LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      params.push(searchValue, searchValue);
    }

    // =====================================================
    // FILTRO POR DATA
    // =====================================================

    if (defense_date) {
      query += ` AND ds.defense_date = ?`;
      params.push(defense_date);
    }

    // =====================================================
    // FILTRO POR ESTUDANTE
    // =====================================================

    if (student_id) {
      query += ` AND ds.student_id = ?`;
      params.push(student_id);
    }

    query += `
      ORDER BY
        ds.defense_date ASC,
        ds.start_time ASC
    `;

    const [defenses] = await pool.query(query, params);

    // =====================================================
    // BUSCAR BANCAS
    // =====================================================

    if (defenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0
      });
    }

    const defenseIds = defenses.map(defense => defense.id);

    const placeholders = defenseIds.map(() => '?').join(',');

    const [juryMembers] = await pool.query(
      `
      SELECT
        jm.id,
        jm.defense_schedule_id,
        jm.user_id,
        jm.role_in_jury,

        u.name AS member_name,
        u.email AS member_email

      FROM defense_jury_members jm

      INNER JOIN users u
        ON jm.user_id = u.id

      WHERE jm.defense_schedule_id IN (${placeholders})

      ORDER BY
        jm.defense_schedule_id ASC,
        CASE jm.role_in_jury
          WHEN 'PRESIDENTE' THEN 1
          WHEN 'ORIENTADOR' THEN 2
          WHEN 'OPONENTE' THEN 3
          ELSE 4
        END
      `,
      defenseIds
    );

    // =====================================================
    // AGRUPAR BANCA POR DEFESA
    // =====================================================

    const juryMap = {};

    juryMembers.forEach(member => {
      if (!juryMap[member.defense_schedule_id]) {
        juryMap[member.defense_schedule_id] = [];
      }

      juryMap[member.defense_schedule_id].push({
        id: member.id,
        user_id: member.user_id,
        name: member.member_name,
        email: member.member_email,
        role: member.role_in_jury
      });
    });

    // =====================================================
    // MONTAR RESPOSTA FINAL
    // =====================================================

    const data = defenses.map(defense => ({
      id: defense.id,

      student: {
        id: defense.student_id,
        name: defense.student_name,
        email: defense.student_email
      },

      tcc: {
        notebook_id: defense.notebook_id,
        title: defense.tcc_title
      },

      schedule: {
        date: defense.defense_date,
        start_time: defense.start_time,
        end_time: defense.end_time,
        status: defense.status
      },

      room: {
        id: defense.room_id,
        name: defense.room_name,
        location: defense.room_location,
        capacity: defense.room_capacity
      },

      jury: juryMap[defense.id] || []
    }));

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });

  } catch (error) {
    console.error('Erro ao consultar defesas agendadas:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar defesas agendadas.',
      error: error.message
    });
  }
};

// =====================================================
// DEFESA DO ESTUDANTE AUTENTICADO
// =====================================================

exports.getMyDefense = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [schedules] = await pool.query(
      `
      SELECT
        ds.id,
        ds.student_id,
        ds.notebook_id,
        ds.tcc_title,
        ds.defense_date,
        ds.start_time,
        ds.end_time,
        ds.tcc_document_url,
        ds.status,
        ds.created_at,

        -- Estudante
        u.name AS student_name,
        u.email AS student_email,

        -- Sala
        r.id AS room_id,
        r.name AS room_name,
        r.location AS room_location,
        r.capacity AS room_capacity

      FROM defense_schedules ds

      INNER JOIN users u
        ON ds.student_id = u.id

      INNER JOIN defense_rooms r
        ON ds.room_id = r.id

      WHERE ds.student_id = ?

      ORDER BY ds.defense_date DESC, ds.start_time DESC

      LIMIT 1
      `,
      [studentId]
    );

    if (schedules.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Ainda não existe uma defesa agendada para este estudante.',
        data: null
      });
    }

    const defense = schedules[0];

    // =====================================================
    // BUSCAR BANCA
    // =====================================================

    const [jury] = await pool.query(
      `
      SELECT
        jm.id,
        jm.user_id,
        jm.role_in_jury,

        u.name AS member_name,
        u.email AS member_email

      FROM defense_jury_members jm

      INNER JOIN users u
        ON jm.user_id = u.id

      WHERE jm.defense_schedule_id = ?

      ORDER BY
        CASE jm.role_in_jury
          WHEN 'PRESIDENTE' THEN 1
          WHEN 'ORIENTADOR' THEN 2
          WHEN 'OPONENTE' THEN 3
          ELSE 4
        END
      `,
      [defense.id]
    );

    // =====================================================
    // URL DO DOCUMENTO
    // =====================================================

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const documentUrl = defense.tcc_document_url
      ? `${baseUrl}/${defense.tcc_document_url}`
      : null;

    // =====================================================
    // RESPOSTA
    // =====================================================

    return res.status(200).json({
      success: true,
      data: {
        id: defense.id,

        student: {
          id: defense.student_id,
          name: defense.student_name,
          email: defense.student_email
        },

        tcc: {
          notebook_id: defense.notebook_id,
          title: defense.tcc_title
        },

        schedule: {
          date: defense.defense_date,
          start_time: defense.start_time,
          end_time: defense.end_time,
          status: defense.status
        },

        room: {
          id: defense.room_id,
          name: defense.room_name,
          location: defense.room_location,
          capacity: defense.room_capacity
        },

        document: {
          uploaded: !!defense.tcc_document_url,
          url: documentUrl
        },

        jury: jury.map(member => ({
          id: member.id,
          user_id: member.user_id,
          name: member.member_name,
          email: member.member_email,
          role: member.role_in_jury
        }))
      }
    });

  } catch (error) {
    console.error('Erro ao consultar defesa do estudante:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar defesa do estudante.',
      error: error.message
    });
  }
};