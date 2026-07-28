const express = require('express');
const router = express.Router();
const defenseController = require('../controllers/defenseScheduleController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Salas de Defesa
 *     description: Gestão do espaço físico/salas para bancas de defesa
 *   - name: Calendário de Defesas
 *     description: Agendamento e visualização das sessões de defesa de TCC
 *   - name: Composição do Júri
 *     description: Gestão dos membros da banca examinadora (Presidente, Oponente, etc.)
 */

// ==========================================
// 1. ROTAS DE SALAS DE DEFESA
// ==========================================

/**
 * @swagger
 * /api/defenses/rooms:
 *   get:
 *     summary: Listar todas as salas de defesa
 *     tags: [Salas de Defesa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salas
 *   post:
 *     summary: Criar uma nova sala de defesa
 *     tags: [Salas de Defesa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Auditório A"
 *               location:
 *                 type: string
 *                 example: "Bloco B, 1º Andar"
 *               capacity:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Sala cadastrada com sucesso
 */
router.route('/rooms')
  .get(authMiddleware, defenseController.getRooms)
  .post(authMiddleware, defenseController.createRoom);

/**
 * @swagger
 * /api/defenses/rooms/{id}:
 *   put:
 *     summary: Atualizar dados ou desativar uma sala
 *     tags: [Salas de Defesa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sala atualizada com sucesso
 */
router.put('/rooms/:id', authMiddleware, defenseController.updateRoom);

// ==========================================
// 2. ROTAS DE AGENDAMENTO DE DEFESA
// ==========================================

/**
 * @swagger
 * /api/defenses/schedules:
 *   get:
 *     summary: Listar agendamentos de defesas com filtros
 *     tags: [Calendário de Defesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: defense_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AGENDADO, REALIZADO, CANCELADO]
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de defesas agendadas
 *   post:
 *     summary: Agendar uma defesa e definir a banca examinadora
 *     tags: [Calendário de Defesas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - notebook_id
 *               - tcc_title
 *               - defense_date
 *               - start_time
 *               - end_time
 *               - room_id
 *               - tcc_document_url
 *             properties:
 *               student_id:
 *                 type: integer
 *               notebook_id:
 *                 type: integer
 *               tcc_title:
 *                 type: string
 *                 example: "Sistema Integrado de Gestão de TCC"
 *               defense_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-20"
 *               start_time:
 *                 type: string
 *                 example: "09:00:00"
 *               end_time:
 *                 type: string
 *                 example: "10:30:00"
 *               room_id:
 *                 type: integer
 *               tcc_document_url:
 *                 type: string
 *                 example: "https://storage.exemplo.com/docs/tcc-final-joao.pdf"
 *               jury_members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                     role_in_jury:
 *                       type: string
 *                       enum: [PRESIDENTE, OPONENTE, ORIENTADOR, VOGAL]
 *     responses:
 *       201:
 *         description: Defesa agendada com sucesso
 *       400:
 *         description: Conflito de horário/sala ou utilizador já agendado
 */
router.route('/schedules')
  .get(authMiddleware, defenseController.getSchedules)
  .post(authMiddleware, defenseController.createSchedule);

/**
 * @swagger
 * /api/defenses/schedules/{id}:
 *   get:
 *     summary: Obter detalhes do agendamento de defesa (inclui banca e local)
 *     tags: [Calendário de Defesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do agendamento
 *   put:
 *     summary: Atualizar status ou informações do agendamento
 *     tags: [Calendário de Defesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AGENDADO, REALIZADO, CANCELADO]
 *               tcc_title:
 *                 type: string
 *               tcc_document_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agendamento atualizado
 */
router.route('/schedules/:id')
  .get(authMiddleware, defenseController.getScheduleById)
  .put(authMiddleware, defenseController.updateScheduleStatus);

// ==========================================
// 3. ROTAS DE COMPOSIÇÃO DO JÚRI
// ==========================================

/**
 * @swagger
 * /api/defenses/schedules/{id}/jury:
 *   post:
 *     summary: Adicionar um membro à banca examinadora
 *     tags: [Composição do Júri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do agendamento da defesa
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role_in_jury
 *             properties:
 *               user_id:
 *                 type: integer
 *               role_in_jury:
 *                 type: string
 *                 enum: [PRESIDENTE, OPONENTE, ORIENTADOR, VOGAL]
 *     responses:
 *       201:
 *         description: Membro adicionado com sucesso
 */
router.post('/schedules/:id/jury', authMiddleware, defenseController.addJuryMember);

/**
 * @swagger
 * /api/defenses/jury/{memberId}:
 *   delete:
 *     summary: Remover um membro da banca examinadora
 *     tags: [Composição do Júri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membro removido com sucesso
 */
router.delete('/jury/:memberId', authMiddleware, defenseController.removeJuryMember);

module.exports = router;