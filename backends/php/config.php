<?php
require_once(realpath(dirname(__FILE__) . '/SenseBrowser.class.php'));
/**
 * The filesystem path to your files directory
 * ie. /var/www/mydomain.com/files
 *
 * You might want to change this!
 */
$baseDir = realpath(dirname(__FILE__) . "/../../../demoimages");

/**
 * The prefix you want to add to your generated file urls
 * ie defining "/images" here results to <img src="/images/file.png" /> for file.png
 */
$urlPrefix = "/demoimages";

$cacheDir = realpath(dirname(__FILE__) . "/cache");
$cacheUrlPrefix = '/sensebrowser/backends/php/cache';