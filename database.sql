-- ==========================================================
-- MEMO ALERT - BASE DE DATOS MYSQL
-- Sistema de Gestión de Pedidos y Memoria para Negocios de Comida
-- Archivo: database.sql
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `memo_alert_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `memo_alert_db`;

-- --------------------------------------------------------
-- 1. Tabla de Configuración y Perfil del Emprendedor
-- --------------------------------------------------------
DROP TABLE IF EXISTS `business_config`;
CREATE TABLE `business_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_name` VARCHAR(150) NOT NULL DEFAULT 'Memo Comidas Caseras',
  `tagline` VARCHAR(255) DEFAULT 'Comida con amor, entregada a tiempo sin olvidos',
  `owner_name` VARCHAR(150) NOT NULL DEFAULT 'Guillermo "Don Memo" Ramírez',
  `owner_role` VARCHAR(150) DEFAULT 'Chef Fundador & Maestro Cocinero',
  `owner_bio` TEXT,
  `owner_avatar` VARCHAR(50) DEFAULT '👨‍🍳',
  `experience_years` INT DEFAULT 8,
  `email` VARCHAR(150) DEFAULT 'donmemo.pedidos@gmail.com',
  `phone` VARCHAR(50) NOT NULL DEFAULT '+506 8888-1234',
  `address` VARCHAR(255) NOT NULL DEFAULT 'Av. Central #45, Barrio El Carmen',
  `currency` VARCHAR(10) NOT NULL DEFAULT '$',
  `social_instagram` VARCHAR(100) DEFAULT '@MemoComidasCaseras',
  `social_facebook` VARCHAR(100) DEFAULT 'Memo Comidas Caseras Oficial',
  `business_hours` VARCHAR(255) DEFAULT 'Lunes a Sábado: 11:00 AM - 10:00 PM | Domingos: 11:30 AM - 8:00 PM',
  `kitchen_status` ENUM('open', 'busy', 'closed') DEFAULT 'open',
  `sound_enabled` TINYINT(1) DEFAULT 1,
  `voice_enabled` TINYINT(1) DEFAULT 1,
  `audio_volume` DECIMAL(3,2) DEFAULT 0.90,
  `alert_sound_type` VARCHAR(50) DEFAULT 'bell',
  `repeat_alert_interval_minutes` INT DEFAULT 3,
  `font_size_preference` ENUM('normal', 'large', 'extra-large') DEFAULT 'normal',
  `pin_code` VARCHAR(20) DEFAULT '1234',
  `biometric_enabled` TINYINT(1) DEFAULT 1,
  `whatsapp_greeting` TEXT,
  `whatsapp_dispatch` TEXT,
  `whatsapp_completed` TEXT,
  `last_reset_date` DATE DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserción inicial de datos del Emprendedor y Configuración
INSERT INTO `business_config` (
  `id`, `business_name`, `tagline`, `owner_name`, `owner_role`, `owner_bio`, `owner_avatar`, 
  `experience_years`, `email`, `phone`, `address`, `currency`, `social_instagram`, `social_facebook`, 
  `business_hours`, `kitchen_status`, `sound_enabled`, `voice_enabled`, `audio_volume`, 
  `alert_sound_type`, `repeat_alert_interval_minutes`, `font_size_preference`, `pin_code`, 
  `biometric_enabled`, `whatsapp_greeting`, `whatsapp_dispatch`, `whatsapp_completed`, `last_reset_date`
) VALUES (
  1, 
  'Memo Comidas Caseras', 
  'Comida con amor, entregada a tiempo sin olvidos', 
  'Guillermo "Don Memo" Ramírez', 
  'Chef Fundador & Maestro Cocinero', 
  'Emprendedor gastronómico apasionado por la cocina tradicional casera desde hace más de 8 años. Preparamos cada platillo al momento con ingredientes frescos, recetas familiares y el compromiso de que ningún cliente sufra retrasos ni olvidos.', 
  '👨‍🍳', 
  8, 
  'donmemo.pedidos@gmail.com', 
  '+506 8888-1234', 
  'Av. Central #45, Barrio El Carmen', 
  '$', 
  '@MemoComidasCaseras', 
  'Memo Comidas Caseras Oficial', 
  'Lunes a Sábado: 11:00 AM - 10:00 PM | Domingos: 11:30 AM - 8:00 PM', 
  'open', 
  1, 
  1, 
  0.90, 
  'bell', 
  3, 
  'normal', 
  '1234', 
  1, 
  '¡Hola! Muchas gracias por preferir Memo Comidas Caseras. Hemos recibido tu pedido con éxito y ya está en cocina.', 
  '¡Buenas noticias! Tu pedido va en camino calientito con nuestro repartidor a tu dirección.', 
  '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes muchísimo. ¡Buen provecho y gracias por apoyar nuestro emprendimiento!', 
  CURDATE()
);

-- --------------------------------------------------------
-- 2. Tabla de Catálogo de Productos y Platillos
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Platos Fuertes',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `description` TEXT,
  `image_icon` VARCHAR(50) DEFAULT '🍽️',
  `stock` INT NOT NULL DEFAULT 100,
  `initial_daily_stock` INT NOT NULL DEFAULT 100,
  `preparation_minutes` INT NOT NULL DEFAULT 15,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserción inicial de platillos con stock diario de 100 unidades
INSERT INTO `products` (`id`, `name`, `category`, `price`, `description`, `image_icon`, `stock`, `initial_daily_stock`, `preparation_minutes`, `is_active`) VALUES
(1, 'Casado Tradicional con Carne Mechada', 'Platos Fuertes', 6.50, 'Arroz blanco, frijoles tiernos, plátano maduro frito, ensalada fresca y deliciosa carne en salsa.', '🍛', 100, 100, 15, 1),
(2, 'Arroz con Pollo a la Criolla', 'Platos Fuertes', 5.50, 'Arroz desgranado cocinado con pechuga de pollo desmenuzada, vegetales frescos y papas tostadas.', '🍗', 100, 100, 12, 1),
(3, 'Sopa de Res con Verduras', 'Sopas & Caldos', 5.00, 'Caldo sustancioso con costilla de res, yuca, plátano verde, chayote y elote tierno.', '🍲', 100, 100, 20, 1),
(4, 'Hamburguesa Casera Especial Don Memo', 'Comidas Rápidas', 4.75, 'Torta de carne 100% res sazonada a la parrilla, queso cheddar derretido, lechuga y salsa secreta.', '🍔', 100, 100, 10, 1),
(5, 'Tacos Crujientes de Pollo (3 uds)', 'Antojos & Entradas', 3.50, 'Tortillas de maíz fritas rellenas de pollo suave, coronadas con repollo fresco y aderezos.', '🌮', 100, 100, 8, 1),
(6, 'Empanadas Caseras de Queso y Frijol', 'Antojos & Entradas', 2.00, 'Masa de maíz crujiente rellena de queso derretido y frijoles molidos artesanales.', '🥟', 100, 100, 7, 1),
(7, 'Fresco Natural de Frutas Mixtas (500ml)', 'Bebidas', 1.50, 'Bebida 100% natural de frutas de temporada bien fría.', '🥤', 100, 100, 3, 1),
(8, 'Café Chorreado Tradicional', 'Bebidas', 1.25, 'Café recién colado en bolsa artesanal.', '☕', 100, 100, 4, 1);

-- --------------------------------------------------------
-- 3. Tabla de Métodos de Pago
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id` VARCHAR(50) PRIMARY KEY,
  `label` VARCHAR(100) NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `instructions` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payment_methods` (`id`, `label`, `enabled`, `instructions`) VALUES
('efectivo', 'Efectivo contra entrega', 1, 'Paga en efectivo al recibir. Especifica si requieres vuelto.'),
('transferencia', 'Transferencia Bancaria / SINPE Móvil', 1, 'Transferir al número: 8888-1234 (Memo Comidas). Enviar comprobante.'),
('tarjeta', 'Tarjeta de Débito / Crédito (Datafono)', 1, 'El repartidor llevará el datáfono inalámbrico a tu puerta.');

-- --------------------------------------------------------
-- 4. Tabla de Pedidos (Orders)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` INT NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_address` TEXT NOT NULL,
  `customer_reference` VARCHAR(255) DEFAULT NULL,
  `customer_notes` TEXT DEFAULT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'efectivo',
  `payment_details` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('recibido', 'pendiente', 'en_camino', 'entregado', 'cancelado') NOT NULL DEFAULT 'recibido',
  `estimated_prep_minutes` INT NOT NULL DEFAULT 15,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` TIMESTAMP NULL DEFAULT NULL,
  `dispatched_at` TIMESTAMP NULL DEFAULT NULL,
  `delivered_at` TIMESTAMP NULL DEFAULT NULL,
  `is_alert_dismissed` TINYINT(1) DEFAULT 0,
  `notes` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Tabla de Detalles del Pedido (Order Items)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `notes` VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Inserción de Pedidos de Ejemplo
