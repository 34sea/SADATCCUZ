const db = require('../config/db');

// Listar documentos (opcionalmente filtrados por tipo: ?type=pdf ou ?type=excel)
exports.getDocuments = async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM documents';
    const queryParams = [];

    if (type && ['pdf', 'excel'].includes(type)) {
      query += ' WHERE file_type = ?';
      queryParams.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [documents] = await db.query(query, queryParams);
    return res.status(200).json(documents);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
};

// Criar novo documento (PDF ou Excel)
exports.createDocument = async (req, res) => {
  try {
    const { name, description, file_type } = req.body;

    if (!name || !file_type) {
      return res.status(400).json({ error: 'Os campos name e file_type são obrigatórios' });
    }

    if (!['pdf', 'excel'].includes(file_type)) {
      return res.status(400).json({ error: 'file_type deve ser "pdf" ou "excel"' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'O arquivo é obrigatório' });
    }

    // Define o nome da subpasta de acordo com o tipo de arquivo recebido
    let subfolder = 'others';
    if (req.file.mimetype === 'application/pdf') {
      subfolder = 'pdf';
    } else if (
      req.file.mimetype === 'application/vnd.ms-excel' ||
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      subfolder = 'excel';
    } else if (req.file.mimetype.startsWith('image/')) {
      subfolder = 'images';
    }

    // Constrói a URL incluindo a subpasta (Ex: /uploads/pdf/file-123456.pdf)
    const file_url = `/uploads/${subfolder}/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO documents (name, description, file_url, file_type) VALUES (?, ?, ?, ?)',
      [name, description, file_url, file_type]
    );

    return res.status(201).json({
      id: result.insertId,
      name,
      description,
      file_url,
      file_type
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar documento' });
  }
};

// Remover documento por ID
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM documents WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    return res.status(200).json({ message: 'Documento removido com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover documento' });
  }
};