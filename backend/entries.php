<?php
// CORS headers
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
$payload = authenticate();
$userId = $payload['user_id'];
$db = getDB();

switch ($method) {
    case 'GET':
        // Tüm kayıtları getir
        $stmt = $db->prepare("
            SELECT id, content, sentiment, summary, suggestion, created_at, updated_at 
            FROM daily_entries 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $entries = $stmt->fetchAll();
        
        // Tarih formatını düzenle
        foreach ($entries as &$entry) {
            $entry['id'] = (int)$entry['id'];
            $entry['user_id'] = (int)$userId;
        }
        
        sendSuccess(['entries' => $entries]);
        break;
        
    case 'POST':
        // Yeni kayıt oluştur
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['content']) || empty($data['sentiment']) || 
            empty($data['summary']) || empty($data['suggestion'])) {
            sendError('Tüm alanlar gerekli: content, sentiment, summary, suggestion');
        }
        
        if (!in_array($data['sentiment'], ['positive', 'neutral', 'negative'])) {
            sendError('Geçersiz sentiment değeri');
        }
        
        $stmt = $db->prepare("
            INSERT INTO daily_entries (user_id, content, sentiment, summary, suggestion) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $data['content'],
            $data['sentiment'],
            $data['summary'],
            $data['suggestion']
        ]);
        
        $entryId = $db->lastInsertId();
        
        // Oluşturulan kaydı getir
        $stmt = $db->prepare("
            SELECT id, content, sentiment, summary, suggestion, created_at, updated_at 
            FROM daily_entries 
            WHERE id = ?
        ");
        $stmt->execute([$entryId]);
        $entry = $stmt->fetch();
        
        $entry['id'] = (int)$entry['id'];
        $entry['user_id'] = (int)$userId;
        
        sendSuccess(['entry' => $entry], 201);
        break;
        
    case 'PUT':
        // Kayıt güncelle
        $entryId = $_GET['id'] ?? null;
        if (!$entryId) {
            sendError('Kayıt ID gerekli');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Kayıt kullanıcıya ait mi kontrol et
        $stmt = $db->prepare("SELECT user_id FROM daily_entries WHERE id = ?");
        $stmt->execute([$entryId]);
        $entry = $stmt->fetch();
        
        if (!$entry) {
            sendError('Kayıt bulunamadı', 404);
        }
        
        if ($entry['user_id'] != $userId) {
            sendError('Bu kayda erişim yetkiniz yok', 403);
        }
        
        $updateFields = [];
        $updateValues = [];
        
        if (isset($data['content'])) {
            $updateFields[] = "content = ?";
            $updateValues[] = $data['content'];
        }
        if (isset($data['sentiment']) && in_array($data['sentiment'], ['positive', 'neutral', 'negative'])) {
            $updateFields[] = "sentiment = ?";
            $updateValues[] = $data['sentiment'];
        }
        if (isset($data['summary'])) {
            $updateFields[] = "summary = ?";
            $updateValues[] = $data['summary'];
        }
        if (isset($data['suggestion'])) {
            $updateFields[] = "suggestion = ?";
            $updateValues[] = $data['suggestion'];
        }
        
        if (empty($updateFields)) {
            sendError('Güncellenecek alan belirtilmedi');
        }
        
        $updateValues[] = $entryId;
        
        $sql = "UPDATE daily_entries SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        // Güncellenmiş kaydı getir
        $stmt = $db->prepare("
            SELECT id, content, sentiment, summary, suggestion, created_at, updated_at 
            FROM daily_entries 
            WHERE id = ?
        ");
        $stmt->execute([$entryId]);
        $updatedEntry = $stmt->fetch();
        
        $updatedEntry['id'] = (int)$updatedEntry['id'];
        $updatedEntry['user_id'] = (int)$userId;
        
        sendSuccess(['entry' => $updatedEntry]);
        break;
        
    case 'DELETE':
        // Kayıt sil
        $entryId = $_GET['id'] ?? null;
        if (!$entryId) {
            sendError('Kayıt ID gerekli');
        }
        
        // Kayıt kullanıcıya ait mi kontrol et
        $stmt = $db->prepare("SELECT user_id FROM daily_entries WHERE id = ?");
        $stmt->execute([$entryId]);
        $entry = $stmt->fetch();
        
        if (!$entry) {
            sendError('Kayıt bulunamadı', 404);
        }
        
        if ($entry['user_id'] != $userId) {
            sendError('Bu kayda erişim yetkiniz yok', 403);
        }
        
        $stmt = $db->prepare("DELETE FROM daily_entries WHERE id = ?");
        $stmt->execute([$entryId]);
        
        sendSuccess(['message' => 'Kayıt silindi']);
        break;
        
    default:
        sendError('Desteklenmeyen HTTP metodu', 405);
}
?>

