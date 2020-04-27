// julik ne vorui! (c)
var tempOpacity = {};
function Start(){
	getItem('settings', function(obj){
		var enabled = obj.settings.enabled;
		if(enabled){
			setBackground();
			toggleContextMenu(true);
		}else{
			setBackground();
			toggleContextMenu(false);
		}
	});
}
function setBackground(){
	//console.log();
	getItem('settings', function(obj){
		obj = obj.settings;
		var body = $('body');
		var newStyle = '';
		var page = obj.page;
		var temp = {};
		if (tempOpacity.target) temp = tempOpacity;
		tempOpacity = {};
		if (obj.enabled){	
			newStyle+='<div class="newStyle"><style>';
			newStyle+='\n#page_layout{';
			newStyle+='\nbackground-color: #edeef0;';
			newStyle+='\n}';
			//var page = $('#page_layout');
			//var vacans = $('#pageLayout');
			//vacans.css('background-color', '#FFF');
			//page.css('background-color', '#FFF');
			var color = obj.color;
			var stroke = color.stroke.turn;
			if(stroke){
				var strokeRGB =color.stroke.rgb;
				var size = color.stroke.size;
				var opacity = color.stroke.opacity / 100;
				if (temp.target == 'color.stroke.opacity') opacity = temp.value/100;
				if (temp.target == 'color.stroke.size') opacity = size.value;
				newStyle+='\n#page_layout, #pageLayout{';
				newStyle+='\nbox-shadow: 0px 0px 0px '+size+'px rgba('+strokeRGB.r+', '+strokeRGB.g+', '+strokeRGB.b+', '+opacity+');';
				newStyle+='\n}';
			}
			if (color.turn){
				//alert("Покажись");
				//Основной лист по середине
				var rgb = page.rgb.r+', '+page.rgb.g+', '+page.rgb.b;
				if (!page.turn) rgb = '255, 255, 255';
				var opacity = (page.opacity.turn)?(page.opacity.value/100):1;
				if (temp.target == 'page.opacity.value') opacity = temp.value/100;
				newStyle+='\n#page_layout{';
				newStyle+='\nbackground-color: rgba('+rgb+','+ opacity +');';
				newStyle+='\n}';
				//alert("по ебалу получись");
				if (color.header.turn){
					var header = color.header.rgb;
					var touch = color.touch.rgb;
					var colorIN = 'rgb(' + header.r +', '+header.g+', '+header.b+')';
					var colorOUT = 'rgb(' + touch.r +', '+touch.g+', '+touch.b+')';
					if(color.header.turn){
						//Полоса под шапкой
						newStyle+='\n#page_header_cont div.back{';
						newStyle+='\nborder-bottom-color: '+colorIN+';';
						newStyle+='\n}';
						//Вся шапка и кнопки на ней
						newStyle+='\n#top_profile_link, '+
										'#top_audio_player, '+
										'#top_notify_btn, '+
										'.im-page--toolsw, '+
										'.im-chat-input, '+
										'.ui_tabs, '+
										'.page_block_header, '+
										'._audio_page_player, '+
										'#page_header_cont div.back{';
						newStyle+='\nbackground-color: '+colorIN+';';
						newStyle+='\n}';
						//Фон у поиска на шапке
						newStyle+='\n#ts_input, '+
										'#wall_module, '+
										'.ui_search_custom_ctrl, '+
										'#im_dialogs_search, '+
										'#submit_post_box, '+
										'div[contenteditable=true]{';
						newStyle+='\nbackground-color: '+colorOUT+';';
						newStyle+='\n}';
					}
				}
				//alert("1");
				if(color.touch.turn){
					//Красить кнопки на шапке при наведении
					newStyle+='\n#top_notify_btn:hover, '+
									'#top_audio_player:hover, '+
									'#top_profile_link:hover, '+
									'#top_audio:hover{';
					newStyle+='\nbackground-color: '+colorOUT+';';
					newStyle+='\n}';
				}
				//alert("2");
				//Левое(основное) и правое меню
				if(color.side.turn){
					var side = color.side;
					var rgb = side.rgb.r+', '+side.rgb.g+', '+side.rgb.b;
					var opacity = (side.opacity.turn)? (side.opacity.value/100):1;
					if (temp.target == 'color.side.opacity.value') opacity = temp.value/100;
					newStyle+='\n.ui_rmenu, #side_bar_inner nav{';
					newStyle+='\nbackground-color: rgba('+rgb+','+opacity+');';
					newStyle+='\nbox-shadow: 0 0 1px 5px rgba('+rgb+','+opacity+');';
					newStyle+='\n}';
					newStyle+='\n.ui_rmenu{';
					newStyle+='\nborder-radius: 0;';
					newStyle+='\n}';
					newStyle+='\n#side_bar_inner nav{';
					newStyle+='\npadding-left: 5px;';
					newStyle+='\n}';
				}
			}
			//alert("3");
			//Фоновое изображение и все такое
			if (obj.bg.turn){
				var repeat = (obj.bg.pave)?'':'no-repeat';
				var position = (obj.bg.center)?'center': false;
				url = obj.bg.url;
				newStyle+='\nbody{';
				newStyle+='\nbackground: url(' + url + ') '+repeat+';';
				newStyle+='\nbackground-attachment: fixed;';
				newStyle+='\nbackground-size: '+obj.bg.scale+';';
				if(position)newStyle+='\nbackground-position: '+position+';';
				newStyle+='\n}';
			}
			newStyle+='</style></div>\n';
			//alert("Ну че епта");
		}
		$('.newStyle').detach();
		body.prepend(newStyle);
	});
}
chrome.extension.onMessage.addListener(function(msg) {
	act = msg.act;
	if(act == 'goUpdateWindow'){
		Start();
	}else if(act == 'goShowOpacity'){
		tempOpacity.target = msg.target;
		tempOpacity.value = msg.value;
		setBackground();
	}
});
function toggleContextMenu(bool){
	if(bool){
		chrome.extension.sendMessage({ act:"enableContextMenu" });
	}else{
		chrome.extension.sendMessage({ act:"disableContextMenu" });
	}
}
function getItem (item, callback){
	chrome.storage.local.get(item, callback);
}
Start();