const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Cursos
 *     description: Gestão dos cursos académicos da faculdade/departamento
 *   - name: Perfis de Estudante
 *     description: Associação e gestão dos dados académicos do estudante (curso e ano de ingresso)
 */

// ==========================================
// 1. ROTAS DE CURSOS
// ==========================================

/**
 * @swagger
 * /api/academic/courses:
 *   get:
 *     summary: Listar todos os cursos
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos cadastrados
 *   post:
 *     summary: Criar um novo curso
 *     tags: [Cursos]
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Engenharia Informática"
 *               code:
 *                 type: string
 *                 example: "LEI-FCT"
 *     responses:
 *       201:
 *         description: Curso criado com sucesso
 *       400:
 *         description: Código de curso duplicado ou dados inválidos
 */
router.route('/courses')
  .get(authMiddleware, academicController.getCourses)
  .post(authMiddleware, academicController.createCourse);

/**
 * @swagger
 * /api/academic/courses/{id}:
 *   get:
 *     summary: Obter detalhes de um curso por ID
 *     tags: [Cursos]
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
 *         description: Detalhes do curso
 *       404:
 *         description: Curso não encontrado
 *   put:
 *     summary: Atualizar dados de um curso
 *     tags: [Cursos]
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
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Curso atualizado
 *   delete:
 *     summary: Eliminar um curso
 *     tags: [Cursos]
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
 *         description: Curso eliminado com sucesso
 *       400:
 *         description: Impossível eliminar curso com estudantes associados
 */
router.route('/courses/:id')
  .get(authMiddleware, academicController.getCourseById)
  .put(authMiddleware, academicController.updateCourse)
  .delete(authMiddleware, academicController.deleteCourse);

// ==========================================
// 2. ROTAS DE PERFIS DE ESTUDANTES
// ==========================================

/**
 * @swagger
 * /api/academic/students/profiles:
 *   get:
 *     summary: Listar perfis de estudantes com filtros opcionais
 *     tags: [Perfis de Estudante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: integer
 *         description: ID do curso para filtrar
 *       - in: query
 *         name: enrollment_year
 *         schema:
 *           type: integer
 *         description: Ano de ingresso para filtrar (ex 2024)
 *     responses:
 *       200:
 *         description: Lista de perfis académicos de estudantes
 *   post:
 *     summary: Criar ou atualizar perfil académico de estudante
 *     tags: [Perfis de Estudante]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - course_id
 *               - enrollment_year
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 5
 *               course_id:
 *                 type: integer
 *                 example: 1
 *               enrollment_year:
 *                 type: integer
 *                 example: 2022
 *     responses:
 *       200:
 *         description: Perfil académico salvo/atualizado com sucesso
 */
router.route('/students/profiles')
  .get(authMiddleware, academicController.getStudentProfiles)
  .post(authMiddleware, academicController.createOrUpdateStudentProfile);

/**
 * @swagger
 * /api/academic/students/profiles/{user_id}:
 *   get:
 *     summary: Obter perfil académico de um estudante por ID de utilizador
 *     tags: [Perfis de Estudante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil académico do estudante
 *       404:
 *         description: Perfil académico não encontrado
 *   delete:
 *     summary: Eliminar perfil académico de um estudante
 *     tags: [Perfis de Estudante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil eliminado com sucesso
 */
router.route('/students/profiles/:user_id')
  .get(authMiddleware, academicController.getStudentProfileByUserId)
  .delete(authMiddleware, academicController.deleteStudentProfile);

module.exports = router;