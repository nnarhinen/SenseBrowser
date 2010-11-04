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
		
		if (this.options.allowDirectoryCreate) {
			this.bottomPanelElement.append(
				$("<ul />").append(
					$("<li />").append(
						$("<a />").attr("id", "sb-newdirectory").attr("href", "#").html("Uusi hakemisto").click(
							function() { 
								var newDir = prompt("Uuden hakemiston nimi", "");
								if (newDir == '' || newDir == null) {
									return false;
								}
								$.ajax({
									url: browserObj.options.dirCreatorScript,
									data: { currentDirectory: browserObj.currentDirectory, newDirectory: newDir},
									success: function() {
										browserObj.redraw();
									},
									error: function() {
										alert('Failed to create directory');
									}
								});
								return false; 
							}
						).button({icons: {primary: 'ui-icon-circle-plus'}})
					)
				)
			);
		}
		
		if (this.options.allowUploads) {
			this.uploadButton = $('<a>Lataa koneelta</a>')
				.button({icons: {primary: 'ui-icon-extlink'}})
				.click(function() {
					$('#sb-fileupload').dialog('open');
				}).appendTo(this.bottomPanelElement);			
			
			this.fileUploadIframe = this._createUploadIframe();

			this.fileUploadForm = this._createUploadForm();
				
			this.fileUploadDiv = this._createUploadDiv();
			this.element.append(this.fileUploadDiv);
		}
		
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
	_createFileInput: function() {
		return $('<input />')
			.attr('type', 'file')
			.attr('name', 'file')
			.attr('style', 'width: 100%;')
			.appendTo(this.fileUploadLabel);
	},
	_createUploadForm: function() {
		this.fileUploadLabel = $('<label />').text('Valitse tiedosto');
		this.fileUploadInput = this._createFileInput();
		this.fileUploadCurrentDirInput = $('<input />')
			.attr('type', 'hidden')
			.attr('name', 'directory')
			.attr('value', this.currentDirectory);
		return 	$('<form />', {
				method: 'post',
				target: 'sb-fileuploadiframe',
				action: this.options.uploaderScript,
				enctype: 'multipart/form-data'
			}).append(this.fileUploadLabel).append(this.fileUploadCurrentDirInput);
	},
	_createUploadDiv: function() {
		var browserObj = this;
		return $('<div />')
			.attr('id', 'sb-fileupload')
			.attr('style', 'display: none;')
			.append(this.fileUploadIframe)
			.append(this.fileUploadForm)
			.dialog({
				title: 'Lataa tietokoneelta',
				height: 140,
				modal: true,
				autoOpen: false,
				buttons: {
					'Lähetä': function() {
						browserObj.fileUploadIframe.load(function() {
								$(this).unbind('load');
								$('#sb-fileupload').dialog('destroy');
								browserObj.fileUploadDiv.remove();
								browserObj.fileUploadIframe.remove();
								browserObj.fileUploadIframe = browserObj._createUploadIframe();
								browserObj.fileUploadForm = browserObj._createUploadForm();
								browserObj.fileUploadDiv = browserObj._createUploadDiv();
								browserObj.element.append(browserObj.fileUploadDiv);
								browserObj.redraw();
							});
						browserObj.fileUploadCurrentDirInput.val(browserObj.currentDirectory);
						browserObj.fileUploadForm.submit();
					}
				}
			}).parent().css('font-size', '8pt');
	},
	_createUploadIframe: function() {
		return $('<iframe></iframe>', {
			src: 'about:blank',
			style: 'display: none',
			name: 'sb-fileuploadiframe'
		});
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
								.attr('title', key)
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