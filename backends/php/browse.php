<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

include 'config.php';

$directory = $_GET['directory'];

$senseBrowser = new SenseBrowser($baseDir, $urlPrefix, $cacheDir, $cacheUrlPrefix);

echo json_encode($senseBrowser->browseDirectory($directory));