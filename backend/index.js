const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com o MySQL estabelecida com sucesso!');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Swagger UI disponível em http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Erro ao conectar no MySQL. Tentando novamente em 5s...', err.message);
    setTimeout(startServer, 5000);
  }
}

startServer();