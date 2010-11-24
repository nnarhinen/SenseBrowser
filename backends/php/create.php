<?php
include 'config.php';

$senseBrowser = new SenseBrowser($baseDir, $urlPrefix, $cacheDir, $cacheUrlPrefix);
$senseBrowser->createDirectory($_GET['currentDirectory'], $_GET['newDirectory']);