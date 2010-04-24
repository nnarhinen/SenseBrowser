<?php
/**
 * The filesystem path to your files directory
 * ie. /var/www/mydomain.com/files
 *
 * You might want to change this!
 */
$baseDir = realpath(dirname(__FILE__)) . "/images";

$input = "";
if (!empty($_POST['folder'])) {
	$input = $_POST['folder'] . '/';
	$input = str_replace('../', '', $input); //We don't want to go any level up in directory hierarchy
}

$uploadDir = $baseDir . $input;

//This is not safe!
if (strpos(strtolower($_FILES['file']['name']), 'jpg') === false) {
	die("Not an image!");
}
$uploadFile = $uploadDir . basename($_FILES['file']['name']);

if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
	echo "OK";
}
else {
	echo "Unsuccessfull";
}