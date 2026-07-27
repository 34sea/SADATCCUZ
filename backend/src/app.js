const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes'); // <--- Importar
const documentRoutes = require('./routes/documentRoutes');

const app = express();

app.use(express.json());

// Expor a pasta de uploads estaticamente (para visualizar as imagens salvas)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api', userRoutes);
app.use('/api', productRoutes); 
app.use('/api', documentRoutes);

module.exports = app;