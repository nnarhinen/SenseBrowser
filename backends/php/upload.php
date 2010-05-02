<?php
include 'config.php';

$input = "";
if (!empty($_POST['folder'])) {
	$input = rtrim($_POST['folder'], '/') . '/';
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