const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../config/multer');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         file_url:
 *           type: string
 *         file_type:
 *           type: string
 *           enum: [pdf, excel]
 *         created_at:
 *           type: string
 *           format: date-time
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Lista todos os documentos (PDF e Excel)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         description: Filtra por tipo de arquivo (pdf ou excel)
 *     responses:
 *       200:
 *         description: Lista de documentos obtida com sucesso
 *   post:
 *     summary: Envia um novo documento (PDF ou Excel)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - file_type
 *               - file
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Relatório Financeiro Q3"
 *               description:
 *                 type: string
 *                 example: "Balanço das contas do terceiro trimestre"
 *               file_type:
 *                 type: string
 *                 enum: [pdf, excel]
 *                 example: "pdf"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Documento enviado com sucesso
 */
router.route('/documents')
  .get(documentController.getDocuments)
  .post(upload.single('file'), documentController.createDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Remove um documento por ID
 *     tags: [Documents]
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
 *         description: Documento removido com sucesso
 *       404:
 *         description: Documento não encontrado
 */
router.route('/documents/:id')
  .delete(documentController.deleteDocument);

module.exports = router;