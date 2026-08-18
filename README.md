# 👨‍🍳 Memo Alert - Sistema Inteligente de Gestión de Pedidos y Cocina

**Memo Alert** es una plataforma moderna, intuitiva y asistida por voz diseñada especialmente para negocios gastronómicos, cocinas ocultas y emprendedores. Cuenta con alertas automáticas sonoras y por voz, control de tiempos de cocción acumulativos, seguimiento de repartidores en tiempo real y reinicio automático de inventario diario.

---

## 📌 1. Ficha Técnica y Tecnologías Utilizadas

| Categoría | Tecnología / Herramienta | Versión / Detalle |
| :--- | :--- | :--- |
| **Lenguajes de Programación** | • **TypeScript**<br>• **JavaScript (ES6+)**<br>• **PHP**<br>• **SQL**<br>• **HTML5 & CSS3** | • TypeScript ~5.8<br>• PHP 7.4+ / PHP 8.x<br>• MySQL / MariaDB SQL Dialect |
| **Frameworks & Librerías Frontend** | • **React**<br>• **Vite**<br>• **Tailwind CSS**<br>• **Motion**<br>• **Lucide React**<br>• **Canvas Confetti** | • React v19.0.1<br>• Vite v6.2.3 (Bundler HMR)<br>• Tailwind CSS v4.1<br>• Motion v12.23 (Animaciones)<br>• Lucide Icons |
| **Backend & Servidor** | • **Node.js + Express** (Entorno SPA / API TS)<br>• **PHP Nativo con PDO** (Backend Relacional) | • Express 4.21<br>• PDO MySQL / REST API |
| **Bases de Datos & Almacenamiento** | • **MySQL / MariaDB** (Base de Datos Relacional)<br>• **LocalStorage API** (Caché local offline) | • Motor InnoDB (`utf8mb4_unicode_ci`)<br>• Scripts `database.sql` incluidos |
| **Audio & Síntesis de Voz** | • **Web Audio API**<br>• **Web Speech API (`SpeechSynthesis`)** | • Síntesis en español nativo<br>• Frecuencias sintetizadas de alerta |

---

## 🏗️ 2. Estructura del Proyecto

```text
memo-alert/
├── database/                   # Scripts de Base de Datos
│   └── database.sql            # Esquema SQL completo y datos de ejemplo
├── database.sql                # Copia raíz del esquema MySQL
├── src/                        # Código Fuente Frontend (React + TypeScript)
│   ├── components/             # Componentes modulares de interfaz
│   │   ├── Header.tsx          # Barra superior con estado, reloj y alertas
│   │   ├── Navigation.tsx      # Barra de pestañas (Cocina, Carta, Perfil, Historial)
│   │   ├── Dashboard.tsx       # Tablero Kanban de 3 columnas de cocina
│   │   ├── OrderCard.tsx       # Tarjeta de pedido con temporizadores y botones bloqueables
│   │   ├── ClientOrderingView.tsx # Carta digital interactiva para los clientes
│   │   ├── MenuCatalog.tsx     # Gestión de platillos, precios y existencias
│   │   ├── OrderHistory.tsx    # Historial de ventas, filtros y reportes
│   │   ├── ChefProfile.tsx     # Perfil del chef, biografía y plantillas de WhatsApp
│   │   ├── NewOrderModal.tsx   # Modal para registrar pedidos manuales
│   │   ├── SettingsModal.tsx   # Configuración de audio, PIN y accesibilidad
│   │   └── LoginModal.tsx      # Bloqueo de seguridad por PIN o biometría
│   ├── data/                   # Datos iniciales e inventario base
│   │   └── initialData.ts      # Platillos, recetas y configuración por defecto
│   ├── utils/                  # Utilidades y servicios del sistema
│   │   ├── audioAlerts.ts      # Motor de sonido y lectura en voz alta
│   │   ├── storage.ts          # Control de persistencia y reinicio de 24 horas
│   │   └── voiceControl.ts     # Integración de reconocimiento por voz
│   ├── App.tsx                 # Controlador principal y monitores automáticos
│   ├── index.css               # Estilos globales con Tailwind CSS
│   ├── main.tsx                # Punto de entrada de React
│   └── types.ts                # Definiciones e interfaces de TypeScript
├── api.php                     # API RESTful en PHP para operaciones CRUD
├── config.php                  # Configuración y conexión PDO a MySQL
├── index.php                   # Versión alternativa monolítica en PHP + HTML5
├── app.js                      # Lógica JavaScript para la versión PHP
├── styles.css                  # Estilos CSS puros para la versión PHP
├── INSTRUCCIONES_PHP_MYSQL.md  # Manual específico para despliegues LAMP/WAMP
├── package.json                # Dependencias y scripts de Node.js
├── vite.config.ts              # Configuración de compilación de Vite
└── metadata.json               # Metadatos del proyecto
```

---

## ⚙️ 3. Configuración Inicial y Requisitos

### Requisitos Previos:
- **Node.js**: Versión 18.0.0 o superior instalada.
- **Gestor de Paquetes**: `npm`, `yarn`, `pnpm` o `bun`.
- *(Opcional para modo PHP/MySQL)*: **XAMPP**, **WAMP**, **Laragon** o servidor Apache con **PHP 7.4+** y **MySQL 5.7+ / 8.x**.

---

## 🚀 4. Instalación y Puesta en Marcha

El proyecto se puede ejecutar de dos formas según tu entorno preferido:

