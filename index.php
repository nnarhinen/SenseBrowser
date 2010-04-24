<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

	<title>SenseBrowser</title>
	<style>
		body {
			color: #222;
			background: #fff;
			font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
		}
		#sb-container {
			font-size: 9pt;
			width: 600px;
			height: 400px;
			border: 1px solid black;
			padding: 0px;
		}
		#sb-leftpanel {
			float: left;
			height: 340px;
			width: 179px;
			border-right: 1px solid #ccc;
		}
		#sb-bottomleftpanel {
			border-top: 1px solid #ccc;
			float: left;
			height: 39px;
			width: 180px;
			clear: left;
		}
		#sb-topleftpanel {
			color: #fff;
			font-size: 10pt;
			font-weight: bold;
			padding: 2px;
			border-bottom: 1px solid #ccc;
			float: left;
			height: 15px;
			width: 176px;
			clear: left;
		}
		#sb-bottomleftpanel, #sb-bottomrightpanel, #sb-topleftpanel, #sb-toprightpanel {
			background-color: #99ccff;
		}
		#sb-rightpanel {
			float: left;
			height: 340px;
			width: 420px;
			clear: right;
			overflow: auto;
		}
		#sb-bottomrightpanel {
			border-top: 1px solid #ccc;
			float: left;
			width: 412px;
			height: 31px;
			padding: 4px 4px 4px 4px;
		}
		#sb-toprightpanel {
			border-bottom: 1px solid #ccc;
			float: left;
			height: 19px;
			width: 420px;
		}
		#sb-leftpanel ul, #sb-bottomleftpanel ul {
			list-style: none;
			margin: 5px;
			padding: 5px;
		}
		#sb-leftpanel li, #sb-bottomleftpanel li {
			clear: both;
		}
		#sb-leftpanel li img, #sb-bottomleftpanel li img {
			vertical-align: middle;
			max-width: 20px;
		}
		#sb-leftpanel li a, #sb-bottomleftpanel li a {
			color: #000;
			text-decoration: none;
			font-size: 8pt;
		}
		#sb-leftpanel li a:hover, #sb-bottomleftpanel li a:hover {
			text-decoration: underline;
		}
		#sb-bottomrightpanel object {
			cursor: hand;
			cursor: pointer;
			float: left;
			margin-top: 5px;
		}
		.uploadifyQueue {
			float: left;
		}
		#sb-apply, #sb-cancel {
			float: right;
			cursor: hand;
			cursor: pointer;
			max-height: 20px;
			margin-top: 3px;
			margin-left: 14px;
		}
		.sb-thumbnail {
			float: left;
			text-align: center;
			width: 100px;
			height: 100px;
			margin: 2px;
			margin-top: 4px;
			cursor:pointer;
			cursor:hand
		}
		.sb-thumbnail-active {
			background-color: #99ccff;
		}
		.sb-thumbnail img {
			margin-top: 4px;
			max-width: 70px;
			max-height: 70px;			
		}
		.ajax-loading {
			background-image: url('layout/ajax-loader.gif');
			background-repeat: no-repeat;
		}
	</style>
	<script type="text/javascript" src="lib/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="lib/uploadify/jquery.uploadify.v2.1.0.min.js"></script>
	<script type="text/javascript" src="lib/uploadify/swfobject.js"></script>
	<script type="text/javascript">
	function SenseBrowser(elementId, options) {
		this.container = $("#" + elementId);
		this.browserScript = options.browserScript != undefined ? options.browserScript : 'browse.php';
		this.uploaderScript = options.uploaderScript != undefined ? options.uploaderScript : 'upload.php';
		
		this.initialize = function(input) {
			this.container.html("");
			this.container.addClass('ajax-loading');
			var browserObj = this;
			var currentDir = input;
			$.getJSON(this.browserScript, {directory: input}, function(data) {
				sbDirs = data.directories;
				sbFiles = data.files;
				browserObj.redraw(sbDirs, sbFiles, currentDir);
			});
		}
		
		this.redraw = function(sbDirs, sbFiles, currentDir) {
			if (currentDir == undefined || currentDir == '') {
				currentDir = "/";
			}
			var browserObj = this;
			var leftPanel = $("<div />").attr("id", "sb-leftpanel");
			var rightPanel = $("<div />").attr("id", "sb-rightpanel");
			var topLeftPanel = $("<div />").attr("id", "sb-topleftpanel");
			topLeftPanel.html(currentDir);
			var topRightPanel = $("<div />").attr("id", "sb-toprightpanel");
			var bottomRightPanel = $("<div />").attr("id", "sb-bottomrightpanel");
			var bottomLeftPanel = $("<div />").attr("id", "sb-bottomleftpanel");
			var dirList = $("<ul />").attr("id", "sb-dirlist");
			var key;
			for (key in sbDirs) {
				dirList.append($("<li />").append($("<img />").attr("src", 'layout/folder_blue.png').attr("alt", "folder")).append($("<a />").attr("href", "#").attr("rel", sbDirs[key]).html(key).click(function () { browserObj.initialize($(this).attr("rel")); return false; })));
			}
			for (key in sbFiles) {
				var tnBlock = $("<div />").attr("class", "sb-thumbnail").click(function() { $('.sb-thumbnail').removeClass('sb-thumbnail-active'); $(this).addClass('sb-thumbnail-active'); });
				tnBlock.append($("<img />").attr("src", sbFiles[key]).attr("alt", key));
				tnBlock.append($("<br />"));
				var fileName = key;
				if (fileName.length > 15) {
					fileName = fileName.substring(0, 12) + "..";
				}
				tnBlock.append($("<span />").html(fileName));
				rightPanel.append(tnBlock);
			}

			bottomLeftPanel.append($("<ul />").append($("<li />").append($("<img />").attr("src", "layout/folder_red.png")).append($("<a />").attr("id", "sb-newdirectory").attr("href", "#").html("Uusi hakemisto"))));
			var uploadButton = $("<input />").attr("type", "file").attr("name", "uploadfile").attr("id", "sb-uploadfile");
			bottomRightPanel.append(uploadButton);
			bottomRightPanel.append($("<img />").attr("id", "sb-apply").attr("src", "layout/apply.png").attr("title", "Käytä"));
			bottomRightPanel.append($("<img />").attr("id", "sb-cancel").attr("src", "layout/button_cancel.png").attr("title", "Peruuta"));

			leftPanel.append(dirList);
			this.container.removeClass('ajax-loading');
			this.container.append(topLeftPanel);
			this.container.append(topRightPanel);
			this.container.append(leftPanel);
			this.container.append(rightPanel);
			this.container.append(bottomLeftPanel);
			this.container.append(bottomRightPanel);
			uploadButton.uploadify({
				'uploader'  : 'lib/uploadify/uploadify.swf',
				'script'    : this.uploaderScript,
				'cancelImg' : 'layout/uploadify_cancel.png',
				'buttonImg' : 'layout/upload_fi.png',
				'height'	: 18,
				'width'		: 116,
				'fileDataName': 'file',
				'wmode'		: 'transparent',
				'folder'	: currentDir,
				'auto'		: true,
				onComplete: function(event, queueID, fileObj, response, data) {
					var refreshDir = currentDir;
					if (refreshDir == '/') {
						refreshDir == "";
					}
					browserObj.initialize(refreshDir);
					return true;
				}
			});
		}
		return this;
	}
	
	$(document).ready(function() {
		var sBrowser = new SenseBrowser("sb-container", {
			'browserScript'	: 'browse.php',
			'uploaderScript': 'upload.php',
		});
		sBrowser.initialize();
	});
	</script>
</head>

<body>
	<div id="sb-container">
		<!--PlaceHolder-->
	</div>
</body>
</html>
