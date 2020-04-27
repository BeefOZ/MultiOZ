chrome.browserAction.onClicked.addListener(
	function() {
		chrome.tabs.query({
			currentWindow: true,
			active: true
		}, 
		function(tab) {
			chrome.tabs.create({"url": "http://vk.com"});
		});
	});

chrome.runtime.onInstalled.addListener(function (obj){
	var reason = obj.reason;
	if(reason == "install"){
		setOnInstall();
	}else if(reason == "update"){
		setEnabledContextMenu( true );
	}
});
var id_key = 'VK_Wallpapers';
var Wallpaper = false;
function updateBg(imageInfo){
	var url =  imageInfo.srcUrl;
	updateItems(['bg.url', 'bg.downloadAdd'], [url, url]);
	goSendMsg();
}
function setEnabledContextMenu(enabled){
	if(enabled && Wallpaper == false ){
		//alert(JSON.stringify(chrome.contextMenus.create()));
					// После некоректного выключения плагина, функция удаления контекстменю не проходит
		//try {			
			var menuNew = chrome.contextMenus.create({
				id: id_key,
				title: "Установить как фон ВКонтакте",
				contexts: ["image"],
				onclick: updateBg
			});
			Wallpaper = true;
		//}catch(err){}	//Посему приходится перенаправлять ошибку в пустоту
	}else if (!enabled && Wallpaper == true){
		chrome.contextMenus.remove(id_key);
		Wallpaper = false;
	}
}
function getDefaultSett(){
	var url = getDefaultImage();
	var settings = {
		enabled: true,
		color:{
			turn: 		false, 
			stroke:		{turn: false, rgb:{r: 237, g: 238, b: 240}, opacity: 50, size: 6},
			header: 	{turn: true, rgb:{r: 74,  g: 118, b: 168}},
			touch: 		{turn: true, rgb:{r: 34,  g: 75,  b: 122}},
			txtside: 	{r: 40,	 g: 84,  b: 115},
			side: 		{turn: false, rgb:{r: 40,g: 84, b: 115}, opacity: {turn: true, value: 90}}
		},
		bg:{
			turn : true,
			center : true,
			url: url,
			pave: false,
			scale: 'cover',
			default: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "1.gif", "2.gif", "3.gif", "4.gif", "5.gif", "6.gif", "7.gif"],
			download:[]
		},
		page: {turn: true, rgb: {r:255, g: 255, b: 255}, opacity: {turn: true, value: 90}}
	}
	//alert('Из getDefault: '+settings.bg.center);
	return settings;
}

function setOnInstall(){
	//alert('1)R: '+settings.color.side.r);
	var settings = getDefaultSett();
	setItem('settings', settings);
	setEnabledContextMenu( true );
}
chrome.extension.onMessage.addListener(function (msg){
	act = msg.act;
	if(act == "updateBg"){
		goSendMsg();
	}else if(act == "resetBg"){
		var bgUrl = getDefaultImage();
		updateItems('bg.url', bgUrl);
		goSendMsg();
	}else if(act == 'disableContextMenu'){
		setEnabledContextMenu (false);
	}else if(act == 'enableContextMenu'){
		setEnabledContextMenu (true);
	}else if(act == 'getDefaultSett'){
		setOnInstall();
	}else if(act == 'showOpacity'){
		chrome.tabs.query({}, function ( tabs ) {
			for ( var i = 0; i < tabs.length; ++i) {
				chrome.tabs.sendMessage(tabs[i].id, {act:"goShowOpacity", value: msg.value, target: msg.target});
			}
		});
	}
});
function goSendMsg(){
	setTimeout(function(){
		chrome.tabs.query({}, function ( tabs ) {
			for ( var i = 0; i < tabs.length; ++i) {
				chrome.tabs.sendMessage(tabs[i].id, {act:"goUpdateWindow"});
			}
		});
	}, 100);
}

function updateItem (item, value, callback){
	updateItems(item[0], values[0], callback)
}

function updateItems (items, values, callback){
	getItem('settings',function(obj){
		var obj = obj.settings;
		for (var i = items.length - 1; i >= 0; i--) {
			var item = items[i];
			var value = values[i];
			if (!(value && item)) throw ('Намудрил ты с входными данными, кэп =D');

			if (item == 'obj') obj = value;
			obj.enabled = (item == 'enabled')?value:obj.enabled;
			//------color----
			obj.color.turn = (item == 'color.turn')?value:obj.color.turn;
			obj.color.stroke.turn = (item == 'color.stroke.turn')?value:obj.color.stroke.turn;
			obj.color.stroke.opacity = (item == 'color.stroke.opacity')?value:obj.color.stroke.opacity;
			obj.color.stroke.rgb = (item == 'color.stroke.rgb')?value:obj.color.stroke.rgb;
			obj.color.stroke.size = (item == 'color.stroke.size')?value:obj.color.stroke.size;
			obj.color.header.turn = (item == 'color.header.turn')?value:obj.color.header.turn;
			obj.color.touch.turn = (item == 'color.touch.turn')?value:obj.color.touch.turn;
			obj.color.side.turn = (item == 'color.side.turn')?value:obj.color.side.turn;
			obj.color.side.rgb = (item == 'color.side.rgb')?value:obj.color.side.rgb;
			obj.color.side.opacity.turn = (item == 'color.side.opacity.turn')?value:obj.color.side.opacity.turn;
			obj.color.side.opacity.value = (item == 'color.side.opacity.value')?value:obj.color.side.opacity.value;
			//---------BackGround--------
			obj.bg.turn = (item == 'bg.turn')?value:obj.bg.turn;
			obj.bg.center = (item == 'bg.center')?value:obj.bg.center;
			obj.bg.url = (item == 'bg.url')?value:obj.bg.url;
			obj.bg.pave = (item == 'bg.pave')?value:obj.bg.pave;
			obj.bg.scale = (item == 'bg.scale')?value:obj.bg.scale;
			if (item == "bg.downloadAdd"){
				//alert(JSON.stringify(obj.bg.download) + "     " + obj.bg.download.indexOf(value));
				if(-1==obj.bg.download.indexOf(value)) obj.bg.download.push(value);
				}
			obj.page.turn = (item == 'page.turn')?value:obj.page.turn;
			obj.page.rgb = (item == 'page.rgb')?value:obj.page.rgb;
			obj.page.opacity.value = (item == 'page.opacity.value')?value:obj.page.opacity.value;
			obj.page.opacity.turn = (item == 'page.opacity.turn')?value:obj.page.opacity.turn;
			/*
			var newBgObj = {
				enabled: enabled,
				color: {
					'turn': turn,
					'RGB' : RGB,
					'headerBack' : headerBack,
					'headTouch' : headTouch,
					'side' : side
				},
				bg:{
					turn : turnbg,
					url: url,
					pave: pave,
					scale: scale
				},
				stroke: stroke,
				opacity: opacity,
				size: size,
				page_opacity: page_opacity,
				page_opacity_bool: page_opacity_bool
			};
			*/
		}
		setItem('settings', obj);
	});
}
function setItem (item, value, callback){
	chrome.storage.local.set({ settings:value }, callback);
}
function getItem (item, callback){
	chrome.storage.local.get(item, callback);
}
function getDefaultImage(){
	var url = 'chrome-extension://'+chrome.runtime.id+'/img/media/3.gif';
	return url;
}
