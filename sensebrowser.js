$.widget("ui.sensebrowser", {
	
	currentDirectory: false,
	selectedFile: false,
	options: {
		browserScript: 'browse.php',
		uploaderScript: 'upload.php',
		dirCreatorScript: 'create.php',
		layoutDir: 'layout/',
		libDir: 'lib/',
		allowUploads: false,
		allowDirectoryCreate: false,
		initialDirectory: '/',
		cancel: function() { window.close(); },
		apply: false,
		mode: 'custom'
	},
	_create: function() {
		this.currentDirectory = this.options.initialDirectory;
		
		if (!$.isFunction(this.options.apply)) {
			switch(this.options.mode) {
				case "ckeditor":
					this.options.apply = function(result) {
						var reParam = new RegExp('(?:[\?&]|&amp;)CKEditorFuncNum=([^&]+)', 'i') ;
						var match = window.location.search.match(reParam) ;
						var funcNum = (match && match.length > 1) ? match[1] : '' ;
						window.opener.CKEDITOR.tools.callFunction(funcNum, result);
						window.close();
					}
					break;
				case "tinymce":
					this.options.apply = function(result) {
						var win = tinyMCEPopup.getWindowArg("window");

						win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = result;

						if (typeof(win.ImageDialog) != "undefined") {
							if (win.ImageDialog.getImageData)
								win.ImageDialog.getImageData();
							if (win.ImageDialog.showPreviewImage)
								win.ImageDialog.showPreviewImage(result);
						}
						tinyMCEPopup.close();
					}
					this.options.cancel = function() {
						tinyMCEPopup.close();
					}
					break;
				default:
					this.options.apply = function(result) {
						alert("Applyfunction undefined");
					}
					break;
			}
		}
		
		this.element.html("");
		this.element.addClass('ui-corner-all ui-widget ui-widget-content ui-dialog ui-sensebrowser');
		this.element.css({
			'font-size': '8pt',
			'width': '620px',
			'height': '400px'
		});
		this.loadingElement = $('<div />').html('Ladataan..').css({
			'padding': 			'0px 0px 40px 5px',
			'background-image': "url('" + this.options.layoutDir + "ajax-loader.gif')",
			'background-repeat': 'no-repeat',
			'background-position': 'left center'
		});
		
		this.leftPanelElement = $('<div />')
									.attr('id', 'sb-leftpanel');
		this.rightPanelElement = $('<div />')
									.attr('id', 'sb-rightpanel');
		this.topPanelElement = $("<div />")
									.attr("id", "sb-toppanel")
									.attr('class', 'ui-widget-header ui-dialog-titlebar ui-corner-all ui-helper-clearfix');
		this.topPanelElement.append($("<a />")
									.attr("href", "http://www.sensebrowser.org")
									.attr("target", "_blank")
									.html("SenseBrowser")
									.attr('id', 'sb-headerlink')
									.attr('class', 'ui-dialog-title'));
		this.bottomPanelElement = $("<div />")
									.attr("id", "sb-bottompanel");
		this.currentDirValueElement = $('<span />').text('Loading..');
		this.currentDirElement = $('<ul />')
									.attr('id', 'sb-curdir')
									.append($('<li />')
									.append($('<span />')
										.attr('class', 'ui-icon ui-icon-folder-open')
										.attr('style', 'float: left;')
									).append(this.currentDirValueElement));
		this.dirListElement = $("<ul />")
									.attr("id", "sb-dirlist")
									.attr('style', 'border-left: 1px dotted #000;');	
		this.currentDirElement.append($('<li />').append(this.dirListElement));	
		
		this.leftPanelElement.append(this.currentDirElement);
		
		var browserObj = this;
		
		this.bottomPanelElement.append($('<div />')
											.attr('style', 'float: right;')
											.append($("<a />")
												.attr("id", "sb-cancel")
												.attr("href", "#")
												.text('Peruuta')
												.attr('class', 'ui-priority-secondary')
												.button({
													icons: {primary: 'ui-icon-close'}
												}).click(function() { 
													browserObj.options.cancel(); 
													return false; 
												}))
											.append($("<a />")
												.attr("id", "sb-apply")
												.attr("href", "#")
												.text('Valitse')
												.attr('class', 'ui-priority-primary')
												.button({
													icons: {primary: 'ui-icon-check'}
												}).click(function() {
													browserObj.options.apply(browserObj.selectedFile);
													return false; 
												})
											));
		
		this.element.append(this.topPanelElement);
		this.element.append(this.leftPanelElement);
		this.element.append(this.rightPanelElement);
		this.element.append(this.bottomPanelElement);
		
	},
	_init: function() {
		this.redraw();
	},
	redraw: function() {
		var browserObj = this;
		browserObj.dirListElement.html('');
		browserObj.rightPanelElement.html('');
		browserObj.rightPanelElement.append(this.loadingElement);
		$.getJSON(this.options.browserScript, {directory: this.currentDirectory}, function(data) {
			browserObj.rightPanelElement.html('');
			browserObj.currentDirValueElement.text(browserObj.currentDirectory || '/');
			
			var key;
			for (key in data.directories) {
				browserObj.dirListElement
					.append($("<li />")
						.append($('<span />')
							.html('&middot;&middot;')
							.attr('style', 'float: left; font-size: 5pt; margin-top: 3px;')
						).append($("<span />")
							.attr("class", "ui-icon ui-icon-folder-collapsed")
							.attr('style', 'float: left;'))
						.append($("<a />")
							.attr("href", "#")
							.attr("rel", data.directories[key])
							.html(key)
							.click(function () { 
								browserObj.currentDirectory = $(this).attr("rel");
								browserObj.redraw();
								return false; 
							})));
			}
			for (key in data.files) {
				var tnBlock = $("<div />")
								.attr("class", "sb-thumbnail ui-state-default")
								.click(function() { 
									browserObj.selectedFile = $(this).find("img:first-child").attr('rel'); 
									$('.sb-thumbnail').removeClass('ui-state-highlight'); 
									$(this).addClass('ui-state-highlight'); 
								});
				var src = data.thumbnails.hasOwnProperty(key) ? data.thumbnails[key] : data.files[key];
				tnBlock.append($("<img />").attr("src", src).attr("alt", key).attr("rel", data.files[key]));
				tnBlock.append($("<br />"));
				var fileName = key;
				if (fileName.length > 15) {
					fileName = fileName.substring(0, 12) + "..";
				}
				tnBlock.append($("<span />").html(fileName));
				browserObj.rightPanelElement.append(tnBlock);
			}
		});
	}
});

function SenseBrowser(elementId, options) {
	this.container = $("#" + elementId);
	this.cancelFunction = options.cancelFunction != undefined ? options.cancelFunction : function() { window.close(); }
	
	
	
	this.initialize = function(input) {
		$('#sb-fileupload').dialog('destroy');
		$('#sb-fileupload').remove();
		
	}
	
	this.redraw = function(sbDirs, sbFiles, currentDir, sbThumbnails) {
		if (currentDir == undefined || currentDir == '') {
			currentDir = "/";
		}
		var browserObj = this;
		
		
		if (this.allowDirectoryCreate) {
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
		}
		
		if (this.allowUpload) {
			var uploadButton = $('<a>Lataa koneelta</a>');
			uploadButton.button({icons: {primary: 'ui-icon-extlink'}});
			uploadButton.click(function() {
				$('#sb-fileupload').dialog('open');
				$('#sb-fileupload').parent().css('font-size', '8pt');
			});
			bottomPanel.append(uploadButton);
		}
		

		
		
		if (this.allowUpload) {
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
		}
		
		//Select first
		rightPanel.find("div:first-child").click();
		//this.container.resizable({alsoResize: rightPanel});
	}
	return this;
}