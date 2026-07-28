const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');


const app = express();

app.use(express.json());

// Expor a pasta de uploads estaticamente (para visualizar as imagens salvas)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


module.exports = app;