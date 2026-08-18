<?php
/**
 * ==========================================================
 * MEMO ALERT - API RESTful PHP & MYSQL
 * Archivo: api.php
 * ==========================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$pdo = getDBConnection();
$action = isset($_GET['action']) ? $_GET['action'] : '';

if (!$pdo) {
    echo json_encode([
        'status' => 'offline_mode',
        'message' => 'Base de datos MySQL no conectada. La aplicación funcionará en modo LocalStorage en navegador.',
        'data' => null
    ]);
    exit;
}

try {
    switch ($action) {
        // ----------------------------------------------------
        // 1. OBTENER / ACTUALIZAR CONFIGURACIÓN Y PERFIL
        // ----------------------------------------------------
        case 'get_config':
            $stmt = $pdo->query("SELECT * FROM business_config WHERE id = 1 LIMIT 1");
            $config = $stmt->fetch();
            echo json_encode(['status' => 'success', 'data' => $config]);
            break;

        case 'update_config':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']);
                exit;
            }
            $sql = "UPDATE business_config SET 
                    business_name = :business_name,
                    tagline = :tagline,
                    owner_name = :owner_name,
                    owner_role = :owner_role,
                    owner_bio = :owner_bio,
                    owner_avatar = :owner_avatar,
                    experience_years = :experience_years,
                    email = :email,
                    phone = :phone,
                    address = :address,
                    currency = :currency,
                    social_instagram = :social_instagram,
                    social_facebook = :social_facebook,
                    business_hours = :business_hours,
                    kitchen_status = :kitchen_status,
                    sound_enabled = :sound_enabled,
                    voice_enabled = :voice_enabled,
                    audio_volume = :audio_volume,
                    alert_sound_type = :alert_sound_type,
                    repeat_alert_interval_minutes = :repeat_alert_interval_minutes,
                    font_size_preference = :font_size_preference,
                    pin_code = :pin_code,
                    biometric_enabled = :biometric_enabled,
                    whatsapp_greeting = :whatsapp_greeting,
                    whatsapp_dispatch = :whatsapp_dispatch,
                    whatsapp_completed = :whatsapp_completed
                    WHERE id = 1";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':business_name' => $input['business_name'] ?? 'Memo Comidas Caseras',
                ':tagline' => $input['tagline'] ?? '',
                ':owner_name' => $input['owner_name'] ?? 'Guillermo "Don Memo" Ramírez',
                ':owner_role' => $input['owner_role'] ?? 'Chef Fundador & Maestro Cocinero',
                ':owner_bio' => $input['owner_bio'] ?? '',
                ':owner_avatar' => $input['owner_avatar'] ?? '👨‍🍳',
                ':experience_years' => intval($input['experience_years'] ?? 8),
                ':email' => $input['email'] ?? '',
                ':phone' => $input['phone'] ?? '',
                ':address' => $input['address'] ?? '',
                ':currency' => $input['currency'] ?? '$',
                ':social_instagram' => $input['social_instagram'] ?? '',
                ':social_facebook' => $input['social_facebook'] ?? '',
                ':business_hours' => $input['business_hours'] ?? '',
                ':kitchen_status' => $input['kitchen_status'] ?? 'open',
                ':sound_enabled' => !empty($input['sound_enabled']) ? 1 : 0,
                ':voice_enabled' => !empty($input['voice_enabled']) ? 1 : 0,
                ':audio_volume' => floatval($input['audio_volume'] ?? 0.9),
                ':alert_sound_type' => $input['alert_sound_type'] ?? 'bell',
                ':repeat_alert_interval_minutes' => intval($input['repeat_alert_interval_minutes'] ?? 3),
                ':font_size_preference' => $input['font_size_preference'] ?? 'normal',
                ':pin_code' => $input['pin_code'] ?? '1234',
                ':biometric_enabled' => !empty($input['biometric_enabled']) ? 1 : 0,
                ':whatsapp_greeting' => $input['whatsapp_greeting'] ?? '',
                ':whatsapp_dispatch' => $input['whatsapp_dispatch'] ?? '',
                ':whatsapp_completed' => $input['whatsapp_completed'] ?? '',
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Configuración actualizada']);
            break;

        // ----------------------------------------------------
        // 2. PRODUCTOS Y CONTROL DE STOCK (100 DIARIO)
        // ----------------------------------------------------
        case 'get_products':
            $stmt = $pdo->query("SELECT * FROM products ORDER BY id ASC");
            $products = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $products]);
            break;

        case 'save_product':
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['id']) && $input['id'] > 0) {
                // Update
                $stmt = $pdo->prepare("UPDATE products SET name = :name, category = :category, price = :price, description = :description, image_icon = :image_icon, stock = :stock, preparation_minutes = :prep WHERE id = :id");
                $stmt->execute([
                    ':name' => $input['name'],
                    ':category' => $input['category'],
                    ':price' => $input['price'],
                    ':description' => $input['description'] ?? '',
                    ':image_icon' => $input['image_icon'] ?? '🍽️',
                    ':stock' => intval($input['stock'] ?? 100),
                    ':prep' => intval($input['preparation_minutes'] ?? 15),
                    ':id' => $input['id']
                ]);
            } else {
                // Insert
                $stmt = $pdo->prepare("INSERT INTO products (name, category, price, description, image_icon, stock, initial_daily_stock, preparation_minutes) VALUES (:name, :category, :price, :description, :image_icon, :stock, :initial_stock, :prep)");
                $stmt->execute([
                    ':name' => $input['name'],
                    ':category' => $input['category'],
                    ':price' => $input['price'],
                    ':description' => $input['description'] ?? '',
                    ':image_icon' => $input['image_icon'] ?? '🍽️',
                    ':stock' => intval($input['stock'] ?? 100),
                    ':initial_stock' => 100,
                    ':prep' => intval($input['preparation_minutes'] ?? 15),
                ]);
            }
            echo json_encode(['status' => 'success', 'message' => 'Producto guardado']);
            break;

        case 'reset_daily_stock':
            $pdo->query("UPDATE products SET stock = initial_daily_stock");
            $pdo->query("UPDATE business_config SET last_reset_date = CURDATE() WHERE id = 1");
            echo json_encode(['status' => 'success', 'message' => 'Inventario restablecido a 100 unidades por platillo para el nuevo ciclo de 24h.']);
            break;

        // ----------------------------------------------------
        // 3. PEDIDOS (ORDERS) & DETALLES
        // ----------------------------------------------------
        case 'get_orders':
            $stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
            $orders = $stmt->fetchAll();
            foreach ($orders as &$ord) {
                $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = :order_id");
                $itemStmt->execute([':order_id' => $ord['id']]);
                $ord['items'] = $itemStmt->fetchAll();
            }
            echo json_encode(['status' => 'success', 'data' => $orders]);
            break;

        case 'create_order':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['customer_name']) || empty($input['items'])) {
                echo json_encode(['status' => 'error', 'message' => 'Datos incompletos para el pedido']);
                exit;
            }

            // Generate order number
            $stmtNum = $pdo->query("SELECT MAX(order_number) AS max_num FROM orders");
            $maxRow = $stmtNum->fetch();
            $nextOrderNum = ($maxRow['max_num'] ? intval($maxRow['max_num']) + 1 : 101);

            $pdo->beginTransaction();

            $sqlOrder = "INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, customer_reference, customer_notes, total_amount, payment_method, payment_details, status, estimated_prep_minutes, created_at)
                         VALUES (:order_num, :c_name, :c_phone, :c_addr, :c_ref, :c_notes, :total, :pay_method, :pay_det, 'recibido', :prep_min, NOW())";
            
            $stmtOrd = $pdo->prepare($sqlOrder);
            $stmtOrd->execute([
                ':order_num' => $nextOrderNum,
                ':c_name' => $input['customer_name'],
                ':c_phone' => $input['customer_phone'] ?? '',
                ':c_addr' => $input['customer_address'] ?? '',
                ':c_ref' => $input['customer_reference'] ?? '',
                ':c_notes' => $input['customer_notes'] ?? '',
                ':total' => floatval($input['total_amount'] ?? 0),
                ':pay_method' => $input['payment_method'] ?? 'efectivo',
                ':pay_det' => $input['payment_details'] ?? '',
                ':prep_min' => intval($input['estimated_prep_minutes'] ?? 15)
            ]);

            $orderId = $pdo->lastInsertId();

            // Insert Items & Decrement Stock
            $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal, notes) VALUES (:order_id, :product_id, :product_name, :quantity, :unit_price, :subtotal, :notes)");
            $stmtStock = $pdo->prepare("UPDATE products SET stock = GREATEST(0, stock - :qty) WHERE id = :product_id");

            foreach ($input['items'] as $item) {
                $stmtItem->execute([
                    ':order_id' => $orderId,
                    ':product_id' => $item['product_id'],
                    ':product_name' => $item['product_name'],
                    ':quantity' => intval($item['quantity']),
                    ':unit_price' => floatval($item['unit_price']),
                    ':subtotal' => floatval($item['quantity'] * $item['unit_price']),
                    ':notes' => $item['notes'] ?? ''
                ]);
                $stmtStock->execute([
                    ':qty' => intval($item['quantity']),
                    ':product_id' => $item['product_id']
                ]);
            }

            $pdo->commit();

            echo json_encode([
                'status' => 'success',
                'message' => '¡Pedido creado exitosamente!',
                'order_id' => $orderId,
                'order_number' => $nextOrderNum
            ]);
            break;

        case 'update_order_status':
            $input = json_decode(file_get_contents('php://input'), true);
            $orderId = intval($input['order_id'] ?? 0);
            $newStatus = $input['status'] ?? 'recibido';

            $timeCol = '';
            if ($newStatus === 'pendiente') {
                $timeCol = ", accepted_at = NOW()";
            } elseif ($newStatus === 'en_camino') {
                $timeCol = ", dispatched_at = NOW()";
            } elseif ($newStatus === 'entregado') {
                $timeCol = ", delivered_at = NOW()";
            }

            $stmt = $pdo->prepare("UPDATE orders SET status = :status $timeCol WHERE id = :id");
            $stmt->execute([':status' => $newStatus, ':id' => $orderId]);

            echo json_encode(['status' => 'success', 'message' => 'Estado del pedido actualizado']);
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Acción no reconocida']);
            break;
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
