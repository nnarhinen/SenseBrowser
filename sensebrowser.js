function SenseBrowser(elementId, options) {
	this.container = $("#" + elementId);
	this.browserScript = options.browserScript != undefined ? options.browserScript : 'browse.php';
	this.uploaderScript = options.uploaderScript != undefined ? options.uploaderScript : 'upload.php';
	this.dirCreatorScript = options.dirCreatorScript != undefined ? options.dirCreatorScript : 'create.php';
	this.layoutDir = options.layoutDir != undefined ? options.layoutDir : 'layout/';
	this.libDir = options.libDir != undefined ? options.libDir : 'lib/';
	this.cancelFunction = options.cancelFunction != undefined ? options.cancelFunction : function() { window.close(); }
	
	switch(options.mode) {
		case "ckeditor":
			this.applyFunction = function(result) {
				var reParam = new RegExp('(?:[\?&]|&amp;)CKEditorFuncNum=([^&]+)', 'i') ;
				var match = window.location.search.match(reParam) ;
				var funcNum = (match && match.length > 1) ? match[1] : '' ;
				window.opener.CKEDITOR.tools.callFunction(funcNum, result);
				window.close();
			}
			break;
		case "tinymce":
			alert("TINYMCE not implemented");
			break;
		default:
			this.applyFunction = options.onApply;
			break;
	}
	
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
			dirList.append($("<li />").append($("<img />").attr("src", this.layoutDir + 'folder_blue.png').attr("alt", "folder")).append($("<a />").attr("href", "#").attr("rel", sbDirs[key]).html(key).click(function () { browserObj.initialize($(this).attr("rel")); return false; })));
		}
		for (key in sbFiles) {
			var tnBlock = $("<div />").attr("class", "sb-thumbnail").click(function() { browserObj.selectedImg = $(this).find("img:first-child").attr('rel'); $('.sb-thumbnail').removeClass('sb-thumbnail-active'); $(this).addClass('sb-thumbnail-active'); });
			tnBlock.append($("<img />").attr("src", sbFiles[key]).attr("alt", key).attr("rel", sbFiles[key]));
			tnBlock.append($("<br />"));
			var fileName = key;
			if (fileName.length > 15) {
				fileName = fileName.substring(0, 12) + "..";
			}
			tnBlock.append($("<span />").html(fileName));
			rightPanel.append(tnBlock);
		}

		bottomLeftPanel.append(
			$("<ul />").append(
				$("<li />").append(
					$("<img />").attr("src", this.layoutDir + "folder_red.png")
				).append(
					$("<a />").attr("id", "sb-newdirectory").attr("href", "#").html("Uusi hakemisto").click(
						function() { 
							var newDir = prompt("Uuden hakemiston nimi", "");
							if (newDir == '' || newDir == null) {
								return false;
							}
							$.get(
								browserObj.dirCreatorScript, 
								{ currentDirectory: currentDir, newDirectory: newDir},
								function() {
									browserObj.initialize(currentDir);
								}	
							);
							return false; 
						}
					)
				)
			)
		);
		var uploadButton = $("<input />").attr("type", "file").attr("name", "uploadfile").attr("id", "sb-uploadfile");
		bottomRightPanel.append(uploadButton);
		bottomRightPanel.append($("<img />").attr("id", "sb-apply").attr("src", this.layoutDir + "apply.png").attr("title", "Käytä").click(function() { browserObj.applyFunction(browserObj.selectedImg); }));
		bottomRightPanel.append($("<img />").attr("id", "sb-cancel").attr("src", this.layoutDir + "button_cancel.png").attr("title", "Peruuta").click(function() { browserObj.cancelFunction(); }));

		leftPanel.append(dirList);
		this.container.removeClass('ajax-loading');
		this.container.append(topLeftPanel);
		this.container.append(topRightPanel);
		this.container.append(leftPanel);
		this.container.append(rightPanel);
		this.container.append(bottomLeftPanel);
		this.container.append(bottomRightPanel);
		uploadButton.uploadify({
			'uploader'  : this.libDir + 'uploadify/uploadify.swf',
			'script'    : this.uploaderScript,
			'cancelImg' : this.layoutDir + 'uploadify_cancel.png',
			'buttonImg' : this.layoutDir + 'upload_fi.png',
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
		
		//Select first
		rightPanel.find("div:first-child").click();
	}
	return this;
}