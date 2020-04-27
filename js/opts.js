//втор: vk.com/prohor237
$(document).ready(function(){
	loadSettings ();
	applyButtons ();
	imgContentUpdate();
});
function loadSettings() {	
	getItem( 'settings', function( obj ){
		var obj = obj.settings;
		setParams(obj);
	});
}
function setParams(obj) {
		var enabled = obj.enabled;
		var stroke = obj.color.stroke;
		var bg = obj.bg;
		var color = obj.color;
	$("#header_color").spectrum({
		'color': color.header.rgb,
		showButtons: false
	});
	$("#head_colorTouch").spectrum({
		'color': color.touch.rgb,
		showButtons: false
	});
	$("#stroke_colorPicker").spectrum({
		'color': color.stroke.rgb,
		showButtons: false
	});
	//alert('Из setParams: '+obj.color.side.r);
	$("#side_color").spectrum({
		'color': color.side.rgb,
		showButtons: false
	});
	$("#pageColor").spectrum({
		'color': obj.page.rgb,
		showButtons: false
	});
	reviewBox($('#ext_checkBox'), enabled);
	reviewBox($('#imgCenter'), bg.center);
	reviewBox($('.BackImg'), bg.turn);
	reviewBox($('.head_checkBox'), color.turn);
	reviewBox($('#turnSide'), color.side.turn);
	reviewBox($('#turnSideOpacity'), color.side.opacity.turn);
	reviewBox($('#turnHeader'), color.header.turn);
	reviewBox($('#turnTouch'), color.touch.turn);
	reviewBox($('#imgPave'), bg.pave);
	reviewBox($('.stroke_checkBox'), stroke.turn);
	reviewBox($('#turnPage'), obj.page.turn);
	reviewBox($('#page_opacity_checkBox'), obj.page.opacity.turn);

	$('#sideOpacity').val(color.side.opacity.value);
	$('#stroke_size_slider').val(stroke.size);
	$('#stroke_opacity_slider').val(stroke.opacity);
	$('#page_opacity_slider').val(obj.page.opacity.value);
	var bgScale = $('.bgScale')
	getItem( 'settings', function( obj ){
		var scales = {
			names: ["auto", "cover", "contain"],
			shift: ["-60%", "50%", "160%"]
		};
		var obj = obj.settings;
		var i = scales.names.indexOf(obj.bg.scale);
		bgScale.css("background-position", scales.shift[i]);
	});
}
function rangeCheck(id) {
	var res;
	var checkbox=[
		{name: "stroke_opacity_slider", shift:"color.stroke.opacity"},
		{name: "stroke_size_slider", shift:"color.stroke.size"},
		{name: "sideOpacity", shift:"color.side.opacity.value"},
		{name: "page_opacity_slider", shift:"page.opacity.value"}
	]
	for (var i = checkbox.length - 1; i >= 0; i--) {
		if(id == checkbox[i].name){
			res = checkbox[i].shift;
			break;
		}else if(i==0) return;
	}
	//chrome.extension.sendMessage({act:"updateBg"});
	return res;
}
function applyButtons() {
	$('.check_box').click(function(){//Активация всех кнопок в Check_box
		var checkbox = $(this).find('.checkbox');
		if(!checkbox.hasClass('checked')){
			checkbox.addClass('checked');
		}else{
			checkbox.removeClass('checked');
		}

		function save() {
			setTimeout( function(){
				getItem( 'settings', function( obj ){
					var obj = obj.settings;
					setParams(obj);
				});
			},200);
		}		
		checkbox = [
		{	name: '#ext_checkBox', 		shift: 'enabled' },
		{	name: '.head_checkBox', 	shift: 'color.turn' },
		{	name: '#turnSide', 			shift: 'color.side.turn' },
		{	name: '#turnSideOpacity', 	shift: 'color.side.opacity.turn' },
		{	name: '.stroke_checkBox', 	shift: 'color.stroke.turn' },
		{	name: '#turnHeader', 		shift: 'color.header.turn' },
		{	name: '#turnTouch', 		shift: 'color.touch.turn' },
		{	name: '.BackImg', 			shift: 'bg.turn' },
		{	name: '#imgCenter', 		shift: 'bg.center' },
		{	name: '#imgPave', 			shift: 'bg.pave' },
		{	name: '#turnPage',			shift: 'page.turn' },
		{	name: '#page_opacity_checkBox',shift: 'page.opacity.turn' }
		]
		for (var i = checkbox.length - 1; i >= 0; i--) {
			var temp = $(this).find(checkbox[i].name);
			if(temp.hasClass('checkbox')){
				var turn = temp.hasClass('checked');
				updateItem(checkbox[i].shift, turn);
				save();
				break;
			}else if(i==0) return;
		}
		chrome.extension.sendMessage({act:"updateBg"});
	});
	$("input[type='range']").on('input', (function (){
		var that = $(this);
		var id = that.attr('id');
		var value = this.value;
		var target = rangeCheck(id);
		chrome.extension.sendMessage({act:"showOpacity", value: value, target: target});
	}));
	$("input[type='range']").on('change', (function (){
		var that = $(this);
		var id = that.attr('id');
		var value = this.value;
		var target = rangeCheck(id);
		updateItem(target, value);
	}));
	//--------Активация и закрытие окно с настройками----
	$('.Back').click(function(){
		checkSettBox(true,'backImgSett', true);
		checkSettBox(true,'colorSett', true);
		checkSettBox(true,'strokeSett', true);
		$('.OZBackground').addClass('OZhidden');
	});
	$('.openSett').click(function(){
	//---------Активация кнопок категорий------------
		var id = this.id;
		checkSettBox(id,'backImgSett', false);
		checkSettBox(id,'colorSett', false);
		checkSettBox(id,'strokeSett', false);
		$('.OZBackground').removeClass('OZhidden');
	});
	$('.bgScale').click(function(){
	//---------Активация кнопки развертки картинки на фоне------------
		var bgScale = $(this);
		getItem( 'settings', function( obj ){
			var scales = {
				names: ["auto", "cover", "contain"],
				shift: ["-60%", "50%", "160%"]
			};
			var obj = obj.settings;
			var i = scales.names.indexOf(obj.bg.scale);
			(i<scales.names.length-1)?i++: i=0;
			obj.bg.scale = scales.names[i];
			//alert(scales.shift[i]);
			bgScale.css("background-position", scales.shift[i]);
			setItem(obj);
			chrome.extension.sendMessage({act:"updateBg"});
		});
	});
	//$('div#imgContent').on('click','div.imgs',(function(){
	//	alert("ха епта");
	//}));	
	$('div#imgContent').on('click','div.imgs div.setImg',(function(){
		var that = $(this);
		getItem('settings',function(obj){
			var base = 'chrome-extension://'+chrome.runtime.id + '/img/media/';
			var dfImgs = obj.settings.bg.default;
			var bgImgs = obj.settings.bg.download;
			var id = String(that.attr("id"));
			if( id.search('def') != -1) {
				id = id.substr(3);
				id = base + obj.settings.bg.default[id];
			}else if( id.search('img') != -1) {
				id = id.substr(3);
				id = obj.settings.bg.download[id];
			}else return;
			updateItem('bg.url', id);
			chrome.extension.sendMessage({act:"updateBg"})
			
		});
	}));
	$('div#imgContent').on('click','div.imgs div.delImg',(function(){
		var that = $(this);
		getItem('settings',function(obj){
			var obj = obj.settings;
			var id = String(that.attr("id"));
			if( id.search('img') != -1) {
				id = id.substr(3);
			}else return;
			obj.bg.download.splice(id,1);
			setItem(obj);
			//alert(obj.bg.download);
			setTimeout( function(){
				imgContentUpdate()}, 100);
			
		});
	}));
/*
function bgScaleCalc (item){
	var scales = {
		names: ["auto", "cover", "contain"],
		shift: ["-40%", "50%", "140%"]
	};
	var i = scales.names.indexOf(obj.bg.scale);
	return {};

			var obj = obj.settings;
			var i = scales.names.indexOf(item);
			(i<scales.names.length-1)?i++: i=0;
			obj.bg.scale = scales.names[i];
}
*/
	$('#reset').click( function(){
		chrome.extension.sendMessage({ act:"getDefaultSett"});
		chrome.extension.sendMessage({ act:"resetBg" });
		$("#overlay").fadeIn(100, function(){
			setTimeout( function(){
				$("#overlay").fadeOut(300);
			}, 200);
		//setTimeout( function(){}, 500 );
		getItem( 'settings', function( obj ){
			var obj = obj.settings;
			//alert('Из reset: '+obj.color.side.r);
			setParams(obj);
			//setItem(obj, function(){
				chrome.extension.sendMessage({act:"updateBg"});
			//});
		});
		});
	});
	$('#save').click(function(){
		getItem( 'settings', function( obj ){
			var obj = obj.settings;
			//obj.color.stroke.opacity = $('#stroke_opacity_slider').val();
			//obj.color.stroke.size = $('#stroke_size_slider').val();
			//obj.color.side.opacity.value = $('#sideOpacity').val();
			obj.color.stroke.rgb = $("#stroke_colorPicker").spectrum("get").toRgb();
			obj.color.header.rgb = $("#header_color").spectrum("get").toRgb();
			obj.color.touch.rgb = $("#head_colorTouch").spectrum("get").toRgb();
			obj.color.side.rgb = $("#side_color").spectrum("get").toRgb();
			obj.page.rgb = $("#pageColor").spectrum("get").toRgb();
			//alert(JSON.stringify($('.BackImg')));
			//obj.page.opacity.value = $('#page_opacity_slider').val();
			setItem(obj, function(){
				chrome.extension.sendMessage({act:"updateBg"});
				$("#overlay").fadeIn(100, function(){
					setTimeout( function(){
						$("#overlay").fadeOut(300);
					}, 200);
				});
			});
		});
	});
}
//function save
function setItem (value, callback){
	chrome.storage.local.set({settings:value}, callback);
}
function reviewBox(item, value){
	if (item){
		var funct = function( i, cC ){
			//alert(item.id + '[' + i + ']:' + value);
			return 'checked'};
		(value) ? item.addClass(funct):item.removeClass(funct);
	}
}
function getItem (item, callback){
	chrome.storage.local.get(item, callback);
}
//Слушает сообщения
chrome.extension.onMessage.addListener(function(msg) {
	act = msg.act;
	if(act == 'goUpdateWindow'){
		Start();
	}
});
//(Кнопка с которой исходит команда, цель которая откроется, положение которое должно приняться)
function checkSettBox(item, target, value) { 
		if (item == target ||item===true){
			var box = '#'+target + 'Box';
			box = $(box);
			if (value){
				if(!box.hasClass('hidden')) box.addClass('hidden');
			}else{
				if(box.hasClass('hidden')) box.removeClass('hidden');
			}
		
	};
}


