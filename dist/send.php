<?php
/**
 * Martin Engineering & Trading Co.
 * Production Contact & Quote Form Mailer for Hostinger Shared Hosting
 */

header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// 1. Honeypot check
if (!empty($_POST['website'])) {
    // Silently succeed for bots
    echo json_encode(['success' => true]);
    exit;
}

// 2. Sanitize and retrieve fields
$name    = isset($_POST['name']) ? trim(filter_var($_POST['name'], FILTER_SANITIZE_SPECIAL_CHARS)) : '';
$phone   = isset($_POST['phone']) ? trim(filter_var($_POST['phone'], FILTER_SANITIZE_SPECIAL_CHARS)) : '';
$email   = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$product = isset($_POST['product']) ? trim(filter_var($_POST['product'], FILTER_SANITIZE_SPECIAL_CHARS)) : 'General Inquiry';
$message = isset($_POST['message']) ? trim(filter_var($_POST['message'], FILTER_SANITIZE_SPECIAL_CHARS)) : 'No message provided';

if (empty($name) || empty($phone) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please provide valid Name, Phone, and Email address.']);
    exit;
}

$to = 'martinengg.gzb@gmail.com';
$subject = "New Website Quote Inquiry - $product - $name";

$body = "New Inquiry from Martin Engineering Website:\n\n";
$body .= "Name: $name\n";
$body .= "Phone: $phone\n";
$body .= "Email: $email\n";
$body .= "Product Interest: $product\n";
$body .= "Date & Time: " . date('Y-m-d H:i:s T') . "\n";
$body .= "IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n\n";
$body .= "Message:\n$message\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=utf-8';
$headers[] = 'From: Martin Website <no-reply@martinengineering.in>';
$headers[] = "Reply-To: $name <$email>";
$headers[] = 'X-Mailer: PHP/' . phpversion();

$mailSent = @mail($to, $subject, $body, implode("\r\n", $headers));

$isJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

if ($mailSent) {
    if ($isJson || isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true]);
    } else {
        header('Location: /thankyou.html');
    }
} else {
    // If mail function fails on server, return 200 with fallback instructions or redirect
    if ($isJson || isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Mail delivery failed. Please contact us directly via WhatsApp or phone.']);
    } else {
        header('Location: /thankyou.html?status=offline');
    }
}
