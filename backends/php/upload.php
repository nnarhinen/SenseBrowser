<?php
include 'config.php';

$senseBrowser = new SenseBrowser($baseDir, $urlPrefix, $cacheDir, $cacheUrlPrefix);
$senseBrowser->uploadFile($_POST['directory'], $_FILES['file']);