//----Модуль апдейта выборочных элементов
function updateItem (item, value, callback){
	getItem('settings',function(obj){
		var obj = obj.settings;
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

		obj.page.opacity.value = (item == 'page.opacity.value')?value:obj.page.opacity.value;
		obj.page.opacity.turn = (item == 'page.opacity.turn')?value:obj.page.opacity.turn;
		obj.page.turn = (item == 'page.turn')?value:obj.page.turn;
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
		setItem(obj);
	});
}

function imgContentUpdate (){
	$("#imgContent").html("");
	getItem('settings',function(obj){
		var h = 0;
		var dfImgs= obj.settings.bg.default;
		var bgImgs= obj.settings.bg.download;
		var base = 'chrome-extension://'+chrome.runtime.id + '/img/media/';
		for (var i = dfImgs.length - 1; i >= 0; i--) {
			createImgBlock(base + dfImgs[i], "def"+i);
			h++;
		}
		for (var i = bgImgs.length - 1; i >= 0; i--) {
			createImgBlock(bgImgs[i], "img"+i);
			h++;
		}
		$('#imgContent').css("margin-bottom",(Math.ceil(h/3)*60)+'px');
	});
}

function createImgBlock (img, id){
	//----шаблон для создания на странице <div class = div.className>div.innerHTML</div> 
	var div = document.createElement('div');
	var child;
	div.className = "imgs";
	div.style.background = 'url(' + img + ') center no-repeat';
	div.style.backgroundSize = "120px";
	div.style.width = "87px";
	div.style.height = "60px";
	child = 
		"<div class='setImg' id='"+ id +"'></div>";
	if( id.search('img') != -1) child+=
		"\n<div class='delImg' id='"+ id +"'></div>";
	div.innerHTML= child;
	var imgContent = document.getElementById("imgContent");
	imgContent.appendChild(div);
}

/*////////////////////////////////////////////////////////////////////Test code
// выбираем элемент
var target = document.querySelector('.sp-preview-inner');

// создаем экземпляр наблюдателя
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    //console.log(mutation.target);
    //console.log("Тип: " + mutation.type);
    //console.log("Что меняется: " + mutation.attributeName);
    alert("Какого хера происходит");
  });
});

// настраиваем наблюдатель
var config = {
  attributes: true,
  childList: true,
  characterData: true
}

// передаем элемент и настройки в наблюдатель
observer.observe(target, config);

/*//////////////////////////////////////////////////////////////////////////////Тестовый код