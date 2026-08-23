CREATE DATABASE IF NOT EXISTS SADATCC 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE SADATCC;

-- ==========================================
-- 1. ESTRUTURA DE ACESSO, ROLES E PERMISSÕES
-- ==========================================

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'ESTUDANTE', 'ORIENTADOR', 'AVALIADOR_PRE_PROJECTO', 'PRESIDENTE_JURI', 'OPONENTE', 'COORDENADOR_TCC', 'CHEFE_DEPARTAMENTO', 'ADMIN'
  description VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  code_number VARCHAR(50) UNIQUE NULL, -- Código de Estudante ou NUIT/ID Docente
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 2. CURSOS E DADOS ACADÉMICOS
-- ==========================================

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id INT PRIMARY KEY,
  course_id INT NOT NULL,
  enrollment_year INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================
-- 3. SUBMISSÃO E AVALIAÇÃO DE PRÉ-PROJECTOS
-- ==========================================

CREATE TABLE IF NOT EXISTS pre_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  thematic_area VARCHAR(150) NOT NULL,
  proposed_advisor_id INT NULL, -- Orientador proposto
  abstract TEXT NOT NULL,
  document_url VARCHAR(255) NOT NULL,
  version INT DEFAULT 1,
  status ENUM(
    'SUBMETIDO', 
    'EM_ATRIBUICAO_AVALIADORES', 
    'EM_AVALIACAO', 
    'APROVADO', 
    'REPROVADO', 
    'EM_REVISAO', 
    'RESUBMETIDO'
  ) DEFAULT 'SUBMETIDO',
  final_decision ENUM('APROVADO', 'REPROVADO', 'EM_REVISAO') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (proposed_advisor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Histórico de transição do Workflow
CREATE TABLE IF NOT EXISTS pre_project_status_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pre_project_id INT NOT NULL,
  previous_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  changed_by INT NOT NULL,
  comments TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pre_project_id) REFERENCES pre_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Atribuição dos 3 Avaliadores pelo Coordenador
CREATE TABLE IF NOT EXISTS pre_project_evaluators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pre_project_id INT NOT NULL,
  evaluator_id INT NOT NULL,
  assigned_by INT NOT NULL, -- Coordenador de TCC
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pre_project_id, evaluator_id),
  FOREIGN KEY (pre_project_id) REFERENCES pre_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pareceres Individuais dos Avaliadores
CREATE TABLE IF NOT EXISTS pre_project_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pre_project_evaluator_id INT NOT NULL UNIQUE,
  score DECIMAL(5,2) NULL, -- Classificação atribuída (ex: 0.00 a 20.00)
  opinion ENUM('FAVORAVEL', 'FAVORAVEL_COM_RECOMENDACOES', 'DESFAVORAVEL') NOT NULL,
  observations TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pre_project_evaluator_id) REFERENCES pre_project_evaluators(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 4. CADERNO DE VERIFICAÇÃO DAS ORIENTAÇÕES
-- ==========================================

CREATE TABLE IF NOT EXISTS guidance_notebooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  advisor_id INT NOT NULL,
  pre_project_id INT NOT NULL UNIQUE,
  is_completed BOOLEAN DEFAULT FALSE, -- Flag para autorizar agendamento de defesa
  intermediate_check_passed BOOLEAN DEFAULT FALSE, -- Verificação intermédia pelo Dept.
  final_check_passed BOOLEAN DEFAULT FALSE, -- Verificação final pelo Dept.
  advisor_declaration_url VARCHAR(255) NULL, -- Declaração final do orientador
  student_declaration_url VARCHAR(255) NULL, -- Declaração final do estudante
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pre_project_id) REFERENCES pre_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Blocos funcionais do caderno (6 Blocos)
CREATE TABLE IF NOT EXISTS guidance_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  block_number INT NOT NULL, -- 1 a 6
  name VARCHAR(150) NOT NULL,
  description TEXT NULL
) ENGINE=InnoDB;

