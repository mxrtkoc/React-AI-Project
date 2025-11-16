<?php
// CORS ayarları - EN BAŞTA OLMALI
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Allow-Credentials: false');

// OPTIONS isteğini handle et - PREFLIGHT REQUEST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Content-Length: 0');
    exit(0);
}

// Veritabanı yapılandırması
define('DB_HOST', 'localhost');
define('DB_NAME', 'ai_gunluk_asistan');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key (güvenlik için değiştirin)
define('JWT_SECRET', 'your-secret-key-change-this-in-production');

// Hugging Face API Token - .env dosyasından oku
function loadEnvFile($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    
    $env = [];
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Yorum satırlarını atla
        }
        
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        $env[$key] = $value;
    }
    
    return $env;
}

// .env dosyasını yükle
$env = loadEnvFile(__DIR__ . '/.env');
define('HF_API_TOKEN', $env['HF_API_TOKEN'] ?? '');
define('HF_API_URL', $env['HF_API_URL'] ?? 'https://api-inference.huggingface.co/models/tabularisai/multilingual-sentiment-analysis');

// Content-Type header'ı sadece OPTIONS değilse ekle
if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    header('Content-Type: application/json; charset=utf-8');
}

// Veritabanı bağlantısı
function getDB() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Veritabanı bağlantı hatası: ' . $e->getMessage()]);
        exit();
    }
}

// Basit JWT token oluşturma (production için daha güvenli bir kütüphane kullanın)
function generateToken($userId, $email) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'email' => $email,
        'exp' => time() + (7 * 24 * 60 * 60) // 7 gün
    ]));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$signature";
}

// Token doğrulama
function verifyToken($token) {
    try {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        $payload = json_decode(base64_decode($parts[1]), true);
        
        if ($payload['exp'] < time()) {
            return null; // Token süresi dolmuş
        }
        
        $expectedSignature = base64_encode(hash_hmac('sha256', "$parts[0].$parts[1]", JWT_SECRET, true));
        
        if ($parts[2] !== $expectedSignature) {
            return null; // İmza geçersiz
        }
        
        return $payload;
    } catch (Exception $e) {
        return null;
    }
}

// Kullanıcı doğrulama middleware
function authenticate() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Yetkilendirme gerekli']);
        exit();
    }
    
    $token = $matches[1];
    $payload = verifyToken($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Geçersiz veya süresi dolmuş token']);
        exit();
    }
    
    return $payload;
}

// Hata yanıtı
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit();
}

// Başarı yanıtı
function sendSuccess($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
?>

