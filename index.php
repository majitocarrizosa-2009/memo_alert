<?php
/**
 * ==========================================================
 * MEMO ALERT - APLICACIÓN PRINCIPAL PHP & HTML5
 * Archivo: index.php
 * ==========================================================
 */

require_once __DIR__ . '/config.php';

$pdo = getDBConnection();
$config = null;
if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM business_config WHERE id = 1 LIMIT 1");
        $config = $stmt->fetch();
    } catch (Exception $e) {
        $config = null;
    }
}

// Valores por defecto si la base de datos no está inicializada aún
$businessName = $config['business_name'] ?? 'Memo Comidas Caseras';
$tagline = $config['tagline'] ?? 'Comida con amor, entregada a tiempo sin olvidos';
$ownerName = $config['owner_name'] ?? 'Guillermo "Don Memo" Ramírez';
$ownerRole = $config['owner_role'] ?? 'Chef Fundador & Maestro Cocinero';
$ownerAvatar = $config['owner_avatar'] ?? '👨‍🍳';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars($businessName); ?> - Control de Pedidos & Cocina</title>
  <!-- Hoja de estilos externa -->
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👨‍🍳</text></svg>">
</head>
<body>

<div class="app-wrapper">
  <!-- Encabezado Principal -->
  <header class="main-header">
    <div class="header-top">
      <div class="brand-section">
        <div class="brand-logo" id="header-brand-avatar"><?php echo htmlspecialchars($ownerAvatar); ?></div>
        <div class="brand-info">
          <h1 id="header-brand-title"><?php echo htmlspecialchars($businessName); ?></h1>
          <p id="header-brand-tagline"><?php echo htmlspecialchars($tagline); ?></p>
        </div>
      </div>

      <div class="header-actions">
        <div class="badge badge-success">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
          <span id="live-clock">--:--:--</span>
        </div>

        <button class="btn btn-outline btn-sm" onclick="AudioEngine.playBellSound()">
          🔔 Probar Campana
        </button>

        <button class="btn btn-primary btn-sm" onclick="simulateNewOrder()">
          + Simular Pedido
        </button>
      </div>
    </div>

    <!-- Barra de Navegación por Pestañas -->
    <nav class="nav-bar">
      <button class="nav-tab active" data-tab="dashboard">
        📊 Tablero Cocina (3 Columnas)
      </button>
      <button class="nav-tab" data-tab="catalog">
        🍽️ Catálogo & Raciones (100)
      </button>
      <button class="nav-tab" data-tab="profile">
        👨‍🍳 Perfil del Emprendedor
      </button>
      <button class="nav-tab" data-tab="client-view">
        🛒 Carta Digital para Clientes
      </button>
    </nav>
  </header>

  <!-- Contenedor Principal Dinámico -->
  <main class="main-content" id="tab-content">
    <!-- Renderizado vía JavaScript desde app.js -->
  </main>
</div>

<!-- Modal para Editar Perfil del Emprendedor -->
<div class="modal-backdrop" id="profile-modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">Editar Perfil & Credenciales del Emprendedor</h3>
      <button class="close-btn" onclick="closeProfileModal()">✕</button>
    </div>
    <form id="profile-form" onsubmit="handleSaveProfileForm(event)">
      <div class="form-group">
        <label class="form-label">Nombre del Chef / Emprendedor:</label>
        <input type="text" id="edit-owner-name" class="form-control" value="<?php echo htmlspecialchars($ownerName); ?>" required>
      </div>
      <div class="form-group">
        <label class="form-label">Cargo / Especialidad:</label>
        <input type="text" id="edit-owner-role" class="form-control" value="<?php echo htmlspecialchars($ownerRole); ?>">
      </div>
      <div class="form-group">
        <label class="form-label">Historia & Biografía:</label>
        <textarea id="edit-owner-bio" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono de Contacto & WhatsApp:</label>
        <input type="text" id="edit-owner-phone" class="form-control" value="+506 8888-1234">
      </div>
      <div class="form-group" style="padding-top: 10px; border-top: 1px solid #e2e8f0;">
        <label class="form-label">🔒 Contraseña PIN de Acceso (4 a 6 dígitos):</label>
        <input type="password" id="edit-owner-pin" class="form-control" maxlength="6" placeholder="1234">
      </div>
      <div class="form-group">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-weight:600; color:#1e293b;">
          <input type="checkbox" id="edit-owner-biometrics" style="width:16px; height:16px;">
          <span>👆 Activar Autenticación por Huella Digital</span>
        </label>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline" onclick="closeProfileModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
      </div>
    </form>
  </div>
</div>

<!-- Lógica JavaScript Principal -->
<script src="app.js"></script>

<script>
  function openProfileModal() {
    document.getElementById('edit-owner-name').value = AppState.config.ownerName;
    document.getElementById('edit-owner-role').value = AppState.config.ownerRole;
    document.getElementById('edit-owner-bio').value = AppState.config.ownerBio;
    document.getElementById('edit-owner-phone').value = AppState.config.phone;
    document.getElementById('edit-owner-pin').value = AppState.config.pinCode || '1234';
    document.getElementById('edit-owner-biometrics').checked = !!AppState.config.biometricsEnabled;
    document.getElementById('profile-modal').classList.add('show');
  }

  function closeProfileModal() {
    document.getElementById('profile-modal').classList.remove('show');
  }

  function handleSaveProfileForm(e) {
    e.preventDefault();
    AppState.config.ownerName = document.getElementById('edit-owner-name').value;
    AppState.config.ownerRole = document.getElementById('edit-owner-role').value;
    AppState.config.ownerBio = document.getElementById('edit-owner-bio').value;
    AppState.config.phone = document.getElementById('edit-owner-phone').value;
    
    const pin = document.getElementById('edit-owner-pin').value;
    if (pin) {
      AppState.config.pinCode = pin;
    }
    AppState.config.biometricsEnabled = document.getElementById('edit-owner-biometrics').checked;
    
    saveData();
    closeProfileModal();
    renderApp();
    alert('¡Perfil y credenciales del emprendedor guardados con éxito!');
  }
</script>

</body>
</html>
