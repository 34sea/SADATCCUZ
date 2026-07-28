const pool = require('../config/db');

// Lista Padrão de Checklist Editorial (Gerada automaticamente na criação do artigo)
const DEFAULT_CHECKLIST_ITEMS = [
  'O artigo segue a estrutura IMRaD (Introdução, Metodologia, Resultados e Discussão).',
  'O resumo não excede o limite máximo de palavras estabelecido.',
  'Todas as palavras-chave são adequadas e separadas corretamente.',
  'As referências bibliográficas seguem a norma institucional exigida (ex: ABNT / APA).',
  'As figuras, tabelas e gráficos possuem legenda e citação no texto.',
  'Foram incluídas as declarações editoriais e éticas requeridas.'
];

// Auxiliar para verificar se todos os itens da checklist do artigo foram marcados
const updateChecklistCompletionStatus = async (connection, articleId) => {
  const [totalRows] = await connection.query(
    'SELECT COUNT(*) as total FROM article_checklist_items WHERE article_id = ?',
    [articleId]
  );
  const [checkedRows] = await connection.query(
    'SELECT COUNT(*) as checked FROM article_checklist_items WHERE article_id = ? AND is_checked = TRUE',
    [articleId]
  );

  const total = totalRows[0].total;
  const checked = checkedRows[0].checked;
  const isCompleted = total > 0 && total === checked;

  await connection.query(
    'UPDATE scientific_articles SET is_checklist_completed = ? WHERE id = ?',
    [isCompleted, articleId]
  );

  return isCompleted;
};

// ==========================================
// 1. GESTÃO DO ARTIGO CIENTÍFICO
// ==========================================

