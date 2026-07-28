const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/defenseEvaluationController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Ficha de Avaliação do Júri
 *     description: Submissão e consulta das notas/fichas individuais emitidas pelos júris
 *   - name: Acta da Defesa Pública
 *     description: Emissão, deliberação final e gestão de documentos (PDF/DOCX) da acta
 */

// ==========================================
// 1. ROTAS DAS FICHAS DE AVALIAÇÃO
// ==========================================

/**
 * @swagger
 * /api/evaluations/sheets:
 *   post:
 *     summary: Submeter ficha de avaliação individual de um membro do júri
 *     tags: [Ficha de Avaliação do Júri]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jury_member_id
 *             properties:
 *               jury_member_id:
 *                 type: integer
 *               individual_score:
 *                 type: number
 *                 format: float
 *                 example: 16.50
 *               considerations:
 *                 type: string
 *                 example: "Excelente apresentação oral, boa clareza metodológica."
 *               publication_recommended:
 *                 type: boolean
 *                 example: true
 *               criteria:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     criterion_name:
 *                       type: string
 *                       example: "Apresentação Oral"
 *                     score:
 *                       type: number
 *                       format: float
 *                       example: 4.50
 *     responses:
 *       201:
 *         description: Ficha de avaliação submetida com sucesso
 *       403:
 *         description: Acesso não autorizado para preencher por outro membro
 */
router.post('/sheets', authMiddleware, evaluationController.submitEvaluationSheet);

/**
 * @swagger
 * /api/evaluations/sheets/member/{juryMemberId}:
 *   get:
 *     summary: Obter a ficha de avaliação específica de um membro do júri
 *     tags: [Ficha de Avaliação do Júri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: juryMemberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes da ficha de avaliação
 */
router.get('/sheets/member/:juryMemberId', authMiddleware, evaluationController.getEvaluationSheetByJuryMember);

/**
 * @swagger
 * /api/evaluations/sheets/schedule/{scheduleId}:
 *   get:
 *     summary: Obter todas as fichas de avaliação de um agendamento de defesa
 *     tags: [Ficha de Avaliação do Júri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de fichas dos membros do júri daquela defesa
 */
router.get('/sheets/schedule/:scheduleId', authMiddleware, evaluationController.getEvaluationSheetsBySchedule);

// ==========================================
// 2. ROTAS DA ACTA DE DEFESA
// ==========================================

/**
 * @swagger
 * /api/evaluations/minutes:
 *   post:
 *     summary: Lavrar e assinar a Acta da Defesa Pública (Presidente do Júri)
 *     tags: [Acta da Defesa Pública]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - defense_schedule_id
 *               - final_score
 *               - decision
 *             properties:
 *               defense_schedule_id:
 *                 type: integer
 *               institutional_header:
 *                 type: string
 *                 example: "Universidade Exemplo - Faculdade de Engenharia"
 *               final_score:
 *                 type: number
 *                 format: float
 *                 example: 17.00
 *               decision:
 *                 type: string
 *                 enum: [APROVADO, REPROVADO, APROVADO_COM_RECOMENDACOES]
 *               deliberation_notes:
 *                 type: string
 *                 example: "O candidato defendeu satisfatoriamente com pequenas alterações sugeridas no texto."
 *               pdf_url:
 *                 type: string
 *                 example: "https://storage.exemplo.com/actas/acta_123.pdf"
 *               docx_url:
 *                 type: string
 *                 example: "https://storage.exemplo.com/actas/acta_123.docx"
 *     responses:
 *       201:
 *         description: Acta criada e defesa concluída com sucesso
 *       403:
 *         description: Apensa o presidente do júri pode lavrar a acta
 */
router.post('/minutes', authMiddleware, evaluationController.createDefenseMinutes);

/**
 * @swagger
 * /api/evaluations/minutes/schedule/{scheduleId}:
 *   get:
 *     summary: Obter a Acta da Defesa pelo ID do agendamento
 *     tags: [Acta da Defesa Pública]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados detalhados da acta de defesa
 */
router.get('/minutes/schedule/:scheduleId', authMiddleware, evaluationController.getDefenseMinutesBySchedule);

/**
 * @swagger
 * /api/evaluations/minutes/{id}:
 *   put:
 *     summary: Atualizar documentos gerados (PDF/DOCX) ou cabeçalho da acta
 *     tags: [Acta da Defesa Pública]
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
 *               pdf_url:
 *                 type: string
 *               docx_url:
 *                 type: string
 *               institutional_header:
 *                 type: string
 *               deliberation_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documentos da acta atualizados
 */
router.put('/minutes/:id', authMiddleware, evaluationController.updateMinutesDocuments);

module.exports = router;