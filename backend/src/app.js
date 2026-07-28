const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/userRoutes');
const academicRoutes = require('./routes/academicRoutes');
const preProjectRoutes = require('./routes/preProjectRoutes');


const app = express();

app.use(express.json());

// Expor a pasta de uploads estaticamente (para visualizar as imagens salvas)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/preProjectos', preProjectRoutes);

module.exports = app;