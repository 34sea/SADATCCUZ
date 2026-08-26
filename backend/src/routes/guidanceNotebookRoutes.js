const express = require('express');
const router = express.Router();
const guidanceController = require('../controllers/guidanceNotebookController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); 
// ==========================================
// CADERNO DE ORIENTAÇÃO
// ==========================================

/**
 * @swagger
 * /api/guidance-notebooks:
 *   get:
 *     summary: Listar cadernos de orientação do orientador autenticado
 *     tags: [Caderno de Orientação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cadernos do orientador
 */
router.get(
    '/',
    authMiddleware,
    guidanceController.getNotebooksByAdvisor
);


/**
 * @swagger
 * /api/guidance-notebooks:
 *   post:
 *     summary: Criar/Inicializar um caderno de orientação para um pré-projecto
 *     tags: [Caderno de Orientação]
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
 *               - advisor_id
 *               - pre_project_id
 *             properties:
 *               student_id:
 *                 type: integer
 *               advisor_id:
 *                 type: integer
 *               pre_project_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Caderno de orientação criado com sucesso
 */
router.post(
    '/',
    authMiddleware,
    guidanceController.createNotebook
);


/**
 * @swagger
 * /api/guidance-notebooks/blocks:
 *   get:
 *     summary: Listar todos os blocos funcionais e seus indicadores
 *     tags: [Caderno de Orientação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estrutura de blocos e indicadores de verificação
 */
router.get(
    '/blocks',
    authMiddleware,
    guidanceController.getBlocksWithIndicators
);

/**
 * @swagger
 * /api/guidance-notebooks/student/me:
 *   get:
 *     summary: Obter o caderno do aluno autenticado
 *     tags: [Caderno de Orientação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caderno do aluno
 *       404:
 *         description: Caderno não encontrado
 */
router.get(
    '/student/me',
    authMiddleware,
    guidanceController.getMyNotebook
);


/**
 * @swagger
 * /api/guidance-notebooks/{id}:
 *   get:
 *     summary: Obter detalhes completos do caderno
 *     tags: [Caderno de Orientação]
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
 *         description: Detalhes do caderno
 */
router.get(
    '/:id',
    authMiddleware,
    guidanceController.getNotebookById
);
/**
 * @swagger
 * /api/guidance-notebooks/{id}/declarations:
 *   post:
 *     summary: Fazer upload da declaração do orientador ou do estudante
 *     tags: [Caderno de Orientação]
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
 *             required:
 *               - declaration
 *               - declaration_type
 *             properties:
 *               declaration:
 *                 type: string
 *                 format: binary
 *                 description: Ficheiro assinado da declaração (PDF)
 *               declaration_type:
 *                 type: string
 *                 enum: [ADVISOR, STUDENT]
 *     responses:
 *       200:
 *         description: Declaração anexada com sucesso
 */
router.post('/:id/declarations', authMiddleware, upload.single('declaration'), guidanceController.uploadDeclaration);

// ==========================================
// SESSÕES & AVALIAÇÕES
// ==========================================

/**
 * @swagger
 * /api/guidance-notebooks/sessions:
 *   post:
 *     summary: Registar nova sessão de orientação e avaliações dos indicadores
 *     tags: [Sessões & Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notebook_id
 *               - session_date
 *             properties:
 *               notebook_id:
 *                 type: integer
 *               session_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-15"
 *               advisor_notes:
 *                 type: string
 *               evaluations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     indicator_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [CUMPRIDO, CUMPRIDO_PARCIALMENTE, NAO_CUMPRIDO]
 *                     observations:
 *                       type: string
 *     responses:
 *       201:
 *         description: Sessão criada com sucesso
 */
router.post('/sessions', authMiddleware, guidanceController.createSession);

/**
 * @swagger
 * /api/guidance-notebooks/sessions/{sessionId}:
 *   get:
 *     summary: Obter detalhes da sessão e suas avaliações
 *     tags: [Sessões & Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes da sessão
 */
router.get('/sessions/:sessionId', authMiddleware, guidanceController.getSessionById);

// ==========================================
// TAREFAS
// ==========================================

/**
 * @swagger
 * /api/guidance-notebooks/tasks:
 *   post:
 *     summary: Atribuir tarefa ao estudante
 *     tags: [Sessões & Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notebook_id
 *               - title
 *             properties:
 *               notebook_id:
 *                 type: integer
 *               session_id:
 *                 type: integer
 *               title:
 *                 type: string
 *                 example: "Revisão Bibliográfica do Capítulo 2"
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 */
router.post('/tasks', authMiddleware, guidanceController.createTask);

/**
 * @swagger
 * /api/guidance-notebooks/tasks/{taskId}/status:
 *   put:
 *     summary: Atualizar o estado de uma tarefa
 *     tags: [Sessões & Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDENTE, EM_PROGRESSO, ENTREGUE, CONCLUIDA]
 *     responses:
 *       200:
 *         description: Estado da tarefa atualizado com sucesso
 */
router.put('/tasks/:taskId/status', authMiddleware, guidanceController.updateTaskStatus);

// ==========================================
// VERIFICAÇÕES DO DEPARTAMENTO
// ==========================================

/**
 * @swagger
 * /api/guidance-notebooks/{id}/department-verifications:
 *   post:
 *     summary: Registar verificação intermédia ou final pelo Departamento
 *     tags: [Departamento - Verificações]
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
 *               - verification_type
 *               - status
 *             properties:
 *               verification_type:
 *                 type: string
 *                 enum: [INTERMEDIA, FINAL]
 *               status:
 *                 type: string
 *                 enum: [APROVADO, REPROVADO, PENDENTE]
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verificação registada com sucesso
 */
router.post('/:id/department-verifications', authMiddleware, guidanceController.verifyByDepartment);

module.exports = router;