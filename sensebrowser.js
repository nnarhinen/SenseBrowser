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
		topRightPanel.append($("<a />").attr("href", "http://www.sensebrowser.org").attr("target", "_blank").html("SenseBrowser"));
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