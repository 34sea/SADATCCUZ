const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/userRoutes');
const academicRoutes = require('./routes/academicRoutes');
const preProjectRoutes = require('./routes/preProjectRoutes');
const guidanceNotebookRoutes = require('./routes/guidanceNotebookRoutes');
const scientificArticleRoutes = require('./routes/scientificArticleRoutes');
const defenseScheduleRoutes = require('./routes/defenseScheduleRoutes');
const defenseEvaluationRoutes = require('./routes/defenseEvaluationRoutes');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Expor a pasta de uploads estaticamente (para visualizar as imagens salvas)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/pre-projects', preProjectRoutes);
app.use('/api/guidance-notebooks', guidanceNotebookRoutes);
app.use('/api/scientific-articles', scientificArticleRoutes);
app.use('/api/defenses', defenseScheduleRoutes);
app.use('/api/evaluations', defenseEvaluationRoutes);

module.exports = app;