<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'message'=>'Method not allowed']); exit; }
$raw=file_get_contents('php://input'); $data=json_decode($raw,true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Invalid request']); exit; }
$name=trim($data['name']??''); $mobile=trim($data['mobile']??''); $email=trim($data['email']??''); $city=trim($data['city']??''); $interest=trim($data['interested_in']??''); $message=trim($data['message']??'');
if (!$name || !preg_match('/^[0-9]{10}$/',preg_replace('/\D/','',$mobile)) || !filter_var($email,FILTER_VALIDATE_EMAIL) || !$city || !$interest) { http_response_code(422); echo json_encode(['ok'=>false,'message'=>'Please complete all required fields correctly.']); exit; }
$mobile=preg_replace('/\D/','',$mobile);
$to='support@nckwealth.com';
$subject='New NCK WEALTH Website Enquiry — '.$interest;
$body="Name: $name\nMobile: $mobile\nEmail: $email\nCity: $city\nInterested In: $interest\nMessage: $message\n\nSource: nckwealth.com website\nTime: ".date('c');
$headers="From: NCK WEALTH <support@nckwealth.com>\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8\r\n";
$emailSent=@mail($to,$subject,$body,$headers);
// Forward to Google Apps Script Web App. Replace the URL after deployment.
$sheetWebhook='';
if ($sheetWebhook) {
  $ch=curl_init($sheetWebhook); curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_POSTFIELDS=>json_encode(['name'=>$name,'mobile'=>$mobile,'email'=>$email,'city'=>$city,'interested_in'=>$interest,'message'=>$message,'source'=>'nckwealth.com','timestamp'=>date('c')]),CURLOPT_TIMEOUT=>8]); curl_exec($ch); curl_close($ch);
}
echo json_encode(['ok'=>true,'email_sent'=>$emailSent]);
?>
