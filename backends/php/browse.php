<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

include 'config.php';

$input = "/";
if (!empty($_GET['directory'])) {
	$input = rtrim($_GET['directory'], '/') . '/';
	$input = str_replace('../', '', $input); //We don't want to go any level up in directory hierarchy
}

$dir = new DirectoryIterator($baseDir . $input);

$directories = array();
$files = array();

if ($input != "/") {
	$inputParts = explode("/", rtrim($input, '/'));
	array_pop($inputParts);
	$directories['..'] = implode("/", $inputParts);
}

foreach ($dir as $file) {
	if (!$file->isDot()) {//We don't want to list hidden files
		if ($file->isDir()) {
			$directories[$file->getFileName()] = $input . $file->getFileName();
		}
		else {
			$files[$file->getFileName()] = $urlPrefix . $input . $file->getFileName();
		}
	}
}

echo json_encode(array('files' => $files, 'directories' => $directories));