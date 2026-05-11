<?php
$host     = 'brb6t1smbpzguvmk73ch-mysql.services.clever-cloud.com';
$port     = 3306;
$dbname   = 'brb6t1smbpzguvmk73ch';
$username = 'ubs3smfytw84xd9c';
$password = '6XytXkRqcFF7f3GiGXZw';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Error de conexión a la base de datos: " . $e->getMessage());
}

$con = @mysqli_connect($host, $username, $password, $dbname, $port);

if ($con) {
    $con->set_charset("utf8");
} else {
    // No interrumpimos aquí: varios endpoints de tickets usan solo PDO.
    // Evitamos que warnings HTML rompan respuestas JSON en el frontend.
    $con = null;
}
?>
