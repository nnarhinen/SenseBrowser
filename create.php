<?php
/**
 * The filesystem path to your files directory
 * ie. /var/www/mydomain.com/files
 *
 * You might want to change this!
 */
$baseDir = realpath(dirname(__FILE__)) . "/images";

$input = "";
if (!empty($_GET['currentDirectory'])) {
	$input = $_GET['currentDirectory'];
}
if (!empty($_GET['newDirectory'])) {
	$input = rtrim($input, '/') .  '/' . $_GET['newDirectory'];
}
$input = str_replace('../', '', $input); //We don't want to go any level up in directory hierarchy
echo $baseDir . $input;
if (!is_dir($baseDir . $input)) {
	mkdir($baseDir . $input);
}