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
		$('#sb-fileupload').dialog('destroy');
		$('#sb-fileupload').remove();
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
		var topPanel = $("<div />").attr("id", "sb-toppanel").attr('class', 'ui-widget-header ui-dialog-titlebar ui-corner-all ui-helper-clearfix');
		topPanel.append($("<a />").attr("href", "http://www.sensebrowser.org").attr("target", "_blank").html("SenseBrowser").attr('id', 'sb-headerlink').attr('class', 'ui-dialog-title'));
		var bottomPanel = $("<div />").attr("id", "sb-bottompanel");
		var curDir = $('<ul />').attr('id', 'sb-curdir').append($('<li />').append($('<span />').attr('class', 'ui-icon ui-icon-folder-open').attr('style', 'float: left;')).append(currentDir));
		var dirList = $("<ul />").attr("id", "sb-dirlist").attr('style', 'border-left: 1px dotted #000;');
		var key;
		for (key in sbDirs) {
			dirList.append($("<li />").append($('<span />').html('&middot;&middot;').attr('style', 'float: left; font-size: 5pt; margin-top: 3px;')).append($("<span />").attr("class", "ui-icon ui-icon-folder-collapsed").attr('style', 'float: left;')).append($("<a />").attr("href", "#").attr("rel", sbDirs[key]).html(key).click(function () { browserObj.initialize($(this).attr("rel")); return false; })));
		}
		curDir.append($('<li />').append(dirList));
		for (key in sbFiles) {
			var tnBlock = $("<div />").attr("class", "sb-thumbnail ui-state-default").click(function() { browserObj.selectedImg = $(this).find("img:first-child").attr('rel'); $('.sb-thumbnail').removeClass('ui-state-highlight'); $(this).addClass('ui-state-highlight'); });
			tnBlock.append($("<img />").attr("src", sbFiles[key]).attr("alt", key).attr("rel", sbFiles[key]));
			tnBlock.append($("<br />"));
			var fileName = key;
			if (fileName.length > 15) {
				fileName = fileName.substring(0, 12) + "..";
			}
			tnBlock.append($("<span />").html(fileName));
			rightPanel.append(tnBlock);
		}

		bottomPanel.append(
			$("<ul />").append(
				$("<li />").append(
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
					).button({icons: {primary: 'ui-icon-circle-plus'}})
				)
			)
		);
		
		var uploadButton = $('<a>Lataa koneelta</a>');
		uploadButton.button({icons: {primary: 'ui-icon-extlink'}});
		uploadButton.click(function() {
			$('#sb-fileupload').dialog('open');
		});
		bottomPanel.append(uploadButton);
		bottomPanel.append($('<div />').attr('style', 'float: right;').append(
				$("<a />").attr("id", "sb-cancel").attr("href", "#").text('Peruuta').attr('class', 'ui-priority-secondary').button({icons: {primary: 'ui-icon-close'}}).click(function() { browserObj.cancelFunction(); })
			).append(
			$("<a />").attr("id", "sb-apply").attr("href", "#").text('Valitse').attr('class', 'ui-priority-primary').button({icons: {primary: 'ui-icon-check'}}).click(function() { browserObj.applyFunction(browserObj.selectedImg); })
		));

		leftPanel.append(curDir);
		this.container.removeClass('ajax-loading');
		this.container.append(topPanel);
		this.container.append(leftPanel);
		this.container.append(rightPanel);
		this.container.append(bottomPanel);
		
		var fileUploadDiv = $('<div />').attr('id', 'sb-fileupload').attr('style', 'display: none;');
		var uploadInput = $("<input />").attr("type", "file").attr("name", "uploadfile").attr("id", "sb-uploadfile");
		fileUploadDiv.append(uploadInput);
		this.container.append(fileUploadDiv);
		fileUploadDiv.dialog({
			title: 'Lataa tietokoneelta',
			height: 140,
			modal: true,
			autoOpen: false
		});
		
		uploadInput.uploadify({
			'uploader'  : this.libDir + 'uploadify/uploadify.swf',
			'script'    : this.uploaderScript,
			'buttonText': 'Valitse tiedosto',
			'fileDataName': 'file',
			'wmode'		: 'transparent',
			'folder'	: currentDir,
			'auto'		: true,
			onComplete: function(event, queueID, fileObj, response, data) {
				var refreshDir = currentDir;
				if (refreshDir == '/') {
					refreshDir == "";
				}
				fileUploadDiv.dialog('close');
				browserObj.initialize(refreshDir);
				return true;
			}
		});
		$('#sb-uploadfileUploader').css({
			'background-color': '#f00;'
		});
		
		//Select first
		rightPanel.find("div:first-child").click();
		//this.container.resizable({alsoResize: rightPanel});
	}
	return this;
}