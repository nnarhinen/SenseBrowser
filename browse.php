<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

/**
 * The filesystem path to your files directory
 * ie. /var/www/mydomain.com/files
 *
 * You might want to change this!
 */
$baseDir = realpath(dirname(__FILE__)) . "/images";

/**
 * The prefix you want to add to your generated file urls
 * ie defining "images/" here results to <img src="images/file.png" /> for file.png
 */
$urlPrefix = "images/";

$input = "/";
if (!empty($_GET['directory'])) {
	$input = $_GET['directory'] . '/';
	$input = str_replace('../', '', $input); //We don't want to go any level up in directory hierarchy
}

$dir = new DirectoryIterator($baseDir . $input);

$directories = array();
$files = array();

foreach ($dir as $file) {
	if (!$file->isDot()) {//We don't want to list hidden files
		if ($file->isDir()) {
			$directories[$file->getFileName()] = $input . $file->getFileName();
		}
		else {
			$files[$file->getFileName()] = $urlPrefix . '/' . $file->getFileName();
		}
	}
}

echo json_encode(array('files' => $files, 'directories' => $directories));