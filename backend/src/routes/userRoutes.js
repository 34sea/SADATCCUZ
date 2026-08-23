const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Operações de login e acesso ao perfil do utilizador autenticado
 *   - name: Utilizadores
 *     description: Gestão do ciclo de vida dos utilizadores do sistema
 *   - name: Roles (Perfis)
 *     description: Gestão dos papéis e atribuição de perfis de acesso
 *   - name: Permissões
 *     description: Gestão do controlo de acesso granulado
 */

// ==========================================
// 1. AUTENTICAÇÃO
// ==========================================

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Autenticação do utilizador (Login)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@sadatcc.ac.mz"
 *               password:
 *                 type: string
 *                 example: "Admin123!"
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso (Retorna o JWT)
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obter perfil do utilizador autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil autenticado
 */
router.get('/profile', authMiddleware, authController.getProfile);

// ==========================================
// 2. UTILIZADORES
// ==========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os utilizadores com filtros opcionais
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por nome da role (ex ESTUDANTE, ORIENTADOR)
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filtrar por utilizadores ativos ou inativos
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 *   post:
 *     summary: Registar novo utilizador
 *     tags: [Utilizadores]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Carlos Alberto Manuel"
 *               email:
 *                 type: string
 *                 example: "carlos.manuel@unizambeze.ac.mz"
 *               password:
 *                 type: string
 *                 example: "MinhaSenhaFort3"
 *               code_number:
 *                 type: string
 *                 example: "202400123"
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1]
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso
 */
router.route('/')
  .get(authMiddleware, authController.getUsers)
  .post(authMiddleware, authController.createUser);

  router.post('/register', authController.createUser);

  router.get('/seed-admin', authController.seedAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obter detalhes de um utilizador específico
 *     tags: [Utilizadores]
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
 *         description: Detalhes do utilizador
 *       404:
 *         description: Utilizador não encontrado
 *   put:
 *     summary: Atualizar dados do utilizador
 *     tags: [Utilizadores]
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
 *               email:
 *                 type: string
 *               code_number:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               password:
 *                 type: string
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Utilizador atualizado
 *   delete:
 *     summary: Eliminar utilizador
 *     tags: [Utilizadores]
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
 *         description: Utilizador eliminado
 */
router.route('/:id')
  .get(authMiddleware, authController.getUserById)
  .put(authMiddleware, authController.updateUser)
  .delete(authMiddleware, authController.deleteUser);

// ==========================================
// 3. ROLES (PERFIS)
// ==========================================

/**
 * @swagger
 * /api/users/roles/all:
 *   get:
 *     summary: Listar todas as roles do sistema
 *     tags: [Roles (Perfis)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *   post:
 *     summary: Criar nova role
 *     tags: [Roles (Perfis)]
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
 *                 example: "SUPERVISOR_PEDAGOGICO"
 *               description:
 *                 type: string
 *                 example: "Acompanha processos pedagógicos"
 *     responses:
 *       201:
 *         description: Role criada
 */
router.route('/roles/all')
  .get(authMiddleware, authController.getRoles)
  .post(authMiddleware, authController.createRole);

// ==========================================
// 4. PERMISSÕES
// ==========================================

/**
 * @swagger
 * /api/users/permissions/all:
 *   get:
 *     summary: Listar todas as permissões
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões
 *   post:
 *     summary: Criar nova permissão
 *     tags: [Permissões]
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
 *                 example: "APPROVE_PRE_PROJECT"
 *               description:
 *                 type: string
 *                 example: "Permissão para aprovar pré-projecto"
 *     responses:
 *       201:
 *         description: Permissão criada
 */
router.route('/permissions/all')
  .get(authMiddleware, authController.getPermissions)
  .post(authMiddleware, authController.createPermission);

/**
 * @swagger
 * /api/users/roles/{role_id}/permissions:
 *   put:
 *     summary: Atribuir ou atualizar lista de permissões de uma role
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role_id
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
 *               - permission_ids
 *             properties:
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Permissões sincronizadas com sucesso
 */
router.put('/roles/:role_id/permissions', authMiddleware, authController.assignPermissionsToRole);

module.exports = router;