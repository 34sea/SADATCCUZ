const pool = require('../config/db');

// Listar todos os produtos
exports.getProducts = async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    
    // Formata a URL completa da imagem para o frontend
    const formattedProducts = products.map(p => ({
      ...p,
      image_url: p.image_url ? `${req.protocol}://${req.get('host')}/uploads/${p.image_url}` : null
    }));

    res.json(formattedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obter produto por ID
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });

    const product = rows[0];
    product.image_url = product.image_url ? `${req.protocol}://${req.get('host')}/uploads/${product.image_url}` : null;

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Criar novo produto com imagem
exports.createProduct = async (req, res) => {
  const { name, description } = req.body;
  const image_url = req.file ? req.file.filename : null;

  if (!name) {
    return res.status(400).json({ error: 'O nome do produto é obrigatório' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, image_url) VALUES (?, ?, ?)',
      [name, description || null, image_url]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      image_url: image_url ? `${req.protocol}://${req.get('host')}/uploads/${image_url}` : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deletar produto
exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });

    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};