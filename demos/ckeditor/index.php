<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

	<title>SenseBrowser CKEditor demo</title>
	<link rel="stylesheet" type="text/css" href="../../layout/default.css" />
	<script type="text/javascript" src="../../lib/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="ckeditor/ckeditor.js"></script>
	<script type="text/javascript">
	$(document).ready(function() {
		CKEDITOR.replace('editor1',
		{
			filebrowserBrowseUrl : 'browser.php',
			filebrowserWindowWidth : '620',
			filebrowserWindowHeight : '470'
		});
	});
	</script>
</head>

<body>
	<form action="sample_posteddata.php" method="post"> 
			<p> 
				<textarea cols="80" id="editor1" name="editor1" rows="10"></textarea> 
			</p> 
			<p> 
				<input type="submit" value="Submit" /> 
			</p> 
		</form>
</body>
</html>
