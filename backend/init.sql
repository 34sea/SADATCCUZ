CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

-- 1. Tabela de Roles (Funções)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Tabela de Permissões
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Tabela Relacional Role <-> Permissão
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT,
  permission_id INT,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Dados Iniciais (Seeds)
INSERT IGNORE INTO roles (id, name) VALUES (1, 'ADMIN'), (2, 'USER');

INSERT IGNORE INTO permissions (id, name) VALUES 
(1, 'READ_USERS'), 
(2, 'CREATE_USER'), 
(3, 'DELETE_USER');

-- Atribui todas as permissões para o ADMIN
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 1), (1, 2), (1, 3);

-- Atribui apenas permissão de leitura para o USER
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, 1);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(255) NOT NULL,
  file_type ENUM('pdf', 'excel') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);