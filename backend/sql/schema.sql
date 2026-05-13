CREATE DATABASE IF NOT EXISTS laptop_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE laptop_store;

CREATE TABLE IF NOT EXISTS `user` (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `brand` (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brand_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `laptop` (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  cpu VARCHAR(255) NOT NULL,
  ram VARCHAR(100) NOT NULL,
  storage VARCHAR(100) NOT NULL,
  gpu VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  brand_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  image VARCHAR(500),
  PRIMARY KEY (id),
  KEY idx_laptop_brand_id (brand_id),
  KEY idx_laptop_name (name),
  KEY idx_laptop_price (price),
  CONSTRAINT fk_laptop_brand
    FOREIGN KEY (brand_id) REFERENCES `brand` (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order` (
  id INT NOT NULL AUTO_INCREMENT,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_user_id (user_id),
  KEY idx_order_status (status),
  CONSTRAINT fk_order_user
    FOREIGN KEY (user_id) REFERENCES `user` (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_item` (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  laptop_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_item_order_id (order_id),
  KEY idx_order_item_laptop_id (laptop_id),
  CONSTRAINT fk_order_item_order
    FOREIGN KEY (order_id) REFERENCES `order` (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_order_item_laptop
    FOREIGN KEY (laptop_id) REFERENCES `laptop` (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