-- --------------------------------------------------------
INSERT INTO `orders` (`id`, `order_number`, `customer_name`, `customer_phone`, `customer_address`, `customer_reference`, `total_amount`, `payment_method`, `status`, `estimated_prep_minutes`, `created_at`) VALUES
(1, 101, 'Carlos Alvarado', '+506 7011-2233', 'Calle 4, Casa #12, Portón Negro', 'Frente al parque infantil', 13.00, 'efectivo', 'recibido', 15, NOW()),
(2, 102, 'María Fernández', '+506 8344-5566', 'Barrio San José, Condominio Los Laureles Casa 8', 'Seguridad en aguja', 10.25, 'transferencia', 'pendiente', 20, DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
(3, 103, 'Roberto Vargas', '+506 8912-3456', 'Av. 2da, Oficinas Centrales Piso 3', 'Edificio de cristales azules', 9.50, 'tarjeta', 'en_camino', 10, DATE_SUB(NOW(), INTERVAL 25 MINUTE));

INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `subtotal`, `notes`) VALUES
(1, 1, 'Casado Tradicional con Carne Mechada', 2, 6.50, 13.00, 'Una ensalada sin cebolla'),
(2, 4, 'Hamburguesa Casera Especial Don Memo', 1, 4.75, 4.75, 'Con extra salsa secreta'),
(3, 2, 'Arroz con Pollo a la Criolla', 1, 5.50, 5.50, 'Bien calientito'),
(3, 7, 'Fresco Natural de Frutas Mixtas (500ml)', 1, 1.50, 1.50, 'Sin hielo');