-- Indicadores de verificação por bloco
CREATE TABLE IF NOT EXISTS guidance_indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  block_id INT NOT NULL,
  indicator_text TEXT NOT NULL,
  FOREIGN KEY (block_id) REFERENCES guidance_blocks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Sessões/Registos de Orientação
CREATE TABLE IF NOT EXISTS guidance_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notebook_id INT NOT NULL,
  session_date DATE NOT NULL,
  advisor_notes TEXT NULL, -- Pareceres/Recomendações do Orientador
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notebook_id) REFERENCES guidance_notebooks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Avaliação dos Indicadores por Sessão/Bloco
CREATE TABLE IF NOT EXISTS guidance_indicator_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  indicator_id INT NOT NULL,
  status ENUM('CUMPRIDO', 'CUMPRIDO_PARCIALMENTE', 'NAO_CUMPRIDO') NOT NULL,
  observations TEXT NULL,
  FOREIGN KEY (session_id) REFERENCES guidance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES guidance_indicators(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tarefas atribuídas ao Estudante
CREATE TABLE IF NOT EXISTS guidance_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notebook_id INT NOT NULL,
  session_id INT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  deadline DATE NULL,
  status ENUM('PENDENTE', 'EM_PROGRESSO', 'ENTREGUE', 'CONCLUIDA') DEFAULT 'PENDENTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notebook_id) REFERENCES guidance_notebooks(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES guidance_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Verificações Globais do Departamento
CREATE TABLE IF NOT EXISTS guidance_department_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notebook_id INT NOT NULL,
  verification_type ENUM('INTERMEDIA', 'FINAL') NOT NULL,
  verified_by INT NOT NULL, -- Representante do Departamento / Chefe
  status ENUM('APROVADO', 'REPROVADO', 'PENDENTE') NOT NULL,
  comments TEXT NULL,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notebook_id) REFERENCES guidance_notebooks(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 5. PRODUÇÃO DO ARTIGO CIENTÍFICO (IMRaD)
-- ==========================================

CREATE TABLE IF NOT EXISTS scientific_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  notebook_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  authors TEXT NOT NULL,
  abstract TEXT NULL,
  keywords VARCHAR(255) NULL,
  introduction TEXT NULL,
  theoretical_framework TEXT NULL,
  methodology TEXT NULL,
  results TEXT NULL,
  discussion TEXT NULL,
  conclusion TEXT NULL,
  editorial_declarations TEXT NULL,
  references_list TEXT NULL,
  is_checklist_completed BOOLEAN DEFAULT FALSE,
  status ENUM('EM_RASCUNHO', 'SUBMETIDO', 'APROVADO_ORIENTADOR') DEFAULT 'EM_RASCUNHO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (notebook_id) REFERENCES guidance_notebooks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Checklist editorial antes da submissão
CREATE TABLE IF NOT EXISTS article_checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  item_description VARCHAR(255) NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (article_id) REFERENCES scientific_articles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 6. CALENDÁRIO DE DEFESAS
-- ==========================================

CREATE TABLE IF NOT EXISTS defense_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- ex: "Sala 102", "Auditório A"
  location VARCHAR(150) NULL,
  capacity INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS defense_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  notebook_id INT NOT NULL UNIQUE,
  tcc_title VARCHAR(255) NOT NULL,
  defense_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_id INT NOT NULL,
  tcc_document_url VARCHAR(255) NOT NULL, -- Documento final do TCC
  status ENUM('AGENDADO', 'REALIZADO', 'CANCELADO') DEFAULT 'AGENDADO',
  created_by INT NOT NULL, -- Coordenador de TCC
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (notebook_id) REFERENCES guidance_notebooks(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES defense_rooms(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Composição do Júri (Presidente, Oponente, Orientador, etc.)
CREATE TABLE IF NOT EXISTS defense_jury_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  defense_schedule_id INT NOT NULL,
  user_id INT NOT NULL,
  role_in_jury ENUM('PRESIDENTE', 'OPONENTE', 'ORIENTADOR', 'VOGAL') NOT NULL,
  UNIQUE(defense_schedule_id, user_id),
  FOREIGN KEY (defense_schedule_id) REFERENCES defense_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 7. FICHA DE AVALIAÇÃO E ACTA DE DEFESA
-- ==========================================

-- Ficha de Avaliação preenchida individualmente por cada membro do Júri
CREATE TABLE IF NOT EXISTS jury_evaluation_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jury_member_id INT NOT NULL UNIQUE,
  individual_score DECIMAL(5,2) NULL, -- Nota atribuída pelo membro
  considerations TEXT NULL,
  publication_recommended BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jury_member_id) REFERENCES defense_jury_members(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Grelha detalhada de critérios (Opcional para discriminar componentes da nota)
CREATE TABLE IF NOT EXISTS jury_evaluation_criteria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sheet_id INT NOT NULL,
  criterion_name VARCHAR(150) NOT NULL, -- ex: "Apresentação Oral", "Qualidade Técnica"
  score DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (sheet_id) REFERENCES jury_evaluation_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Acta da Defesa Pública (Gerada pelo Presidente do Júri)
CREATE TABLE IF NOT EXISTS defense_minutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  defense_schedule_id INT NOT NULL UNIQUE,
  institutional_header TEXT NULL, -- Dados institucionais preenchidos automaticamente
  final_score DECIMAL(5,2) NOT NULL, -- Média / Nota Final
  decision ENUM('APROVADO', 'REPROVADO', 'APROVADO_COM_RECOMENDACOES') NOT NULL,
  deliberation_notes TEXT NULL,
  president_id INT NOT NULL,
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pdf_url VARCHAR(255) NULL,
  docx_url VARCHAR(255) NULL,
  FOREIGN KEY (defense_schedule_id) REFERENCES defense_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (president_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 8. CARGA DE DADOS INICIAIS (SEEDERS)
-- ==========================================

INSERT INTO roles (name, description) VALUES
('ESTUDANTE', 'Estudante em fase de pré-projecto ou elaboração de TCC'),
('ORIENTADOR', 'Docente responsável pela orientação do TCC'),
('AVALIADOR_PRE_PROJECTO', 'Docente designado para avaliar o pré-projecto'),
('PRESIDENTE_JURI', 'Presidente da mesa de Júri da defesa pública'),
('OPONENTE', 'Arguidor/Oponente da defesa pública de TCC'),
('COORDENADOR_TCC', 'Coordenador pedagógico responsável pelo fluxo de TCC'),
('CHEFE_DEPARTAMENTO', 'Chefe do Departamento de Engenharia Informática'),
('ADMIN', 'Administrador do Sistema');

-- Blocos Padrão do Caderno de Orientações (1 a 6)
INSERT INTO guidance_blocks (block_number, name, description) VALUES
(1, 'Bloco I: Concepção e Introdução', 'Definição do problema, objectivos e justificativa'),
(2, 'Bloco II: Revisão da Literatura', 'Fundamentação teórica e estado da arte'),
(3, 'Bloco III: Metodologia e Desenho do Estudo', 'Procedimentos, técnicas e instrumentos de recolha de dados'),
(4, 'Bloco IV: Desenvolvimento e Implementação', 'Execução técnica, prototipagem e colecta de dados'),
(5, 'Bloco V: Análise e Discussão dos Resultados', 'Apresentação dos dados e discussão científica'),
(6, 'Bloco VI: Conclusões e Redação Final', 'Considerações finais, formatação e preparação para defesa');

-- Inserir utilizador Administrador Padrão (Palavra-passe original: Admin123!)
INSERT INTO users (id, name, email, password_hash, code_number)
VALUES (1, 'Administrador do Sistema', 'admin@sadatcc.ac.mz', '$2b$10$e8869h2h0.C/7dJ.oZ8j5.hH5aY5v1f9wQ1yM4kO5L7n0pP3qR9rO', 'ADM001')
ON CONFLICT (email) DO NOTHING;

-- Atribuir a Role de ADMIN ao utilizador criado
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'admin@sadatcc.ac.mz' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;