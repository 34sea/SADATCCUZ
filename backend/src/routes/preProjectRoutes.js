const express = require('express');
const router = express.Router();
const preProjectController = require('../controllers/preProjectController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); 
/**
 * @swagger
 * tags:
 *   - name: Submissão de Pré-Projectos
 *     description: Envio, atualização e consulta de pré-projectos de TCC por estudantes
 *   - name: Avaliação e Pareceres
 *     description: Gestão da atribuição de avaliadores, submissão de pareceres e homologação final
 */

// ==========================================
// 1. SUBMISSÃO DE PRÉ-PROJECTOS
// ==========================================

/**
 * @swagger
 * /api/pre-projects:
 *   get:
 *     summary: Listar pré-projectos com filtros opcionais
 *     tags: [Submissão de Pré-Projectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMETIDO, EM_ATRIBUICAO_AVALIADORES, EM_AVALIACAO, APROVADO, REPROVADO, EM_REVISAO, RESUBMETIDO]
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: advisor_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pré-projectos
 *   post:
 *     summary: Submeter um novo pré-projecto com upload de ficheiro (Estudante)
 *     tags: [Submissão de Pré-Projectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - title
 *               - thematic_area
 *               - abstract
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Ficheiro do pré-projecto (PDF, Imagem ou Excel)
 *               title:
 *                 type: string
 *                 example: "Sistema de Gestão do Processo de TCC"
 *               thematic_area:
 *                 type: string
 *                 example: "Engenharia de Software"
 *               proposed_advisor_id:
 *                 type: integer
 *                 example: 2
 *               abstract:
 *                 type: string
 *                 example: "Resumo e escopo da proposta..."
 *     responses:
 *       201:
 *         description: Pré-projecto submetido com sucesso
 *       400:
 *         description: Ficheiro ou campos obrigatórios em falta / tipo não suportado
 */
router.route('/')
  .get(authMiddleware, preProjectController.getPreProjects)
  .post(authMiddleware, upload.single('document'), preProjectController.submitPreProject);

  // ==========================================
// 5. ACOMPANHAMENTO DO ESTUDANTE
// ==========================================

/**
 * @swagger
 * /api/pre-projects/my-status:
 *   get:
 *     summary: Consultar estado do próprio pré-projecto (Estudante)
 *     tags: [Acompanhamento do Estudante]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado do pré-projecto retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     student_id:
 *                       type: integer
 *                       example: 3
 *                     title:
 *                       type: string
 *                       example: Sistema de gestão de frotas
 *                     thematic_area:
 *                       type: string
 *                       example: Inteligência Artificial
 *                     proposed_advisor_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 5
 *                     proposed_advisor_name:
 *                       type: string
 *                       nullable: true
 *                       example: Dr. João Manuel
 *                     abstract:
 *                       type: string
 *                     document_url:
 *                       type: string
 *                     version:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: EM_AVALIACAO
 *                     final_decision:
 *                       type: string
 *                       nullable: true
 *                       enum:
 *                         - APROVADO
 *                         - REPROVADO
 *                         - EM_REVISAO
 *                         - null
 *                     submission_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     decision_date:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     decision_comments:
 *                       type: string
 *                       nullable: true
 *                     evaluation_summary:
 *                       type: object
 *                       properties:
 *                         total_evaluators:
 *                           type: integer
 *                           example: 3
 *                         completed_evaluations:
 *                           type: integer
 *                           example: 2
 *                         pending_evaluations:
 *                           type: integer
 *                           example: 1
 *                         all_evaluated:
 *                           type: boolean
 *                           example: false
 *                     evaluators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           evaluator_assignment_id:
 *                             type: integer
 *                           evaluator_id:
 *                             type: integer
 *                           evaluator_name:
 *                             type: string
 *                           assigned_at:
 *                             type: string
 *                             format: date-time
 *                           review_id:
 *                             type: integer
 *                             nullable: true
 *                           score:
 *                             type: number
 *                             nullable: true
 *                           opinion:
 *                             type: string
 *                             nullable: true
 *                             enum:
 *                               - FAVORAVEL
 *                               - FAVORAVEL_COM_RECOMENDACOES
 *                               - DESFAVORAVEL
 *                           observations:
 *                             type: string
 *                             nullable: true
 *                           submitted_at:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Pré-projecto não encontrado
 */
router.get(
  '/my-status',
  authMiddleware,
  preProjectController.getMyPreProjectStatus
);

  /**
 * @swagger
 * /api/pre-projects/my-evaluations:
 *   get:
 *     summary: Listar pré-projectos atribuídos ao avaliador autenticado
 *     tags: [Avaliação e Pareceres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - SUBMETIDO
 *             - EM_ATRIBUICAO_AVALIADORES
 *             - EM_AVALIACAO
 *             - APROVADO
 *             - REPROVADO
 *             - EM_REVISAO
 *             - RESUBMETIDO
 *     responses:
 *       200:
 *         description: Lista de pré-projectos atribuídos ao avaliador
 */
router.get(
  '/my-evaluations',
  authMiddleware,
  preProjectController.getMyEvaluations
);

/**
 * @swagger
 * /api/pre-projects/{id}:
 *   get:
 *     summary: Obter detalhes completos do pré-projecto, avaliadores e histórico
 *     tags: [Submissão de Pré-Projectos]
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
 *         description: Detalhes do pré-projecto
 *       404:
 *         description: Pré-projecto não encontrado
 */
router.get('/:id', authMiddleware, preProjectController.getPreProjectById);

/**
 * @swagger
 * /api/pre-projects/{id}/resubmit:
 *   put:
 *     summary: Re-submeter pré-projecto corrigido (Incrementa a versão e permite novo upload)
 *     tags: [Submissão de Pré-Projectos]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Novo ficheiro corrigido (opcional)
 *               title:
 *                 type: string
 *               thematic_area:
 *                 type: string
 *               proposed_advisor_id:
 *                 type: integer
 *               abstract:
 *                 type: string
 *               comments:
 *                 type: string
 *                 example: "Correções efetuadas conforme sugestões do parecer."
 *     responses:
 *       200:
 *         description: Re-submissão efetuada com sucesso
 *       400:
 *         description: O pré-projecto não está no estado EM_REVISAO
 */
router.put('/:id/resubmit', authMiddleware, upload.single('document'), preProjectController.resubmitPreProject);

// ==========================================
// 2. AVALIAÇÃO E PARECERES
// ==========================================

/**
 * @swagger
 * /api/pre-projects/{id}/assign-evaluators:
 *   post:
 *     summary: Atribuir avaliadores ao pré-projecto (Coordenador)
 *     tags: [Avaliação e Pareceres]
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
 *             required:
 *               - evaluator_ids
 *             properties:
 *               evaluator_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3, 4, 7]
 *     responses:
 *       200:
 *         description: Avaliadores atribuídos com sucesso
 */
router.post('/:id/assign-evaluators', authMiddleware, preProjectController.assignEvaluators);

/**
 * @swagger
 * /api/pre-projects/reviews:
 *   post:
 *     summary: Submeter ou atualizar parecer individual de avaliação
 *     tags: [Avaliação e Pareceres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evaluator_assignment_id
 *               - opinion
 *             properties:
 *               evaluator_assignment_id:
 *                 type: integer
 *                 example: 12
 *               score:
 *                 type: number
 *                 format: float
 *                 example: 16.50
 *               opinion:
 *                 type: string
 *                 enum: [FAVORAVEL, FAVORAVEL_COM_RECOMENDACOES, DESFAVORAVEL]
 *               observations:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parecer submetido com sucesso
 */
router.post('/reviews', authMiddleware, preProjectController.submitReview);

/**
 * @swagger
 * /api/pre-projects/{id}/decision:
 *   put:
 *     summary: Registrar decisão final/homologação da avaliação (Coordenador)
 *     tags: [Avaliação e Pareceres]
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
 *             required:
 *               - final_decision
 *             properties:
 *               final_decision:
 *                 type: string
 *                 enum: [APROVADO, REPROVADO, EM_REVISAO]
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Decisão homologada com sucesso
 */
router.put('/:id/decision', authMiddleware, preProjectController.finalizeDecision);

module.exports = router;

