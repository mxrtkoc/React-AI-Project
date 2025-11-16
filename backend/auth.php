<?php
// CORS headers - config.php'den önce
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$db = getDB();

switch ($method) {
    case 'POST':
        if ($action === 'register') {
            // Kayıt ol
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['email']) || empty($data['password'])) {
                sendError('Email ve şifre gerekli');
            }
            
            $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                sendError('Geçerli bir email adresi girin');
            }
            
            if (strlen($data['password']) < 6) {
                sendError('Şifre en az 6 karakter olmalıdır');
            }
            
            // Email kontrolü
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                sendError('Bu email adresi zaten kullanılıyor');
            }
            
            // Kullanıcı oluştur
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
            $stmt->execute([$email, $passwordHash]);
            
            $userId = $db->lastInsertId();
            $token = generateToken($userId, $email);
            
            sendSuccess([
                'user' => [
                    'id' => $userId,
                    'email' => $email
                ],
                'token' => $token,
                'message' => 'Kayıt başarılı'
            ], 201);
            
        } elseif ($action === 'login') {
            // Giriş yap
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['email']) || empty($data['password'])) {
                sendError('Email ve şifre gerekli');
            }
            
            $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
            
            // Kullanıcıyı bul
            $stmt = $db->prepare("SELECT id, email, password_hash FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user || !password_verify($data['password'], $user['password_hash'])) {
                sendError('Email veya şifre hatalı', 401);
            }
            
            $token = generateToken($user['id'], $user['email']);
            
            sendSuccess([
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email']
                ],
                'token' => $token,
                'message' => 'Giriş başarılı'
            ]);
            
        } else {
            sendError('Geçersiz işlem');
        }
        break;
        
    case 'GET':
        if ($action === 'me') {
            // Mevcut kullanıcı bilgisi
            $payload = authenticate();
            
            $stmt = $db->prepare("SELECT id, email, created_at FROM users WHERE id = ?");
            $stmt->execute([$payload['user_id']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                sendError('Kullanıcı bulunamadı', 404);
            }
            
            sendSuccess(['user' => $user]);
        } else {
            sendError('Geçersiz işlem');
        }
        break;
        
    default:
        sendError('Desteklenmeyen HTTP metodu', 405);
}
?>

