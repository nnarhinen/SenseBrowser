<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

	<title>SenseBrowser</title>
	<link rel="stylesheet" type="text/css" href="../../layout/default.css" />
	<link rel="stylesheet" type="text/css" href="../../lib/jquery-ui-1.8.4.custom/css/custom-theme/jquery-ui-1.8.4.custom.css" />
	<script type="text/javascript" src="../../lib/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="../../lib/jquery-ui-1.8.4.custom/js/jquery-ui-1.8.4.custom.min.js"></script>
	<script type="text/javascript" src="../../sensebrowser.js"></script>
	<script type="text/javascript">
	$(document).ready(function() {
		$('#sb-container').sensebrowser({
			browserScript: '../../backends/php/browse.php',
			uploaderScript: '../../backends/php/upload.php',
			dirCreatorScript : '../../backends/php/create.php',
			libDir : '../../lib/',
			layoutDir : '../../layout/',
			apply: function(result) {
				alert("You chose: " + result);
			}
		});
	});
	</script>
</head>

<body>
	<div id="sb-container">
		<!--PlaceHolder-->
	</div>
</body>
</html>