### Opción A: Ejecución con React + TypeScript + Vite (Recomendada)

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd memo-alert
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación se abrirá en `http://localhost:3000` con recarga rápida.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

### Opción B: Ejecución con PHP y Base de Datos MySQL (XAMPP / Servidor Web)

1. **Copiar los archivos al servidor web:**
   - Copia la carpeta del proyecto dentro de `htdocs` (por ejemplo, `C:/xampp/htdocs/memo_alert/`).

2. **Crear e Importar la Base de Datos:**
   - Abre **phpMyAdmin** en tu navegador (`http://localhost/phpmyadmin`).
   - Ve a la pestaña **Importar**.
   - Selecciona el archivo `database.sql` y haz clic en **Importar**.
   - Esto creará automáticamente la base de datos `memo_alert_db` con las tablas y datos iniciales.

3. **Configurar Credenciales en `config.php`:**
   Abre el archivo `config.php` y ajusta las credenciales si tu servidor MySQL tiene contraseña:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // Tu contraseña de MySQL si tiene
   define('DB_NAME', 'memo_alert_db');
   ```

4. **Acceder a la aplicación:**
   Ingresa en tu navegador a:
   `http://localhost/memo_alert/index.php`

---

## 🗄️ 5. Esquema de la Base de Datos Relacional (MySQL)

El archivo `database.sql` define las siguientes tablas estructuradas con relaciones e integridad referencial:

1. **`business_config`**:
   - Almacena el nombre del negocio, perfil del chef (Don Memo), avatar, teléfono, moneda, estado de la cocina, preferencias de audio/voz, PIN de seguridad y fecha del último reinicio de inventario.
2. **`products`**:
   - Catálogo de platillos, bebidas y postres con precio, categoría, descripción, ingredientes, tiempo estimado de preparación individual (`preparation_minutes`) y stock diario (`stock`, por defecto 100).
3. **`orders`**:
   - Registros de pedidos con número correlativo, datos del cliente (nombre, teléfono, dirección, notas), método de pago, estado (`recibido`, `pendiente`, `en_camino`, `entregado`, `cancelado`), tiempos acumulados y marcas de tiempo (`createdAt`, `startedPrepAt`, `dispatchedAt`, `deliveredAt`).
4. **`order_items`**:
   - Detalle de cada platillo dentro del pedido (cantidad, precio unitario, minutos de preparación y notas especiales), enlazado con clave foránea a `orders` (`ON DELETE CASCADE`).
5. **`payment_methods`**:
   - Formas de pago activas (Efectivo, Transferencia Bancaria, Tarjeta / Sinpe Móvil) con sus respectivas instrucciones.

---

## 🌟 6. Funcionalidades Principales

### 1. Tablero Kanban de Cocina en 3 Barras
- **Barra 1 (Recibidos)**: Pedidos nuevos entrantes. Cuentan con alarma sonora instantánea y recordatorio automático cada 30 minutos si no han sido enviados a cocinar.
- **Barra 2 (En Cocina / Pendientes)**:
  - **Suma acumulativa de minutos**: Si un pedido tiene varios platos (ej: 20 min + 15 min), el sistema calcula el total (**35 min**).
  - **Botón Inhabilitado con Candado**: Mientras los platos se cocinan, el botón para despachar permanece bloqueado (`disabled`) mostrando el tiempo restante en tiempo real.
  - **Desbloqueo Automático**: Al expirar el tiempo, el botón se habilita en color verde con aviso de voz.
- **Barra 3 (En Camino / Repartidor)**:
  - **Temporizador de Viaje al Domicilio**: Calcula los minutos de trayecto del repartidor.
  - **Botón de Entrega Bloqueado**: El botón para confirmar la entrega permanece inhabilitado hasta que se cumple el tiempo estimado de viaje a la casa del cliente.

### 2. Sistema de Alarma y Asistencia de Voz
- Alerta por voz sintetizada en español nativo que anuncia el número de pedido, nombre del cliente, dirección y detalles de cocción.
- Campanas sonoras sintetizadas sin requerir archivos de audio externos pesados.

### 3. Control de Stock Diario (Ciclo de 24 Horas)
- Cada producto inicia con **100 raciones**.
- Al registrarse pedidos, las existencias se descuentan automáticamente (100 -> 99 -> 98...).
- Al cumplirse el ciclo diario de 24 horas, el sistema restablece de forma automática todas las existencias a 100 raciones.

### 4. Carta Digital para Clientes
- Menú interactivo con pestañas de Comidas, Bebidas y Postres.
- Carrito de compras en tiempo real y formulario de entrega con cálculo transparente del tiempo de espera.

### 5. Seguridad y Accesibilidad
- Bloqueo de sesión con PIN de 4 dígitos o acceso biométrico simulado.
- Modo de tipografía adaptable (*Normal*, *Grande*, *Extra Grande*) para facilitar la lectura en la cocina.

---

## 📜 7. Comandos y Scripts Disponibles

En el entorno Node.js:
- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000`.
- `npm run build`: Genera el paquete optimizado para producción en la carpeta `/dist`.
- `npm run lint`: Ejecuta el validador de tipos de TypeScript (`tsc --noEmit`).
- `npm run preview`: Previsualiza la versión compilada de producción localmente.

---

## 👨‍🍳 Créditos y Licencia
Desarrollado con dedicación para optimizar el servicio gastronómico de **Memo Comidas Caseras**. Distribuido bajo licencia libre para uso comercial y personal.