// Criar novo rascunho de artigo científico (Estudante)
exports.createArticle = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { notebook_id, title, authors, abstract, keywords } = req.body;
    const student_id = req.user.id;

    if (!notebook_id || !title || !authors) {
      return res.status(400).json({
        success: false,
        message: 'notebook_id, title e authors são obrigatórios.'
      });
    }

    // Verificar se o Caderno de Orientação existe
    const [notebooks] = await connection.query(
      'SELECT id FROM guidance_notebooks WHERE id = ? AND student_id = ?',
      [notebook_id, student_id]
    );

    if (notebooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caderno de orientação não encontrado ou não pertence a este estudante.'
      });
    }

    // Criar o artigo
    const [result] = await connection.query(
      `INSERT INTO scientific_articles (
        student_id, notebook_id, title, authors, abstract, keywords, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'EM_RASCUNHO')`,
      [student_id, notebook_id, title, authors, abstract || null, keywords || null]
    );

    const articleId = result.insertId;

    // Gerar automaticamente os itens padrão da checklist editorial
    for (const itemDescription of DEFAULT_CHECKLIST_ITEMS) {
      await connection.query(
        `INSERT INTO article_checklist_items (article_id, item_description, is_checked)
         VALUES (?, ?, FALSE)`,
        [articleId, itemDescription]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Artigo científico inicializado com sucesso e checklist gerada.',
      data: { id: articleId, status: 'EM_RASCUNHO' }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Atualizar Seções do Artigo (Edição Incremental / Rascunho)
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.id;

    const {
      title,
      authors,
      abstract,
      keywords,
      introduction,
      theoretical_framework,
      methodology,
      results,
      discussion,
      conclusion,
      editorial_declarations,
      references_list
    } = req.body;

    const [articles] = await pool.query('SELECT * FROM scientific_articles WHERE id = ?', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Artigo não encontrado.' });
    }

    const article = articles[0];

    if (article.student_id !== student_id) {
      return res.status(403).json({ success: false, message: 'Sem permissão para alterar este artigo.' });
    }

    if (article.status === 'APROVADO_ORIENTADOR') {
      return res.status(400).json({
        success: false,
        message: 'O artigo já foi aprovado pelo orientador e não pode ser editado.'
      });
    }

    await pool.query(
      `UPDATE scientific_articles SET
        title = COALESCE(?, title),
        authors = COALESCE(?, authors),
        abstract = COALESCE(?, abstract),
        keywords = COALESCE(?, keywords),
        introduction = COALESCE(?, introduction),
        theoretical_framework = COALESCE(?, theoretical_framework),
        methodology = COALESCE(?, methodology),
        results = COALESCE(?, results),
        discussion = COALESCE(?, discussion),
        conclusion = COALESCE(?, conclusion),
        editorial_declarations = COALESCE(?, editorial_declarations),
        references_list = COALESCE(?, references_list)
       WHERE id = ?`,
      [
        title, authors, abstract, keywords, introduction,
        theoretical_framework, methodology, results, discussion,
        conclusion, editorial_declarations, references_list, id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Artigo científico atualizado com sucesso.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter detalhes de um artigo (com checklist)
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await pool.query(
      `SELECT a.*, 
              u.name AS student_name, u.email AS student_email,
              g.advisor_id
       FROM scientific_articles a
       INNER JOIN users u ON a.student_id = u.id
       INNER JOIN guidance_notebooks g ON a.notebook_id = g.id
       WHERE a.id = ?`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Artigo não encontrado.' });
    }

    const article = articles[0];

    // Buscar Itens do Checklist Editorial
    const [checklist] = await pool.query(
      'SELECT * FROM article_checklist_items WHERE article_id = ? ORDER BY id ASC',
      [id]
    );

    article.checklist = checklist;

    return res.status(200).json({ success: true, data: article });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Listar artigos (filtro por estudante ou status)
exports.getArticles = async (req, res) => {
  try {
    const { student_id, notebook_id, status } = req.query;

    let query = `
      SELECT a.id, a.student_id, a.notebook_id, a.title, a.authors, a.keywords, 
             a.is_checklist_completed, a.status, a.created_at, a.updated_at,
             u.name AS student_name
      FROM scientific_articles a
      INNER JOIN users u ON a.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ` AND a.student_id = ?`;
      params.push(student_id);
    }
    if (notebook_id) {
      query += ` AND a.notebook_id = ?`;
      params.push(notebook_id);
    }
    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.updated_at DESC`;

    const [articles] = await pool.query(query, params);

    return res.status(200).json({ success: true, data: articles });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. CHECKLIST EDITORIAL
// ==========================================

// Adicionar um novo item customizado ao checklist
exports.addChecklistItem = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params; // article_id
    const { item_description } = req.body;

    if (!item_description) {
      return res.status(400).json({ success: false, message: 'item_description é obrigatório.' });
    }

    const [result] = await connection.query(
      `INSERT INTO article_checklist_items (article_id, item_description, is_checked)
       VALUES (?, ?, FALSE)`,
      [id, item_description]
    );

    await updateChecklistCompletionStatus(connection, id);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Item adicionado ao checklist.',
      data: { id: result.insertId, item_description, is_checked: false }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// Marcar / Desmarcar item do checklist
exports.toggleChecklistItem = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { itemId } = req.params;
    const { is_checked } = req.body;

    if (typeof is_checked !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_checked deve ser um valor booleano.' });
    }

    const [items] = await connection.query(
      'SELECT article_id FROM article_checklist_items WHERE id = ?',
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item do checklist não encontrado.' });
    }

    const articleId = items[0].article_id;

    await connection.query(
      'UPDATE article_checklist_items SET is_checked = ? WHERE id = ?',
      [is_checked, itemId]
    );

    const isChecklistCompleted = await updateChecklistCompletionStatus(connection, articleId);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Item do checklist atualizado com sucesso.',
      data: { itemId, is_checked, is_checklist_completed: isChecklistCompleted }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

// ==========================================
// 3. FLUXO DE SUBMISSÃO E APROVAÇÃO
// ==========================================

// Submeter Artigo para Revisão do Orientador (Estudante)
exports.submitArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.id;

    const [articles] = await pool.query('SELECT * FROM scientific_articles WHERE id = ?', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Artigo não encontrado.' });
    }

    const article = articles[0];

    if (article.student_id !== student_id) {
      return res.status(403).json({ success: false, message: 'Apenas o estudante autor pode submeter este artigo.' });
    }

    if (!article.is_checklist_completed) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível submeter. Todos os itens do checklist editorial devem estar concluídos.'
      });
    }

    await pool.query(
      "UPDATE scientific_articles SET status = 'SUBMETIDO' WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Artigo científico submetido com sucesso para revisão do orientador.',
      data: { id, status: 'SUBMETIDO' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Aprovar Artigo Científico (Orientador)
exports.approveArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const advisor_id = req.user.id;

    // Verificar se o utilizador atual é o orientador associado ao caderno deste artigo
    const [articles] = await pool.query(
      `SELECT a.*, g.advisor_id 
       FROM scientific_articles a
       INNER JOIN guidance_notebooks g ON a.notebook_id = g.id
       WHERE a.id = ?`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Artigo não encontrado.' });
    }

    const article = articles[0];

    if (article.advisor_id !== advisor_id) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o orientador atribuído a este caderno pode aprovar o artigo.'
      });
    }

    if (article.status !== 'SUBMETIDO') {
      return res.status(400).json({
        success: false,
        message: 'O artigo precisa estar no estado SUBMETIDO para ser aprovado.'
      });
    }

    await pool.query(
      "UPDATE scientific_articles SET status = 'APROVADO_ORIENTADOR' WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Artigo científico aprovado com sucesso pelo orientador.',
      data: { id, status: 'APROVADO_ORIENTADOR' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};