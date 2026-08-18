# Guía de Instalación y Uso - Memo Alert (PHP, JavaScript, CSS, HTML & MySQL)

Este proyecto cuenta con toda la arquitectura lista para ser ejecutada en cualquier servidor web con soporte para **PHP (7.4 o superior / PHP 8.x)** y **MySQL / MariaDB** (como XAMPP, WAMP, Laragon, cPanel, Nginx o Apache).

---

## 📁 Archivos Incluidos

1. **`database/database.sql` (o `database.sql`)**: Script SQL completo para crear la base de datos `memo_alert_db`, las tablas (`business_config`, `products`, `orders`, `order_items`, `payment_methods`) y los datos iniciales de Don Memo.
2. **`config.php`**: Conexión a la base de datos MySQL mediante PDO con manejo de errores y fallback local.
3. **`api.php`**: API RESTful en PHP para consultar/guardar pedidos, catálogo con stock de 100 raciones y perfil del emprendedor.
4. **`index.php`**: Vista principal en HTML5 y PHP con el tablero Kanban de 3 columnas para cocina, catálogo de productos y perfil del chef.
5. **`styles.css`**: Hoja de estilos CSS pura, responsiva y sin dependencias de compilación.
6. **`app.js`**: Lógica de interacción en JavaScript moderno con alertas sonoras (Web Audio API), síntesis de voz en español y gestión de pedidos.

---

## 🚀 Pasos para Instalar en XAMPP / WAMP / Servidor Local

1. **Copiar los archivos**:
   Copia todos los archivos (`index.php`, `config.php`, `api.php`, `styles.css`, `app.js`, `database/`) a tu carpeta pública (por ejemplo: `C:/xampp/htdocs/memo_alert/`).

2. **Importar la Base de Datos MySQL**:
   - Abre **phpMyAdmin** (`http://localhost/phpmyadmin`).
   - Ve a la pestaña **Importar**.
   - Selecciona el archivo `database/database.sql` (o `database.sql`).
   - Haz clic en **Continuar / Importar**. Esto creará automáticamente la base de datos `memo_alert_db` con sus tablas y datos de ejemplo.

3. **Configurar Credenciales en `config.php`** (si usas contraseña en MySQL):
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // Tu contraseña si aplica
   define('DB_NAME', 'memo_alert_db');
   ```

4. **Abrir en el Navegador**:
   Ingresa a: `http://localhost/memo_alert/index.php`

---

## ✨ Funcionalidades Incluidas

- **Tablero de Cocina en 3 Columnas**:
  - *Nuevos Recibidos* (con alarma sonora y de voz).
  - *En Cocina* (en preparación activa).
  - *En Camino* (con repartidor hasta ser entregados).
- **Alertas Sonoras y Voz**: Síntesis de voz en español indicando el número de pedido y campana de aviso.
- **Catálogo con Stock Diario de 100 Raciones**: Contador de existencias con botón de restablecimiento a 100 unidades cada 24 horas.
- **Perfil del Emprendedor**: Información de Don Memo Ramírez, lema del negocio, logros y plantillas rápidas de WhatsApp.
- **Carta Digital para Clientes**: Menú en línea interactivo con carrito de compras.
