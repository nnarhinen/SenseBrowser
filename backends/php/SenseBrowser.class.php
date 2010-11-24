<?php
/**
 * Helper Class for handling file browsing, uploading and directory creation
 * Dual Licensed under the MIT or GPL version 3 licenses.
 *
 * @package sensebrowser
 * @author Niklas Närhinen
 **/
class SenseBrowser
{
	protected $baseDir;
	protected $urlPrefix;
	protected $cacheDir;
	protected $cacheUrlPrefix;
	protected $layoutDir;
	protected $layoutUrlPrefix;
	
	public function __construct($baseDir = null, $urlPrefix = null, $cacheDir = null, $cacheUrlPrefix = null)
	{
		$this->setBaseDir($baseDir);
		$this->setUrlPrefix($urlPrefix);
		$this->setCacheDir($cacheDir);
		$this->setCacheUrlPrefix($cacheUrlPrefix);
		
		$this->setLayoutDir(realpath(dirname(__FILE__) . '/../../layout'));
	}
	
	public function setBaseDir($baseDir)
	{
		$this->baseDir = $baseDir;
	}
	
	public function setUrlPrefix($urlPrefix)
	{
		$this->urlPrefix = $urlPrefix;
	}
	
	public function setCacheDir($cacheDir)
	{
		$this->cacheDir = $cacheDir;
	}
	
	public function setCacheUrlPrefix($cacheUrlPrefix)
	{
		$this->cacheUrlPrefix = $cacheUrlPrefix;
	}
	
	public function setLayoutDir($layoutDir)
	{
		$this->layoutDir = $layoutDir;
	}
	
	public function setLayoutUrlPrefix($layoutUrlPrefix)
	{
		$this->layoutUrlPrefix = $layoutUrlPrefix;
	}
	
	public function browseDirectory($directory)
	{
		$input = "/";
		if (!empty($directory)) {
			$input = rtrim($directory, '/') . '/';
			$input = str_replace('../', '', $input); //We don't want to go any level up in directory hierarchy
		}
		$dir = new DirectoryIterator($this->baseDir . $input);

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
					$files[$file->getFileName()] = $this->urlPrefix . $input . $file->getFileName();
					if (class_exists('Imagick')) {//We are good to create thumbnails to cache
						try {
							$thumbFileName = md5($input . $file->getFileName()) . '.png';
							if (!file_exists($this->cacheDir . '/' . $thumbFileName)) {//No such thumbnail in cache
								$im = new Imagick($file->getPathName());
								$thumb = $im->clone();
								if ($thumb->getImageHeight() > $thumb->getImageWidth()) {//preserve aspect ratio
							    	$thumb->thumbnailImage(0,150);
								}
								else {
									$thumb->thumbnailImage(150,0);
								}
								$thumb->setImageFormat('png');
								$thumb->writeImage($this->cacheDir . '/' . $thumbFileName);
							}
							$thumbnails[$file->getFileName()] = $this->cacheUrlPrefix . '/' . $thumbFileName;
						}
						catch (ImagickException $ex) {
							$fileName = $file->getFileName();
							$fileNameParts = explode(".", $fileName);
							$extension = array_pop($fileNameParts);
							if (file_exists($this->layoutDir . '/' . $extension . '.png')) {
								$thumbnails[$file->getFileName()] = $this->layoutUrlPrefix . '/' . $extension . '.png';
							}
							else {
								$thumbnails[$file->getFileName()] = $this->layoutUrlPrefix . '/unknown.png';
							}
						}
					}
				}
			}
		}
		return array('files' => $files, 'directories' => $directories, 'thumbnails' => $thumbnails);
	}
	
	public function createDirectory($currentDirectory, $newDirectory)
	{
		$input = "";
		if (!empty($currentDirectory)) {
			$input = $currentDirectory;
		}
		if (!empty($newDirectory)) {
			$input = rtrim($input, '/') .  '/' . $newDirectory;
		}
		$input = str_replace('../', '', $input); //We don't want to go any level up in directory hierarchy
		if (!is_dir($this->baseDir . $input)) {
			mkdir($this->baseDir . $input);
		}
	}
	
	public function uploadFile($currentDirectory, $uploadedFile)
	{
		$input = "";
		if (!empty($currentDirectory)) {
			$input = rtrim($currentDirectory, '/') . '/';
			$input = str_replace('../', '', $input); //We don't want to go any level up in directory hierarchy
		}

		$uploadDir = $baseDir . $input;

		//This is not safe!
		if (strpos(strtolower($uploadedFile['name']), 'jpg') === false) {
			die("Not an image!");
		}
		$uploadFile = $uploadDir . basename($uploadedFile['name']);

		if (move_uploaded_file($uploadedFile['tmp_name'], $uploadFile)) {
			echo "OK";
		}
		else {
			echo "Unsuccessfull";
		}
	}
}