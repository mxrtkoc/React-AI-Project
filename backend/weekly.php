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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Sadece GET istekleri desteklenir', 405);
}

$payload = authenticate();
$userId = $payload['user_id'];
$db = getDB();

// Son 7 günün kayıtlarını getir
$stmt = $db->prepare("
    SELECT id, sentiment, created_at 
    FROM daily_entries 
    WHERE user_id = ? 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ORDER BY created_at DESC
");
$stmt->execute([$userId]);
$entries = $stmt->fetchAll();

// İstatistikleri hesapla
$totalEntries = count($entries);
$positive = 0;
$neutral = 0;
$negative = 0;

foreach ($entries as $entry) {
    switch ($entry['sentiment']) {
        case 'positive':
            $positive++;
            break;
        case 'neutral':
            $neutral++;
            break;
        case 'negative':
            $negative++;
            break;
    }
}

// Baskın duygu durumunu belirle
$dominantSentiment = 'neutral';
if ($positive >= $neutral && $positive >= $negative && $positive > 0) {
    $dominantSentiment = 'positive';
} elseif ($negative > $positive && $negative > $neutral) {
    $dominantSentiment = 'negative';
}

// Tarih aralığı
$endDate = new DateTime();
$startDate = clone $endDate;
$startDate->modify('-7 days');

sendSuccess([
    'totalEntries' => $totalEntries,
    'positive' => $positive,
    'neutral' => $neutral,
    'negative' => $negative,
    'dominantSentiment' => $dominantSentiment,
    'startDate' => $startDate->format('Y-m-d'),
    'endDate' => $endDate->format('Y-m-d')
]);
?>

