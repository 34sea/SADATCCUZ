const express = require('express');
const router = express.Router();
const articleController = require('../controllers/scientificArticleController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Artigo Científico (IMRaD)
 *     description: Criação, atualização por seções e fluxo de aprovação do artigo
 *   - name: Checklist Editorial
 *     description: Verificação de requisitos de conformidade editorial pré-submissão
 */

// ==========================================
// 1. GESTÃO E SUBMISSÃO DO ARTIGO
// ==========================================

/**
 * @swagger
 * /api/scientific-articles:
 *   get:
 *     summary: Listar artigos científicos com filtros
 *     tags: [Artigo Científico (IMRaD)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: notebook_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [EM_RASCUNHO, SUBMETIDO, APROVADO_ORIENTADOR]
 *     responses:
 *       200:
 *         description: Lista de artigos científicos
 *   post:
 *     summary: Inicializar um novo rascunho de artigo científico
 *     tags: [Artigo Científico (IMRaD)]
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
 *               - authors
 *             properties:
 *               notebook_id:
 *                 type: integer
 *               title:
 *                 type: string
 *                 example: "Aplicação da IA na Deteção de Anomalias de Rede"
 *               authors:
 *                 type: string
 *                 example: "João Silva, Dr. António Manuel"
 *               abstract:
 *                 type: string
 *               keywords:
 *                 type: string
 *                 example: "Inteligência Artificial, Redes, Segurança"
 *     responses:
 *       201:
 *         description: Artigo inicializado e checklist gerado automaticamente
 */
router.route('/')
  .get(authMiddleware, articleController.getArticles)
  .post(authMiddleware, articleController.createArticle);

/**
 * @swagger
 * /api/scientific-articles/{id}:
 *   get:
 *     summary: Obter conteúdo completo do artigo e estado do checklist
 *     tags: [Artigo Científico (IMRaD)]
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
 *         description: Detalhes e texto completo do artigo
 *   put:
 *     summary: Atualizar seções do artigo (Introdução, Metodologia, Resultados, etc.)
 *     tags: [Artigo Científico (IMRaD)]
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
 *               title:
 *                 type: string
 *               authors:
 *                 type: string
 *               abstract:
 *                 type: string
 *               keywords:
 *                 type: string
 *               introduction:
 *                 type: string
 *               theoretical_framework:
 *                 type: string
 *               methodology:
 *                 type: string
 *               results:
 *                 type: string
 *               discussion:
 *                 type: string
 *               conclusion:
 *                 type: string
 *               editorial_declarations:
 *                 type: string
 *               references_list:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seções atualizadas com sucesso
 */
router.route('/:id')
  .get(authMiddleware, articleController.getArticleById)
  .put(authMiddleware, articleController.updateArticle);

/**
 * @swagger
 * /api/scientific-articles/{id}/submit:
 *   put:
 *     summary: Submeter artigo para revisão do orientador (Requer checklist completo)
 *     tags: [Artigo Científico (IMRaD)]
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
 *         description: Artigo submetido com sucesso
 *       400:
 *         description: Checklist incompleto
 */
router.put('/:id/submit', authMiddleware, articleController.submitArticle);

/**
 * @swagger
 * /api/scientific-articles/{id}/approve:
 *   put:
 *     summary: Aprovar artigo científico (Exclusivo para o Orientador)
 *     tags: [Artigo Científico (IMRaD)]
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
 *         description: Artigo aprovado pelo orientador
 */
router.put('/:id/approve', authMiddleware, articleController.approveArticle);

// ==========================================
// 2. CHECKLIST EDITORIAL
// ==========================================

/**
 * @swagger
 * /api/scientific-articles/{id}/checklist:
 *   post:
 *     summary: Adicionar um novo item ao checklist editorial do artigo
 *     tags: [Checklist Editorial]
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
 *               - item_description
 *             properties:
 *               item_description:
 *                 type: string
 *                 example: "Verificar autorização do comité de ética."
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso
 */
router.post('/:id/checklist', authMiddleware, articleController.addChecklistItem);

/**
 * @swagger
 * /api/scientific-articles/checklist/{itemId}:
 *   put:
 *     summary: Marcar ou desmarcar um item do checklist
 *     tags: [Checklist Editorial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               - is_checked
 *             properties:
 *               is_checked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado do item atualizado
 */
router.put('/checklist/:itemId', authMiddleware, articleController.toggleChecklistItem);

module.exports = router;