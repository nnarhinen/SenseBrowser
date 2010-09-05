<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

	<title>SenseBrowser TinyMCE demo</title>
	<link rel="stylesheet" type="text/css" href="../../layout/default.css" />
	<script type="text/javascript" src="../../lib/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="../../integration/tinymce/tiny_mce/tiny_mce.js"></script>
	<script type="text/javascript">
	$(document).ready(function() {
		tinyMCE.init({
			mode : "exact",
			elements : "editor2",
			theme : "advanced",
			plugins : "inlinepopups",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "bottom",
			theme_advanced_resizing : true,
			
			file_browser_callback : 'openSenseBrowser'
		});
	});
	function openSenseBrowser (field_name, url, type, win) {
	    var cmsURL = '../../integration/tinymce/browser.php';    // script URL - use an absolute path!
	    if (cmsURL.indexOf("?") < 0) {
	        cmsURL = cmsURL + "?type=" + type;
	    }
	    else {
	        cmsURL = cmsURL + "&type=" + type;
	    }

	    tinyMCE.activeEditor.windowManager.open({
	        file : cmsURL,
	        title : 'SenseBrowser',
	        width : 620,
	        height : 470,
	        resizable : "no",
	        inline : "yes",
	        close_previous : "no"
	    }, {
	        window : win,
	        input : field_name
	    });
	    return false;
	  }
	</script>
</head>

<body>
	<form action="sample_posteddata.php" method="post"> 
			<p> 
				<textarea cols="80" id="editor2" name="editor1" rows="10" style="width: 100%"></textarea> 
			</p> 
			<p> 
				<input type="submit" value="Submit" /> 
			</p> 
		</form>
</body>
</html>
