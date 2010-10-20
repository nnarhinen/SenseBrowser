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
$thumbnails = array();

if ($input != "/") {
	$inputParts = explode("/", rtrim($input, '/'));
	array_pop($inputParts);
	$directories['..'] = implode("/", $inputParts);
}

foreach ($dir as $file) {
	if (substr($file->getFileName(), 0, 1) != '.') {//We don't want to list hidden files
		if ($file->isDir()) {
			$directories[$file->getFileName()] = $input . $file->getFileName();
		}
		else {
			$files[$file->getFileName()] = $urlPrefix . $input . $file->getFileName();
			if (class_exists('Imagick')) {//We are good to create thumbnails to cache
				$thumbFileName = md5($input . $file->getFileName()) . '.png';
				if (!file_exists($cacheDir . '/' . $thumbFileName)) {//No such thumbnail in cache
					$im = new Imagick($file->getPathName());
					$thumb = $im->clone();
					if ($thumb->getImageHeight() > $thumb->getImageWidth()) {//preserve aspect ratio
				    	$thumb->thumbnailImage(0,150);
					}
					else {
						$thumb->thumbnailImage(150,0);
					}
					$thumb->setImageFormat('png');
					$thumb->writeImage($cacheDir . '/' . $thumbFileName);
				}
				$thumbnails[$file->getFileName()] = $cacheUrlPrefix . '/' . $thumbFileName;
			}
		}
	}
}

echo json_encode(array('files' => $files, 'directories' => $directories, 'thumbnails' => $thumbnails));