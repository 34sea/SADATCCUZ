const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role_id
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role_id:
 *           type: integer
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "123456"
 *     RoleInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "MANAGER"
 */

// ==========================================
// ROTAS PÚBLICAS (Sem Autenticação)
// ==========================================

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Autentica o usuário e retorna o Token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário (Cadastro público)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post('/users', userController.createUser);

// ==========================================
// MIDDLEWARE DE PROTEÇÃO (JWT)
// Todas as rotas abaixo requerem "Authorization: Bearer <token>"
// ==========================================
router.use(authMiddleware);

// ==========================================
// ROTAS PROTEGIDAS
// ==========================================

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Retorna o perfil completo do usuário logado (extraído do Token JWT)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retorna a lista de usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso
 */
router.get('/users', userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtém um usuário por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Atualiza um usuário completamente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Atualiza campos específicos de um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.route('/users/:id')
  .get(userController.getUserById)
  .put(userController.updateUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Lista todas as roles disponíveis
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *   post:
 *     summary: Cria uma nova role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleInput'
 *     responses:
 *       201:
 *         description: Role criada com sucesso
 */
router.route('/roles')
  .get(userController.getRoles)
  .post(userController.createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtém uma role por ID
 *     tags: [Roles]
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
 *         description: Detalhes da role
 *   put:
 *     summary: Atualiza o nome de uma role
 *     tags: [Roles]
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
 *             $ref: '#/components/schemas/RoleInput'
 *     responses:
 *       200:
 *         description: Role atualizada
 *   delete:
 *     summary: Deleta uma role por ID
 *     tags: [Roles]
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
 *         description: Role removida com sucesso
 */
router.route('/roles/:id')
  .get(userController.getRoleById)
  .put(userController.updateRole)
  .delete(userController.deleteRole);

module.exports = router;