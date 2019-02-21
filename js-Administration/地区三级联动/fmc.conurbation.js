function getCityLevel(code){
	if(code % 10000 == 0){
		return 1;
	}else if(code % 100 == 0){
		return 2;
	}else{
		return 3;
	}
}

function getProvinceCode(code){
	return parseInt(code / 10000) * 10000;
}

function getDistrictCityCode(code){
	return parseInt(code / 100) * 100;
}

function code2text(code, delimeter, valueOnly) {

	code = parseInt(code);

	if (!delimeter) {
		delimeter = '';
	}
	var provinceCode  = parseInt(code / 10000) * 10000;
	var districtCityCode ;
	try {
		if (code % 10000 == 0) {
			return city_array[code].t;
		}else if(code % 100 == 0)
		{
			if(valueOnly){
				return city_array[provinceCode].t;
			}

			if(provinceCode == 150000 || provinceCode == 500000 || provinceCode == 540000 ||provinceCode == 300000)
			{
				return city_array[provinceCode].t;
			}
			return city_array[provinceCode].t + delimeter + city_array[provinceCode].v[code].t;
		}else{

			districtCityCode = parseInt(code / 100) * 100;

			var countyName = city_array[provinceCode].v[districtCityCode].v[code];

			if(valueOnly){
				return countyName;
			}


			if(provinceCode == 150000 || provinceCode == 500000 || provinceCode == 540000 ||provinceCode == 300000)
			{
				return city_array[provinceCode].t + delimeter + countyName;
			}

			var districtCityName = city_array[provinceCode].v[districtCityCode].t;

			return city_array[provinceCode].t + delimeter + districtCityName + delimeter + countyName;
		}


	} catch (e) {
		return '';
	}
}


/**
 * city picker<br>
 * $('#citypicker').cityPicker({options});<br>
 * options: <br>
 *     common : common panel, default true,<br>
 *     level : city level, default 2,<br>
 *     selectableLevel: 可以选择的城市级别(1,2,3), default 1,  表示可以选择所有级别，2:表示只可以选择2级和2级以上,
 *     errortagid:可选城市选择不正确提示标签id
 *     generic : whether to include BX, default false,<br>
 *     join : city names joiner, default '-', eg:ProvinceName-CityName-CountyName,<br>
 *     pinyin : whether to enable pinyin input method, default true<br>
 * 
 */
(function($) {
	$.fn.cityPicker = function(options){
		var renderCommon = function(cp){
			cp.commonPanel = $('<div style="display:none;" class="citycontentpanel" xun_type="commonPanel"></div>').appendTo(cp.pickerPanel);
			for(var i = 0;i<cp.defaults.commonCity.length;i++){
				var cd = cp.defaults.commonCity[i];
				var cityTag = $('<span></span>').text(getLevelCityName(code2text(cd,'-',false))).attr('xun_code', cd).bind('click', {code : cd}, function(event){
					event.stopPropagation();
					//already selected!
					if($(this).is('.cur')){
						//return;
					}

					var selectedCode = event.data.code;

					var lv = getCityLevel(selectedCode);

					if(1 == lv){
						handleProvinceSelect(selectedCode, cp);
					}else if(2 == lv){
						handleCitySelect(selectedCode, cp, $(this));
					}else{
						handleCountySelect(selectedCode, cp, $(this));
					}

				});
				cp.commonPanel.append(cityTag);
			}
		};
		var renderProvince = function(cp){
			cp.provincePanel = $('<div style="display:none;" class="citycontentpanel" xun_type="provincePanel"></div>').appendTo(cp.pickerPanel);
			var regions = [];
			var provincegroup ;
			for(var i = 0;i < cp.defaults.provinceRegions.length;i++){
				 
			    for (var k in cp.defaults.provinceRegions[i]) {
			    	provincegroup = k;
			    	regions =  cp.defaults.provinceRegions[i][k];
				}
				$('<div class="provincegrouptag"></div>').text(provincegroup).appendTo(cp.provincePanel);
				var regionContent = $('<div class="provincegroupcontent"></div>').appendTo(cp.provincePanel);
				
				for(var j = 0;j < regions.length;j++){
					var pcode =  regions[j];

					var cityTag = $('<span></span>').text(city_array[pcode].t).attr('xun_code',pcode).bind('click', {pcode : pcode}, function(event){
						event.stopPropagation();
						//already selected!
						if($(this).is('.cur')){
							//return;
						}
						handleProvinceSelect(event.data.pcode, cp);
					});
					
					regionContent.append(cityTag);
				}
				
			}
		};
		var renderCity = function(cp){
			cp.cityPanel = $('<div style="display:none;" class="citycontentpanel" xun_type="cityPanel"></div>').appendTo(cp.pickerPanel);
		};
		var renderCounty = function(cp){
			cp.countyPanel = $('<div style="display:none;" class="citycontentpanel" xun_type="countyPanel"></div>').appendTo(cp.pickerPanel);
		};
		var showCity = function(cp){
			resetPanel(cp);
			cp.cityPanel.find('.citygroup').hide();
			cp.cityPanel.show();
			cp.cityTab.addClass('cur');
			var province = cp.selectedProvince;
			
			if(cp.cityGroups[province.code] == null){
				cp.cityGroups[province.code] = $('<div class="citygroup"></div>').appendTo(cp.cityPanel);
				var cities = [];

				for (var k in city_array[province.code].v) {
					cities.push(k);
				}
//				if(cp.defaults.level == 2 && (province.type == 1 ||province.type == 2)){
//					//二级选择框直辖市跳过市级
//					cities = cities[0].counties;
//				}
				for(var i = 0;i<cities.length;i++){
					var city = cities[i];
					//不要不限
//					if(!cp.defaults.generic && city._code == 'BX'){
//						continue;
//					}
					var name = city_array[province.code].v[city].t;
					if(name.length > 4){
						name = name.substring(0, 4);
					}
					var cityTag = $('<span></span>').text(name).attr('xun_code', city).bind('click', {cCode : city}, function(event){
						event.stopPropagation();
						//already selected!
						if($(this).is('.cur')){
							//return;
						}
						handleCitySelect(event.data.cCode, cp, $(this));
					});
					cp.cityGroups[province.code].append(cityTag);
				}
			}
			cp.cityGroups[province.code].show();
			if(cp.selectedCity != null){
				cp.cityGroups[province.code].find('[xun_code="' + cp.selectedCity + '"]').addClass('cur');
			}
		};
		var showCounty = function(cp){
			resetPanel(cp);
			cp.countyPanel.find('.countygroup').hide();
			cp.countyPanel.show();
			cp.countyTab.addClass('cur');
			var city = cp.selectedCity + '';
			//var pCode = cp.selectedProvince.code;
			var pCode = city.substring(0,2) + "0000";

			// console.log(city,pCode);
			
			if(cp.countyGroups[city] == null){
				cp.countyGroups[city] = $('<div class="countygroup"></div>').appendTo(cp.countyPanel);
				var counties = [];

                //如果可以选择二级城市
                if(cp.defaults.selectableLevel == 2){
                    counties.push(city);
                }

				for (var k in city_array[pCode].v[city].v) {
					counties.push(k);
				}
				
				for(var i = 0;i<counties.length;i++){
					var county = counties[i];
					//不要不限
//					if(!cp.defaults.generic && county._code == 'BX'){
//						continue;
//					}
					var name = city_array[pCode].v[city].v[county];

                    if(typeof(name) == 'undefined' && county == city){
                        name = '不限';
                    }

					if(name.length > 4){
						name = name.substring(0, 4);
					}
					var countyTag = $('<span></span>').text(name).attr('xun_code', county).bind('click', {cCode : county}, function(event){
						event.stopPropagation();
						//already selected!
						if($(this).is('.cur')){
							//return;
						}
						handleCountySelect(event.data.cCode, cp, $(this));
					});
					cp.countyGroups[city].append(countyTag);
				}
			}
			cp.countyGroups[city].show();
			if(cp.selectedCounty != null){
				cp.countyGroups[city].find('[xun_code="' + cp.selectedCounty + '"]').addClass('cur');
			}
		};
		var isInRegion = function(region, code){
			var codeChar = code.charCodeAt(0);
			return codeChar >= region[0].charCodeAt(0) && codeChar <= region[1].charCodeAt(0);
		};
		var setVal = function(name, code, cp){
			var oldVal = cp.hiddenInput.val();
			cp.hiddenInput.val(code);
			if(oldVal != code && code){	
				if(cp.onchange != null){
					 var nvalues = name.split(cp.defaults.join); 
				   (cp.onchange).apply(cp.hiddenInput,[nvalues[nvalues.length - 1],code]);
				}
			}
			var tmpcode = code.substring(0, 3);
			var tmpnvalues = name.split(cp.defaults.join);
			if(tmpcode == '150' || tmpcode == '500' || tmpcode == '300' || tmpcode == '540'){
				if(tmpnvalues.length == 3){
					name = tmpnvalues[0] + cp.defaults.join + tmpnvalues[tmpnvalues.length-1] ;
				}
			}
//			else{
//				if(tmpnvalues.length == 3){
//					if(name.substring(name.length-1) !='区')
//					  name = tmpnvalues[0] + cp.defaults.join + tmpnvalues[tmpnvalues.length-1] ;
//				}
//			}
			cp.input.val(name);
			cp.selectedVal = code;
			cp.selectedName = name;
		};
		var handleProvinceSelect = function(pCode, cp){
			cp.provincePanel.find('.cur').removeClass('cur');
	//		var province = provinceMap[pCode];
			var type = 0 ;
			if(pCode == "150000" || pCode == "500000" || pCode == "540000" || pCode == "300000"){
				type = 1;
			}else if(pCode == "800000" || pCode == "820000" ){
				type = 2;
			}
			cp.selectedProvince = {"code":pCode,"type":type};
			resetPanel(cp);
			cp.provincePanel.find('[xun_code="' + pCode + '"]').addClass('cur');
			if(cp.defaults.common){
				cp.commonPanel.find('.cur').removeClass('cur');
				cp.commonPanel.find('[xun_code="' + pCode + '"]').addClass('cur');
			}
			
			//跳过直辖市城市选择
			if(cp.defaults.level > 1 && type == 0){
				setVal(city_array[pCode].t, pCode, cp);
				showCity(cp);
			}else if(cp.defaults.level == 2 && type != 0){
				cp.selectedCity = pCode.substring(0,3)+100;
				cp.cityPanel.find('.cur').removeClass('cur');
				cp.cityPanel.find('[xun_code="' + cp.selectedCity + '"]').addClass('cur');
				var selectedName = city_array[pCode].t + cp.defaults.join + city_array[pCode].v[cp.selectedCity].t;
				setVal(selectedName, cp.selectedCity, cp);
				cp.pickerPanel.hide();
			}else if(cp.defaults.level == 3 && type != 0)
			{
				cp.selectedCity = pCode.substring(0,3)+100;
				cp.cityPanel.find('.cur').removeClass('cur');
				cp.cityPanel.find('[xun_code="' + cp.selectedCity + '"]').addClass('cur');
				var selectedName = city_array[pCode].t + cp.defaults.join + city_array[pCode].v[cp.selectedCity].t;
				setVal(selectedName, cp.selectedCity, cp);
				showCounty(cp);
			}else{
				setVal(city_array[pCode].t, pCode, cp);
				cp.pickerPanel.hide();
			}

		};
		var handleCitySelect = function(cCode, cp, el){
			cp.cityPanel.find('.cur').removeClass('cur');
			var selectedCity, selectedName;
//			if(cp.defaults.level == 2 && (cp.selectedProvince.type == 1 ||cp.selectedProvince.type == 2)){
//				//二级选择框直辖市跳过市级
//				selectedCity = countyMap[cCode];
//				selectedName = selectedCity.getName(cp.defaults.join, true);
//			}else{
//				selectedCity = cityMap[cCode];
//				selectedName = selectedCity.getName(cp.defaults.join);
//			}
			
			selectedCity = cCode;
			var pCode = cCode.substring(0,2)+"0000";


			selectedName = city_array[pCode].t + cp.defaults.join + city_array[pCode].v[cCode].t;

			cp.selectedCity = selectedCity;
			el.addClass('cur');
			setVal(selectedName, selectedCity, cp);
			if(cp.defaults.level > 2){
				showCounty(cp);
			}else{
				cp.pickerPanel.hide();
			}
		};
		var handleCountySelect = function(cCode, cp, el){
			cp.countyPanel.find('.cur').removeClass('cur');
			cp.selectedCounty = cCode;
			el.addClass('cur');		
				
			var pCode = cCode.substring(0,2)+"0000";
			var cityCode = cCode.substring(0,4)+"00";

			var selectedName = city_array[pCode].t + cp.defaults.join 
			+ city_array[pCode].v[cityCode].t;

            if(cCode != cityCode){
                selectedName = selectedName + cp.defaults.join +
                    city_array[pCode].v[cityCode].v[cCode];
            }

			setVal(selectedName, cCode, cp);
			cp.pickerPanel.hide();
		};
		var show = function(cp){

			if(cp.defaults.pinyin && cp.pinyinPanel.is(":visible")){
				return;
			}

			cp.showing = true;
			resetPanel(cp);
			var originalVal = cp.hiddenInput.val();
			var offset = cp.input.offset();
			cp.pickerPanel.css({top : offset.top + cp.input.outerHeight(), left : offset.left}).show();
			cp.provincePanel.find('.cur').removeClass('cur');
			if(cp.defaults.common){
				cp.commonPanel.find('.cur').removeClass('cur');
			}
			if(cp.defaults.level > 1){
				cp.cityPanel.find('.cur').removeClass('cur');
				if(cp.defaults.level > 2){
					cp.countyPanel.find('.cur').removeClass('cur');
				}
			}
			
			originalVal = parseInt(originalVal);
			
			if(!isNaN(originalVal) && originalVal >= 100000){
				     
		        var values ;				

				if(originalVal % 10000 == 0){
					values = 1;
				}else if((originalVal % 100 == 0)&&(originalVal % 10000 != 0)){
					values = 2;
				}else{
					values = 3;
				}
				
				var pCode = getProvinceCode(originalVal);
				var cCode = getDistrictCityCode(originalVal);
				var type = 0 ;
				if(pCode == 150000 || pCode == 500000 || pCode == 540000 || pCode == 300000){
					type = 1;
				}else if(pCode == 800000 || pCode == 820000 ){
					type = 2;
				}
				var province = {"code":pCode,"type":type};
		
				var isMunicipal = province.type == 1 ||province.type == 2;
				var level = values;
				if(level > cp.defaults.level){
					if(cp.defaults.level == 2 && values == 3 && isMunicipal){
						//保存原样
					}else{
						originalVal = pCode;
					}
					level = cp.defaults.level;
				}
				if(level == 1){
					cp.selectedProvince = province;
					cp.provinceTab.addClass('cur');
					cp.provincePanel.find('[xun_code="' + pCode + '"]').addClass('cur');
					if(cp.defaults.common){
						cp.commonPanel.find('[xun_code="' + pCode + '"]').addClass('cur');
					}
					cp.provincePanel.show();
				}else if(level == 2){
					cp.selectedCity = cCode;
					cp.selectedProvince = province;
					cp.cityTab.addClass('cur');
					cp.provincePanel.find('[xun_code="' + cp.selectedProvince.code + '"]').addClass('cur');
					if(cp.defaults.common){
						cp.commonPanel.find('[xun_code="' + cp.selectedProvince.code + '"]').addClass('cur');
					}
					showCity(cp);
					cp.cityPanel.find('[xun_code="' + originalVal + '"]').addClass('cur');
					cp.cityPanel.show(); 
				}else {
					cp.selectedCounty = originalVal;
					cp.selectedCity = cCode;
					cp.selectedProvince = province;
					cp.countyTab.addClass('cur');
					cp.provincePanel.find('[xun_code="' + cp.selectedProvince.code + '"]').addClass('cur');
					if(cp.defaults.common){
						cp.commonPanel.find('[xun_code="' + cp.selectedProvince.code + '"]').addClass('cur');
					}
					cp.cityPanel.find('[xun_code="' + cp.selectedCity + '"]').addClass('cur');
					showCounty(cp);
					cp.countyPanel.find('[xun_code="' + originalVal + '"]').addClass('cur');
					cp.countyPanel.show();
				}
			}else{
				if(cp.defaults.common){
					cp.commonTab.addClass('cur');
					cp.commonPanel.show();
				}else{
					cp.provinceTab.addClass('cur');
					cp.provincePanel.show();
				}
			}
		};
		var resetPanel = function(cp){
			cp.tabPanel.find('li').removeClass('cur');
			cp.pickerPanel.find('.citycontentpanel').hide();
		};
		var handlePinyin = function(cp){

			var val = cp.input.val().toUpperCase();

			if(val == null || val == ''){
				return;
			}

			if(val.indexOf(cp.defaults.join) != -1){
				return;
			}

			var result = findCityStartWith(val);

			// console.log(result);

			if(result.length > 0){

				var filteredResult = new Array();

				for(var i = 0; i < result.length; i++){
					var code = result[i];

					var lvl = getCityLevel(code);

					//filter by the selectable level and show level
					if(lvl >= cp.defaults.selectableLevel && lvl <= cp.defaults.level){
						filteredResult.push(code);
					}
				}

				if(filteredResult.length > 0){				
					showPinyinPanel(cp, filteredResult);
				//	$('.city_pinyin_hint_panel').show();
				}else{	
					$('.city_pinyin_hint_panel').hide();
				}
			}else{
				showPinyinPanel(cp, result);
				cp.input.on('blur', function(){
					$(this).val('');
				});
			}
		};

		var showPinyinPanel = function(cp, data){

			var _hintPanel = cp.pinyinPanel;
			_hintPanel.find(".cityitem").each(function(){
				$(this).unbind();
			});

				_hintPanel.empty();

				active = -1;

				if(data && data.length > 0){

					for(var i = 0; i < data.length; i++){

						var code = data[i];
						var value = code2text(code);

						_hintPanel.append("<div class='cityitem' ctcode='"+ code + "'>" + value + "</div>");
					}

					var listItems = _hintPanel.find(".cityitem");

					listItems.each(function(i){

						var _this = $(this);

						_this.mouseover(function(){

							_hintPanel.find(".hl").removeClass("hl");

							$(this).addClass("hl");
						});

						_this.click(function(){
							handleSelectOnPinyinHintPanel($(this).attr('ctcode'), cp);
						});
					});

					var editEl = cp.input;
					var offset = editEl.offset();
					_hintPanel.css({
						top: offset.top + editEl[0].offsetHeight,
						left: offset.left,
						width: editEl.width()
					}).show();

				}

		}

		var findCityChildrenByPinyin = function(parent){
			var result = [];

			if(parent['list']){
				result = result.concat(parent['list']);
			}

			for(key in parent){
				if(key != 'list'){
					var child = parent[key];

					result = result.concat(findCityChildrenByPinyin(child))
				}
			}

			return result;

		}

		var findCityStartWith = function(code){

			var result = [];

			if(typeof (code) == 'undefined' || null == code || code.length == 0){
				return result;
			}

			// 判断是否有中文的正则匹配
			var reg = /[\u4e00-\u9fa5]/g;

			if(!reg.test(code)){

				var obj = null;//the obj find by pinyin code

				for(var i = 0; i < code.length;  i++){

					var c = code.charAt(i);

					if(i == 0){
						obj = CityPinyinIndex[c]; //find by the first char
					}else if(obj){
						obj = obj[c];
					}else if(!obj){
						break;
					}
				}

				if(obj){
					//find all cities under this value
					result = result.concat(findCityChildrenByPinyin(obj))
				}
			} else {
				// 中文判断
				// console.log('是中文！');
				for (var i in city_array) {
			        for (var j in city_array[i].v) {
			            if (city_array[i].v[j].t.indexOf(code) != -1) {
			            	// console.log(j, city_array[i].v[j].t);
			            	result.push(parseInt(j));
			            }
			        }
			    }

			}
			 for(var item in CityJson){  
				 var key = code.toLowerCase();
				     if(CityJson[item].key.indexOf(key)>-1){  //item 表示Json串中的属性，如'name'  
			            var jValue=CityJson[item].value;//key所对应的value  
						if(jValue.indexOf("0000")<0){
							result.push(jValue);
						}
			        }  
			}  
			
			if(null!=result&&result.length>1){
				var res = [];
				var json = {};
				for(var i=0;i<result.length;i++){
					var r = result[i]+"";
					if(r.indexOf("0000")<0){
						if(!json[r]){
						   res.push(r);
						   json[r] = 1;
						}
					}
				}
				result = res;
			}
			
			return result;
		};

		var handleSelectOnPinyinHintPanel = function(cCode, cp){

			cCode = parseInt(cCode);

			var level = getCityLevel(cCode);

			var selectedName = code2text(cCode, "-");

			setVal(selectedName, cCode + '', cp);

			cp.pinyinPanel.hide();
		};

		return $(this).each(function(){
			
			var cp = {};
			var defaults = cp.defaults = $.extend({}, $.fn.cityPicker.options, options);
			defaults.commonCity = defaults.commonCity || $.fn.cityPicker.commonCity;
			defaults.provinceRegions = defaults.provinceRegions || $.fn.cityPicker.provinceRegions;
			cp.hiddenInput = $(this);
			var inputLevel = cp.hiddenInput.attr('level');
			if(inputLevel != null && inputLevel != ''){
				cp.defaults.level = inputLevel;
			}
			if(defaults.onSelected)
				  cp.onchange = defaults.onSelected;
			cp.input = $('<input type="text">').insertAfter(cp.hiddenInput.hide());
			cp.input.attr('style', cp.input.attr('style')||'' + cp.hiddenInput.attr('style') || '').show();
			cp.input.attr('class', cp.input.attr('class')||'' + ' ' + cp.hiddenInput.attr('class')||'');
			if(cp.hiddenInput.attr('id') != null){
				cp.input.attr('id', 'citypicker_' + cp.hiddenInput.attr('id'));
			}
			var disabled = cp.hiddenInput.attr('show');
			if(disabled==="false"){
				cp.input.attr('disabled', 'disabled');
			}
			if(defaults.pinyin){

				cp.pinyinPanel = $("<div style='display: none;' class='city_pinyin_hint_panel'>").appendTo("body");
				cp.pinyinPanel.css({'position':'absolute','zIndex':99999});

				cp.input.bind('input onchange', function(){
					cp.pickerPanel.hide();
					handlePinyin(cp);
					// var _val = $(this).val();
					// console.log(_val);
				});
			}
			var originalVal = cp.hiddenInput.val();
			originalVal = parseInt(originalVal);
			
			if(!isNaN(originalVal) && originalVal >= 100000){
				
		        var values ;
                if(originalVal % 10000 == 0){
					values = 1;
				}else if((originalVal % 100 == 0)&&(originalVal % 10000 != 0)){
					values = 2;
				}else{
					values = 3;
				}
				
				var pCode = getProvinceCode(originalVal);
				var cCode = getDistrictCityCode(originalVal);
				var type = 0 ;
				if(pCode == 150000 || pCode == 500000 || pCode == 540000 || pCode == 300000){
					type = 1;
				}else if(pCode == 800000 || pCode == 820000 ){
					type = 2;
				}
				
				var province = {"code":pCode,"type":type};

				var isMunicipal = province.type == 1  ||province.type == 2;
				var level = values;
				if(level > cp.defaults.level){
					if(cp.defaults.level == 2 && values.length == 3 && isMunicipal){
						//保存原样
					}else{
						originalVal  = pCode;
					}
					level = cp.defaults.level;
				}
				cp.selectedVal = originalVal;
				cp.hiddenInput.val(originalVal);
				switch(level){
				case 1 :
					cp.selectedName = city_array[pCode].t ;
					break;
				case 2 :
					cp.selectedName = city_array[pCode].t + cp.defaults.join + city_array[pCode].v[cCode].t;
					break;
				case 3 :
					cp.selectedName = city_array[pCode].t + cp.defaults.join + city_array[pCode].v[cCode].t + cp.defaults.join +city_array[pCode].v[cCode].v[originalVal];
					break;
				}
				cp.input.val(cp.selectedName);
			}
			if(!defaults.pinyin){
				cp.input.prop('readOnly', true);
			}
			cp.input.bind('click', function(event){
				//event.stopPropagation();				
				$.fn.cityPicker.triggering = cp;
				cp.input.select();
				show(cp);
			});

			cp.hiddenInput.data('citypicker', cp);
			//最外层框div
			cp.pickerPanel = $('<div class="citypicker" style="display:none;"></div>').appendTo('body');
			cp.pickerPanel.data('citypicker', cp);
			//顶层tab框
			cp.tabPanel = $('<ul class="citytabpanel"></ul>').appendTo(cp.pickerPanel);
			if(defaults.common){				
				cp.commonTab = $('<li xun_for="commonPanel">常用</li>').appendTo(cp.tabPanel).bind('click', function(event){
					event.stopPropagation();
					if(cp.commonTab.is('.cur')){
						return;
					}
					resetPanel(cp);
					cp.commonTab.addClass('cur');
					cp.commonPanel.show();
				});
				renderCommon(cp);
			}
			cp.provinceTab = $('<li xun_for="provincePanel">省份</li>').appendTo(cp.tabPanel).bind('click', function(event){
				event.stopPropagation();
				if(cp.provinceTab.is('.cur')){
						return;
					}
					resetPanel(cp);
					cp.provinceTab.addClass('cur');
					cp.provincePanel.show();
			});
			renderProvince(cp);
			if(defaults.level > 1){
				cp.cityTab = $('<li xun_for="cityPanel">城市</li>').appendTo(cp.tabPanel).bind('click', function(event){
					event.stopPropagation();
					//already selected, all no province has been selected!
					if(cp.cityTab.is('.cur') || cp.selectedProvince == null){
						return;
					}
					showCity(cp);
				});
				renderCity(cp);
				cp.cityGroups = {};
				if(defaults.level > 2){
					cp.countyTab = $('<li xun_for="countyPanel">区县</li>').appendTo(cp.tabPanel).bind('click', function(event){
						event.stopPropagation();
						//already selected, all no province has been selected!
						if(cp.countyTab.is('.cur') || cp.selectedCity == null){
							return;
						}
						showCounty(cp);
					});
					renderCounty(cp);
					cp.countyGroups = {};
				}
			}
			if(defaults.clearable){
				cp.input.bind('keydown', function(event){
					event.stopPropagation();
					if(event.keyCode == 8){
						cp.clear();
						//prevent IE back to prev page
						event.preventDefault();
					}
				});
			}
//			if(defaults.clearBtn){
//				cp.clearBtn = $('<li class="clearbtn">清除</li>').appendTo(cp.tabPanel).bind('click', function(event){
//					event.stopPropagation();
//					cp.clear();
//				});
//			}

			cp.hide = function(){
				cp.showing = false;
				/*if(cp.input.val() == null || cp.input.val() == ''){
					cp.input.val(cp.selectedName);
				}*/
				if(cp.defaults.selectableLevel == 2)
				{
					if( cp.hiddenInput.val() % 10000 == 0){
						cp.input.val("");
						cp.selectedVal = "";
						cp.selectedName = "";
						if(cp.defaults.errortagid)
							   $("#"+cp.defaults.errortagid).html("<label for=\""+cp.defaults.errortagid+"\" generated=\"true\" class=\"error\">请选择至城市一级！</label>");
						}else{
							if(cp.defaults.errortagid)
								   $("#"+cp.defaults.errortagid).html("");
						}
				}else if (cp.defaults.selectableLevel == 3){
					if( cp.hiddenInput.val() % 100 == 0){
						cp.input.val("");
						cp.selectedVal = "";
						cp.selectedName = "";
						if(cp.defaults.errortagid)
						   $("#"+cp.defaults.errortagid).html("<label for=\""+cp.defaults.errortagid+"\" generated=\"true\" class=\"error\">请选择至区县一级！</label>");
					}else{
						if(cp.defaults.errortagid)
							   $("#"+cp.defaults.errortagid).html("");
					}
				}
	
				cp.pickerPanel.hide();
			};
			cp.valid = function(){
				return cp.input.val() == cp.selectedName;
			};
			cp.show = function(){
				show(this);
			};
			cp.clear = function(){
				cp.selectedProvince = null;
				cp.selectedCity = null;
				cp.selectedCounty = null;
				cp.selectedName = '';
				cp.hiddenInput.val('');
				cp.input.val('');
				cp.show();
			};

		    cp.getValueCode = function(){
	          return cp.hiddenInput.val();
	        };
	        
	        cp.getValueText = function(){
	          return cp.input.val();
	        };
	        
	        cp.getSingleValueText = function(){
	        	var nvalues = cp.input.val().split(cp.defaults.join); 
	          return nvalues[nvalues.length - 1];
	        };
	        
	        cp.setValueCode = function(code){
				setVal(code2text(code, ',', false), code, cp);
	        };
		        
		//	return $(this);
		});
	};
	$.fn.cityPicker.options = {common : true, level : 2, join : '-','onSelected' :null, pinyin : true, generic : false, clearable : true,selectableLevel : 1,errortagid:""};
	$.fn.cityPicker.commonCity = ['500100', '150100', '200100', '320100', '430100','110100','120100','201500','710100','720100','340100','700100','120900','510100'];
	/*$.fn.cityPicker.commonCity = ['120000', '150000', '100000', '700000', '710000','720000','510000','130000','110000','110713','110714','110715','110716','110717'];*/
	$.fn.cityPicker.provinceRegions = [{'A-G':['100000','500000','300000','110000','200000','400000','210000','310000']}, {'H-N':['510000','700000','600000','220000','710000','720000','610000','120000','130000','620000','410000','520000']}, {'O-U':['420000','320000','140000','150000','430000','530000','540000']},{'V-Z':['330000','440000','340000','160000']}];
})(jQuery);
jQuery(function($){
	$(document).bind('click', function(event){
		var target = $(event.target);
		if(target.is('.citypicker') || target.parents('.citypicker').length != 0){
			return;
		} else {
			$('.city_pinyin_hint_panel').hide();
		}
		$('.citypicker').each(function(){
			var cp = $(this).data('citypicker');
			if(cp != $.fn.cityPicker.triggering || cp.input[0] != event.target){
				cp.hide();
			}
		});
	});

});


var CityPinyinIndex = {
	'A':{
	'A':{
		'X':{
			'Q':{'list':[600913]}
		},
	},
	'B':{
		'G':{
			'Q':{'list':[521210]}
		},
		'X':{'list':[320203]},
		'Z':{'list':[320200]}
	},
	'C':{
		'list':[600104],
		'Q':{'list':[510701]}
	},
	'D':{
		'list':[601103],
		'Q':{'list':[400301]},
		'X':{'list':[330506]}
	},
	'E':{
		'S':{'list':[521102]}
	},
	'F':{
		'X':{'list':[130403]}
	},
	'G':{'list':[510211]},
	'H':{
		'list':[100000,110717],
		'Q':{
			'list':[600501,520512],
			'X':{'list':[441103]}
		},
		'X':{'list':[721005]}
	},
	'J':{
		'Q':{'list':[321702]},
		'X':{'list':[160205]}
	},
	'K':{
		'list':[430200],
		'S':{
			'list':[400605,440201],
			'D':{
				'Q':{'list':[440200]}
			},
		},
		'T':{
			'X':{'list':[441102]}
		},
	},
	'L':{
		'list':[701106],
		'D':{
			'Q':{'list':[330200]}
		},
		'S':{
			'M':{'list':[520200]},
			'Y':{
				'Q':{'list':[520202]}
			},
			'Z':{
				'Q':{'list':[520201]}
			},
		},
		'T':{
			'list':[440301],
			'D':{
				'Q':{'list':[440300]}
			},
		},
		'X':{'list':[310708]}
	},
	'M':{
		'list':[800000,800100,800101],
		'Q':{'list':[600808]}
	},
	'N':{
		'list':[340114],
		'Q':{'list':[400104]}
	},
	'P':{
		'X':{'list':[510605]}
	},
	'Q':{'list':[100200,520509,141303]},
	'R':{
		'Q':{'list':[520712]},
		'X':{'list':[720302,330612]}
	},
	'S':{
		'list':[310200,620200],
		'X':{'list':[430909]}
	},
	'T':{
		'S':{'list':[441101]},
		'X':{'list':[610908]}
	},
	'W':{
		'T':{
			'X':{'list':[440208]}
		},
	},
	'X':{
		'list':[321305],
		'X':{'list':[110707,400603,510202,720203]}
	},
	'Y':{
		'list':[710200],
		'Q':{'list':[130701]},
		'X':{'list':[710205,130312,130108,322102]}
	},
	'Z':{
		'X':{'list':[530511]}
	},
},
'B':{
	'A':{
		'list':[600505],
		'Q':{'list':[201504]},
		'X':{'list':[710406]},
		'Z':{'list':[220505]}
	},
	'B':{
		'list':[100300],
		'Q':{'list':[300122,210901]},
		'X':{'list':[211404,330311]}
	},
	'C':{
		'list':[610200,540115],
		'Q':{
			'list':[140201,540103],
			'Z':{'list':[321307]}
		},
		'X':{'list':[440206,441002,340509]}
	},
	'D':{
		'list':[510200],
		'H':{
			'Q':{'list':[510803]}
		},
		'J':{
			'Q':{'list':[610301]}
		},
		'Q':{'list':[401202]},
		'X':{'list':[700204,530803]}
	},
	'E':{
		'J':{
			'X':{'list':[440302]}
		},
		'T':{
			'L':{'list':[440400]}
		},
	},
	'F':{
		'X':{'list':[710906]},
		'Z':{'list':[202122]}
	},
	'G':{
		'Q':{'list':[710202]},
		'S':{
			'Q':{'list':[101004]}
		},
		'X':{'list':[330503]}
	},
	'H':{
		'list':[210200],
		'Q':{'list':[100104,720301,120906]},
		'X':{
			'list':[121104,430210,440509],
			'Q':{'list':[540119]}
		},
		'Z':{'list':[220612]}
	},
	'I':{
		'X':{'list':[430806]}
	},
	'J':{
		'list':[500000,500100,310301,430300],
		'D':{
			'Q':{'list':[310300]}
		},
		'Q':{'list':[160108]},
		'T':{
			'Q':{'list':[440903]}
		},
		'X':{'list':[720905]}
	},
	'K':{
		'X':{'list':[701006]}
	},
	'L':{
		'list':[211406,440401],
		'K':{'list':[440702]},
		'Q':{'list':[601101,430112,160608]},
		'X':{'list':[200603,601004,330610]},
		'Y':{
			'Q':{'list':[520507]}
		},
		'Z':{
			'Q':{'list':[520508]}
		},
	},
	'M':{
		'X':{'list':[420202,330405]},
		'Y':{
			'Z':{'list':[210804]}
		},
	},
	'N':{
		'list':[621007],
		'Q':{'list':[300138]}
	},
	'P':{'list':[620406]},
	'Q':{
		'Q':{'list':[430110]},
		'X':{'list':[600902,601207,330502]},
		'Z':{'list':[441201]}
	},
	'R':{
		'X':{'list':[330508]}
	},
	'S':{
		'list':[210300,610300,340200],
		'Q':{'list':[100302,510215,601204,141603,150108]},
		'X':{'list':[300120,430704,330305]}
	},
	'T':{
		'list':[510404,520300],
		'Q':{'list':[720710,621101,430901]},
		'X':{'list':[320804,321009]}
	},
	'X':{
		'I':{'list':[600109,620300]},
		'Q':{'list':[120112]},
		'X':{'list':[511014,620305,321808,140206]}
	},
	'Y':{
		'list':[400200],
		'G':{
			'L':{'list':[440500]}
		},
		'K':{
			'Q':{'list':[520305]}
		},
		'N':{
			'E':{'list':[520400]}
		},
		'Q':{
			'list':[200106,400201,310106],
			'Q':{'list':[621403]}
		},
		'X':{'list':[210102,510207,600108,121204,320808]}
	},
	'Z':{
		'list':[100400,510702,320300,140200],
		'Q':{'list':[320301]}
	},
},
'C':{
	'A':{
		'X':{'list':[200202,510513,160104]},
		'Z':{'list':[200332]}
	},
	'B':{
		'list':[701206],
		'C':{
			'E':{
				'X':{'list':[441507]}
			},
		},
		'E':{
			'H':{
				'Q':{'list':[520708]}
			},
		},
		'M':{
			'Z':{'list':[720702]}
		},
		'Q':{'list':[420104]}
	},
	'C':{
		'list':[610100],
		'Q':{'list':[120501,430310]},
		'S':{
			'H':{
				'Q':{
					'N':{
						'C':{'list':[220513]}
					},
				},
			},
		},
		'X':{'list':[511102,430706]},
		'Z':{'list':[701413]}
	},
	'D':{
		'list':[510300,720200,320100],
		'D':{
			'Q':{'list':[330300]}
		},
		'Q':{'list':[700901,700104,420101]},
		'X':{'list':[510308,420803,330301]}
	},
	'F':{'list':[520500]},
	'G':{
		'Q':{'list':[400101,330101]},
		'X':{'list':[310511,430409,340109]}
	},
	'H':{
		'list':[100500,200112],
		'H':{
			'Z':{
				'Q':{'list':[710713]}
			},
		},
		'Q':{'list':[201306,711601,320115]},
		'X':{'list':[310707,430803]},
		'Z':{'list':[100600]}
	},
	'J':{
		'list':[440601],
		'Q':{'list':[130501]},
		'X':{'list':[310504,341503]},
		'Z':{'list':[440600]}
	},
	'K':{
		'Q':{'list':[201901]},
		'X':{'list':[300108]}
	},
	'L':{
		'Q':{'list':[601313,120701]},
		'X':{'list':[510805,511117,721303,721407,141307,440806]}
	},
	'M':{
		'X':{'list':[330706]}
	},
	'N':{
		'list':[720512],
		'Q':{'list':[201305]},
		'X':{'list':[330702,340205,161005]}
	},
	'P':{
		'Q':{'list':[500104,321901]},
		'X':{'list':[140704]},
		'Z':{'list':[200314,220510]}
	},
	'Q':{
		'list':[300000,300100,201401,530201,530301,531001,531101],
		'X':{'list':[330207]}
	},
	'R':{
		'X':{'list':[130207]}
	},
	'S':{
		'list':[310902,720100,120705],
		'Q':{'list':[110211,321701]},
		'X':{'list':[140906,160703]},
		'Z':{'list':[200307]}
	},
	'T':{
		'Q':{'list':[510518,320703]},
		'X':{'list':[621305]}
	},
	'W':{
		'Q':{'list':[500114]},
		'X':{'list':[211304,140504]}
	},
	'X':{
		'list':[400802,211307,510414,510510,140502,340301,160602],
		'Q':{'list':[110601,420103]},
		'X':{'list':[401004,720409,320707]},
		'Z':{'list':[340300]}
	},
	'Y':{
		'list':[620400,141312],
		'H':{
			'Q':{'list':[521003]}
		},
		'I':{
			'Q':{'list':[610401]}
		},
		'Q':{
			'list':[500112,201304,610108,610403,141006,341201],
			'Q':{'list':[521005]}
		},
		'X':{'list':[701204,130313,620403,330306,330406,340808]},
		'Z':{
			'Q':{'list':[521004]}
		},
	},
	'Z':{
		'list':[100700,200200,210400,510400,720300,120200,320119,110716],
		'H':{
			'Q':{'list':[600705]}
		},
		'Q':{'list':[211101,120302,420102]},
		'X':{'list':[531111]}
	},
},
'D':{
	'A':{
		'list':[610205],
		'L':{
			'Q':{'list':[600101]}
		},
		'Q':{'list':[600801,322003]},
		'X':{'list':[721208,130606,140705]},
		'Y':{
			'Z':{'list':[210803]}
		},
	},
	'B':{
		'C':{
			'Q':{'list':[440106]}
		},
		'Q':{'list':[700601]},
		'S':{'list':[621306]},
		'X':{'list':[200903,400405,210308,320816,431007]}
	},
	'C':{
		'F':{
			'Q':{'list':[140701]}
		},
		'H':{
			'X':{'list':[510703]}
		},
		'Q':{'list':[500101,210716,720202,610801,140401,340110,200303]},
		'X':{'list':[400804,510705,711605,130604,320802,321014]}
	},
	'D':{
		'list':[620500],
		'K':{
			'Q':{'list':[300127]}
		},
		'Q':{'list':[700602,600703,620111]}
	},
	'E':{
		'B':{
			'T':{
				'X':{'list':[600209]}
			},
		},
	},
	'F':{
		'list':[710112,121109],
		'Q':{'list':[600608]},
		'X':{'list':[310302,610503,320813,430503]},
		'Z':{'list':[202109]}
	},
	'G':{
		'list':[200300,620505],
		'Q':{'list':[100210,141101,540107]},
		'X':{'list':[510412,320809,341607]}
	},
	'H':{
		'list':[400607,610110,610903],
		'N':{
			'C':{'list':[220515]}
		},
		'Q':{'list':[202002,130101,520301,161101]},
		'X':{'list':[110705,120405]},
		'Y':{
			'Z':{'list':[210802]}
		},
		'Z':{'list':[340400,220601]}
	},
	'J':{
		'K':{'list':[700808]},
		'Q':{'list':[100901,701311]},
		'X':{'list':[300106,310804,330607]},
		'Y':{'list':[320104]}
	},
	'K':{
		'X':{'list':[720705,520403]},
		'Z':{'list':[200313]}
	},
	'L':{
		'list':[620600,340501],
		'D':{
			'Q':{
				'X':{'list':[330106]}
			},
		},
		'H':{'list':[420702]},
		'Q':{'list':[600115,601306,620107,540106]},
		'S':{
			'L':{
				'Y':{
					'G':{
						'S':{'list':[220603]}
					},
				},
			},
			'Z':{'list':[200321]}
		},
		'T':{
			'Q':{'list':[520602]}
		},
		'X':{'list':[210807,610504,521212,420704,321205,430708]},
		'Z':{'list':[340500,200316,220511]}
	},
	'M':{
		'Q':{'list':[201802,520309]},
		'X':{'list':[510512,140509]}
	},
	'N':{
		'X':{'list':[600806,130310,530507]}
	},
	'P':{
		'Q':{'list':[321201]},
		'X':{'list':[201003,141204]}
	},
	'Q':{
		'list':[600200,321601,202102],
		'X':{'list':[202006,330307,340602,160203]},
		'Z':{'list':[340600]}
	},
	'R':{
		'X':{'list':[420204,320818,330615]}
	},
	'S':{
		'N':{
			'C':{'list':[220516]}
		},
		'Q':{'list':[200101,211302,600405,621406,520601,440107]},
		'X':{'list':[101402,110905,310607,161103]},
		'Z':{
			'list':[202112],
			'Q':{'list':[440901]}
		},
	},
	'T':{
		'list':[121108,621107,530200],
		'N':{
			'C':{'list':[220514]}
		},
		'Q':{'list':[101001,600205,121303]},
		'X':{'list':[101304,110807,420105,140508,530211,161008]}
	},
	'W':{
		'K':{
			'Q':{'list':[410301]}
		},
		'Q':{'list':[600117,521207]},
		'X':{'list':[701103,621203]}
	},
	'X':{
		'list':[400300,210504,721206,130812,320502,140503,530811],
		'A':{
			'L':{'list':[600300]}
		},
		'H':{
			'Q':{'list':[700106]}
		},
		'Q':{'list':[500103,720711,321502]},
		'X':{'list':[210405,510222,130202,530813,330103]},
		'Z':{'list':[400907]}
	},
	'Y':{
		'list':[310601,700506,701302,121304,320400,140300,160308],
		'Q':{'list':[140301,141202]},
		'X':{'list':[100605,200506,130315,320107,321705,340305]},
		'Z':{'list':[200327,202119]}
	},
	'Z':{
		'list':[510210,710813,320500,140400],
		'Q':{'list':[202001,620702]},
		'X':{'list':[100702,300132,310516,310908,320505,330107]}
	},
},
'E':{
	'B':{
		'X':{'list':[320903]}
	},
	'C':{
		'Q':{'list':[700303]}
	},
	'D':{
		'J':{
			'Q':{'list':[610802]}
		},
		'Q':{'list':[610107]}
	},
	'E':{
		'D':{
			'S':{'list':[520600]}
		},
		'G':{
			'N':{'list':[520702]}
		},
	},
	'J':{
		'N':{
			'Q':{'list':[520203]}
		},
	},
	'L':{
		'C':{'list':[520710]},
		'H':{
			'T':{'list':[521201]}
		},
	},
	'M':{
		'S':{'list':[320911]},
		'X':{'list':[441303]}
	},
	'P':{'list':[200707]},
	'Q':{
		'Q':{'list':[710111]}
	},
	'S':{
		'list':[700201],
		'Y':{
			'Z':{'list':[341507]}
		},
		'Z':{'list':[700200]}
	},
	'T':{
		'K':{
			'Q':{
				'list':[520605],
				'Q':{'list':[520604]}
			},
		},
	},
	'W':{
		'K':{
			'Z':{'list':[520709]}
		},
	},
	'Y':{
		'X':{'list':[340503]}
	},
	'Z':{'list':[700300]}
},
'F':{
	'A':{'list':[110408]},
	'C':{
		'list':[131003,620506,141206],
		'G':{'list':[210500]},
		'Q':{'list':[200107,210502,701002,321301]},
		'X':{'list':[101606,510602,710810]},
		'Y':{
			'Z':{'list':[210904]}
		},
	},
	'D':{
		'list':[110409],
		'X':{'list':[100106,300107]}
	},
	'F':{
		'K':{
			'Q':{'list':[510516]}
		},
		'X':{'list':[430307]}
	},
	'G':{
		'X':{'list':[201102,310906,711609,431010,341002]},
		'Z':{'list':[200331]}
	},
	'H':{
		'list':[160611],
		'X':{'list':[720903,440304]},
		'Z':{'list':[220204]}
	},
	'J':{
		'list':[110000,600611],
		'X':{'list':[300110]}
	},
	'K':{
		'list':[440602],
		'X':{'list':[202005,620102]}
	},
	'L':{
		'E':{
			'J':{
				'Q':{'list':[600912]}
			},
		},
		'Q':{'list':[300129]},
		'X':{'list':[130503]}
	},
	'M':{
		'Q':{'list':[610404]},
		'X':{'list':[340107]}
	},
	'N':{
		'Q':{'list':[510910]},
		'X':{'list':[100806,510303,510806,121105,341308]}
	},
	'P':{
		'X':{'list':[510220,430411,430703]}
	},
	'Q':{
		'list':[110202,310611],
		'Q':{'list':[711410]},
		'X':{'list':[711404,340802]}
	},
	'R':{
		'Q':{'list':[510909,720101]}
	},
	'S':{
		'list':[200400,620700],
		'Q':{'list':[500107,141511]},
		'X':{'list':[201004,210402,210808,610302,620705,322006,530510,530605]}
	},
	'T':{
		'Q':{'list':[500111,201502]},
		'X':{'list':[101006]}
	},
	'X':{
		'list':[700807,711004,121006,620800,140905,430302,430905],
		'Q':{'list':[510517,150118]},
		'X':{'list':[100107,510509,131009,620806,430309,530503]}
	},
	'Y':{
		'list':[100800,530613,160102],
		'Q':{'list':[200104]},
		'X':{'list':[100606,600603,600905,610705,130902,440303,341106]}
	},
	'Z':{
		'list':[110200,130200,521011],
		'Q':{'list':[110711,141310]},
		'X':{'list':[600110,530810]}
	},
},
'G':{
	'A':{
		'list':[131010,320600],
		'Q':{'list':[320601]},
		'X':{'list':[700703,510708,321905]}
	},
	'B':{
		'D':{'list':[510225]},
		'J':{
			'D':{
				'X':{'list':[330402]}
			},
		},
		'Q':{'list':[210601]},
		'X':{'list':[330618]}
	},
	'C':{
		'list':[510108],
		'H':{
			'Z':{
				'Z':{'list':[701415]}
			},
		},
		'Q':{'list':[100701,710110,140802,340901]},
		'X':{'list':[701005,510604,120113,130211,420304]},
		'Y':{
			'Z':{'list':[210717]}
		},
	},
	'D':{
		'list':[200000],
		'Q':{'list':[340112]},
		'X':{'list':[101703,310609,720303,420203,420503]}
	},
	'E':{
		'M':{'list':[420701]},
		'X':{'list':[330203]}
	},
	'F':{
		'X':{'list':[130810]}
	},
	'G':{
		'list':[210600],
		'Q':{'list':[120802]},
		'X':{'list':[401205,330710]}
	},
	'H':{
		'list':[520713,320404],
		'X':{'list':[400905,420501]},
		'Z':{'list':[701411]}
	},
	'J':{
		'list':[530110,340701],
		'Q':{'list':[322002]},
		'X':{'list':[330205,330309]},
		'Z':{
			'Q':{'list':[620607]}
		},
	},
	'K':{
		'Q':{'list':[210501]},
		'Z':{'list':[202118]}
	},
	'L':{
		'list':[210700],
		'Q':{'list':[110201,710508,120109,121001,121201]},
		'X':{'list':[400107,401303,310205,321003,321107,430113,530205,441505]},
		'Z':{'list':[420200]}
	},
	'M':{
		'list':[141302],
		'Q':{'list':[200405]},
		'X':{
			'list':[340807],
			'Q':{'list':[201508]}
		},
	},
	'N':{
		'Q':{'list':[210602,600402]},
		'X':{'list':[202003,600906,120407,420505,341307]},
		'Z':{'list':[400400]}
	},
	'P':{
		'list':[210605,530306],
		'Q':{'list':[321402]},
		'X':{'list':[510505]},
		'Z':{'list':[220607]}
	},
	'Q':{
		'list':[110715],
		'X':{'list':[141607,430906]}
	},
	'R':{
		'X':{'list':[140305]}
	},
	'S':{
		'list':[400000,700902],
		'Q':{'list':[160110]},
		'X':{'list':[711507,341003]},
		'Z':{'list':[200319]}
	},
	'T':{
		'Q':{'list':[621001]},
		'X':{'list':[110403,401405,510504,140707]}
	},
	'U':{
		'S':{
			'X':{'list':[711504]}
		},
	},
	'X':{
		'list':[210000,130317,131103,321904,140706,530512],
		'Q':{'list':[321310,320120]}
	},
	'Y':{
		'list':[202007,310100,710105,121206,410200,320700],
		'N':{
			'C':{'list':[220201]}
		},
		'Q':{'list':[510709,510912]},
		'U':{
			'N':{
				'X':{'list':[120406]}
			},
		},
		'X':{'list':[210706,510224,510112,511110,720309,120404,520308]}
	},
	'Z':{
		'list':[200100,200904,310000,130300,621405],
		'L':{
			'list':[610605],
			'Q':{'list':[621104]}
		},
		'Q':{'list':[401401,120502]},
		'X':{'list':[100307,110507,511007,720906,320811,330206]},
		'Z':{
			'list':[202113],
			'Z':{'list':[320800]}
		},
	},
},
'H':{
	'A':{
		'list':[120300],
		'X':{'list':[110708,110902,700408,511106,120503]}
	},
	'B':{
		'list':[100900,700000,710300],
		'H':{
			'X':{'list':[440305]}
		},
		'K':{
			'S':{
				'E':{'list':[441307]}
			},
		},
		'Q':{'list':[711101,430201,540111]},
		'W':{
			'Q':{'list':[520901]}
		},
		'X':{'list':[711502]},
		'Z':{'list':[420300]}
	},
	'C':{
		'list':[300113,210800,701107,610904,620207,430702],
		'Q':{'list':[110102,200601,210201,310913,720401,141401]},
		'X':{'list':[401104,711503,600605,130305,441506]}
	},
	'D':{
		'list':[510500,610407],
		'D':{
			'Q':{'list':[420400]}
		},
		'Q':{'list':[500109,200103,140910,141009,540114,220206]},
		'X':{'list':[200604,510515,720504,521009,321012,530513]}
	},
	'E':{
		'B':{'list':[510000,600100]},
		'N':{
			'list':[710000],
			'Q':{'list':[700105]}
		},
	},
	'F':{
		'list':[100100],
		'X':{'list':[201402,700208,130807]}
	},
	'G':{
		'list':[700400,600400],
		'Q':{'list':[400105,510801,600204,620110]},
		'X':{'list':[531106]}
	},
	'H':{
		'list':[700707,510402,600500,720400],
		'G':{
			'Q':{'list':[310901]}
		},
		'H':{
			'T':{'list':[520100]}
		},
		'X':{'list':[340704]},
		'Z':{'list':[340700]}
	},
	'J':{
		'list':[510416,720412,530913],
		'H':{
			'Q':{'list':[520407]}
		},
		'K':{
			'F':{
				'Q':{'list':[202106]}
			},
		},
		'M':{
			'N':{
				'Z':{'list':[210805]}
			},
		},
		'Q':{'list':[110602,201303,121202,520606,710113]},
		'X':{'list':[202004,711407,321105,440507]},
		'Z':{'list':[200323,200330]}
	},
	'K':{
		'list':[220100],
		'Q':{'list':[140302,150111]},
		'X':{'list':[130603,340713]}
	},
	'L':{
		'list':[600708,600803,601110,610906],
		'B':{
			'E':{'list':[520700]}
		},
		'D':{'list':[620900]},
		'E':{
			'Q':{'list':[520701]}
		},
		'G':{
			'E':{
				'X':{'list':[520107]}
			},
			'L':{'list':[520808]}
		},
		'J':{'list':[600000]},
		'O':{
			'X':{'list':[430902]}
		},
		'Q':{'list':[110103,711001,600112,120801]},
		'X':{'list':[200804,511104,410105,420405,321013,430913]},
		'Z':{'list':[200310,202114]}
	},
	'M':{
		'list':[120508,530502,440701],
		'D':{
			'Q':{'list':[440700]}
		},
		'Q':{'list':[520102]},
		'X':{'list':[700403,600301,140202]},
		'Z':{'list':[200324,200329]}
	},
	'N':{
		'list':[101000,220000,160405],
		'M':{
			'G':{
				'Z':{'list':[420604]}
			},
		},
		'Q':{'list':[520902,410302]},
		'X':{
			'list':[100208,400204,600606,720506,610804,341505],
			'Q':{'list':[620114]}
		},
		'Z':{'list':[420500]}
	},
	'P':{
		'Q':{'list':[200105,700102,620101,150101,540101]},
		'X':{'list':[200505,210204,310515,340904]},
		'Z':{'list':[202107]}
	},
	'Q':{
		'Q':{'list':[711401,120708,540110]},
		'X':{'list':[101204,530804,340512]}
	},
	'R':{
		'Q':{'list':[500102,700302]},
		'X':{'list':[721105,620306,530706]}
	},
	'S':{
		'list':[101100,200706,211006,700500,510600],
		'G':{
			'Q':{'list':[700501]}
		},
		'Q':{'list':[100304,101102,101302,700107,510501,710301,600702,721002,120905,520501,160601]},
		'X':{'list':[100504,101207,401105,310602,720204,720505,621004,320206,431009,530408,440508]},
		'Z':{'list':[220512]}
	},
	'T':{
		'list':[440801],
		'B':{
			'X':{'list':[440604]}
		},
		'D':{
			'Q':{'list':[440800]}
		},
		'Q':{'list':[721401,141311,430401,341501,220211]},
		'W':{
			'Z':{'list':[220202]}
		},
		'X':{'list':[401005,720407,141606,440802]}
	},
	'U':{
		'N':{
			'list':[720000],
			'Z':{'list':[420600]}
		},
		'Z':{'list':[160200]}
	},
	'W':{
		'Q':{'list':[621103]}
	},
	'X':{
		'list':[100505,400808,401103,210112,710207,711412,430710,430102],
		'Q':{'list':[310108,601304,540113,220205]},
		'X':{'list':[510411]},
		'Z':{'list':[420700]}
	},
	'Y':{
		'list':[200500,720500,320605,141512,430711],
		'Q':{'list':[200602,700110,120303,140108,160902]},
		'X':{'list':[100305,711604,720507,720904,410503,420303,420107,320213,321204,321804,430209,430707,530203,160404]},
		'Z':{'list':[701405]}
	},
	'Z':{
		'list':[200600,200905,400401,210900,140500,430400,530517,160100],
		'Q':{'list':[101103,200109,700401,120403,620801]},
		'X':{'list':[400906,310308,120306,420404,420106,341107]}
	},
},
'J':{
	'A':{
		'list':[610807,130400],
		'Q':{'list':[101201,110209,700101,150114]},
		'X':{'list':[130411,131005,321907]}
	},
	'B':{
		'Q':{'list':[300126,160609]},
		'X':{'list':[431008]}
	},
	'C':{
		'list':[400500,530300],
		'J':{
			'Q':{'list':[210801]}
		},
		'P':{
			'Q':{'list':[530107]}
		},
		'Q':{'list':[100501,110401,201701,400501,120709]},
		'X':{'list':[401002,620905,320208,140507,530611,330704,340502,341204,341502]}
	},
	'D':{
		'list':[121207,160103],
		'Q':{'list':[150107,160302,160610]},
		'X':{'list':[101706,200802,600707,330310]},
		'Y':{
			'Z':{'list':[341207]}
		},
		'Z':{'list':[130500]}
	},
	'F':{
		'Q':{'list':[710401,410103]}
	},
	'G':{
		'Q':{'list':[600701,160111]},
		'S':{'list':[130413]},
		'X':{'list':[320706,341206]}
	},
	'H':{
		'list':[610406,341401,160300],
		'Q':{'list':[101601,200702,700112,600915]},
		'X':{'list':[310508,720306,120308,121107,440402,540118]},
		'Y':{
			'Z':{'list':[721211]}
		},
	},
	'I':{
		'X':{
			'X':{'list':[140607]}
		},
	},
	'J':{
		'list':[300114,110702,120804,130600],
		'Q':{'list':[101604,320101,160901]},
		'X':{'list':[130610,320905]},
		'Z':{
			'list':[220501],
			'Q':{'list':[101301]}
		},
	},
	'K':{
		'H':{
			'Q':{'list':[320908]}
		},
		'Q':{'list':[121301]},
		'X':{'list':[310809,530603]}
	},
	'L':{
		'list':[610000,610400],
		'I':{
			'X':{'list':[700704]}
		},
		'P':{
			'Q':{'list':[300124]}
		},
		'Q':{'list':[710711,121009,321403]},
		'X':{'list':[110804,201007,700705,511009,320815,530808,330509,330604]}
	},
	'M':{
		'list':[200700,700600,141004],
		'N':{
			'X':{'list':[440307]}
		},
		'Q':{'list':[110104]},
		'S':{
			'list':[600600],
			'E':{
				'X':{'list':[440607]}
			},
		},
		'X':{'list':[110704]}
	},
	'N':{
		'list':[140600,141002],
		'A':{'list':[140100]},
		'Q':{'list':[210110,120104,521001,320117,540104]},
		'X':{'list':[110802,401007,140903,340108,160508]}
	},
	'O':{'list':[110502]},
	'P':{
		'Q':{'list':[201302]},
		'X':{'list':[310509,620404,340703]}
	},
	'Q':{'list':[400600]},
	'R':{'list':[121306]},
	'S':{
		'list':[100808,720209,720901,120000,160706],
		'Q':{'list':[710109,601201,721103,150105]},
		'S':{
			'X':{'list':[400908]}
		},
		'T':{
			'Q':{'list':[601310]}
		},
		'X':{'list':[310304,700203,700603,130410,530909,441003,340709,160403]}
	},
	'T':{
		'list':[610103,120207],
		'Q':{'list':[430311]},
		'X':{'list':[400205,400602,320110]}
	},
	'W':{
		'Q':{'list':[201803,121008]},
		'X':{'list':[320907]}
	},
	'X':{
		'list':[101704,510603,710304,710903,600700,130000,141104,431004,530411,530907,160400],
		'K':{
			'Q':{'list':[510117]}
		},
		'Q':{'list':[700103,710712]},
		'X':{'list':[101705,200803,210307,510119,601205,130204,130109,140608]},
		'Y':{
			'Z':{'list':[211005]}
		},
	},
	'Y':{
		'list':[110510,200800,711800,711801,120806,120907,321309,322104],
		'G':{'list':[400700]},
		'Q':{'list':[120110,520306,320401,321101,530105,220212]},
		'U':{
			'X':{'list':[610303]}
		},
		'X':{'list':[400203,701202,601302,721205,610305,410204,321008,320906,140505,140103,430810,160503]},
		'Z':{'list':[220203]}
	},
	'Z':{
		'list':[700700,510610,510109,710400,720403,621000,141005,530400],
		'G':{
			'X':{'list':[320209]}
		},
		'Q':{'list':[210401,700702,130401,620605]},
		'X':{'list':[101206,510506,420205,420602,330616]}
	},
},
'K':{
	'B':{
		'X':{'list':[511111]}
	},
	'C':{
		'Q':{'list':[610109,160701]},
		'X':{'list':[510302,440203]}
	},
	'D':{
		'L':{
			'Q':{'list':[520302]}
		},
		'X':{'list':[600903,620504,320801]}
	},
	'E':{
		'L':{'list':[440501]},
		'Q':{
			'Q':{'list':[520801]}
		},
	},
	'F':{
		'list':[710500],
		'Q':{'list':[720104]},
		'X':{'list':[710502]}
	},
	'H':{
		'X':{'list':[160704]}
	},
	'J':{
		'X':{'list':[320504]}
	},
	'L':{
		'list':[310501],
		'M':{
			'Y':{
				'list':[440900],
				'Q':{'list':[440902]}
			},
		},
		'Q':{
			'list':[520805],
			'Q':{'list':[520503]}
		},
		'X':{'list':[400903,520804,140303,530805]}
	},
	'M':{
		'list':[340100],
		'X':{'list':[330608]}
	},
	'P':{
		'list':[200705],
		'Q':{'list':[510911]},
		'X':{'list':[620103,440209]}
	},
	'Q':{'list':[530210,531002]},
	'S':{
		'list':[120703,441001],
		'D':{
			'Q':{'list':[441000]}
		},
		'K':{
			'T':{
				'Q':{'list':[520505]}
			},
		},
		'X':{'list':[600904]}
	},
	'T':{
		'list':[441509],
		'Q':{'list':[401001]}
	},
	'W':{
		'Q':{'list':[141309]}
	},
	'X':{'list':[300103,400805]},
	'Y':{
		'list':[621307,340712],
		'Q':{
			'Q':{'list':[521103]}
		},
		'X':{'list':[310104]},
		'Z':{
			'Q':{'list':[521104]}
		},
	},
	'Z':{
		'H':{
			'Q':{'list':[520803]}
		},
		'L':{
			'S':{'list':[441100]}
		},
		'X':{'list':[620405]},
		'Z':{
			'Q':{'list':[520802]}
		},
	},
},
'L':{
	'A':{
		'list':[101200,160113],
		'Q':{'list':[710204]},
		'X':{'list':[100603,210105,130206,530606]},
		'Z':{'list':[220614]}
	},
	'B':{
		'list':[211000,711106],
		'Q':{'list':[211107,510913,621404]},
		'X':{'list':[101404,310610,600407,321017,430402]},
		'Z':{'list':[200315]}
	},
	'C':{
		'list':[201202,700202,140700,531113,340800],
		'M':{
			'L':{
				'Z':{'list':[210806]}
			},
		},
		'Q':{'list':[110603,110701,710701,130201,620402,140106,140801,141007,161001]},
		'X':{'list':[110306,200503,210710,211105,211403,510121,511016,710707,130209,521006,321505,430904,530304,531107,340405,340702,341202]}
	},
	'D':{
		'list':[201605,720600],
		'Q':{'list':[601202,160501]},
		'X':{'list':[400809,310605,600208,410203,420403,320817,341610]}
	},
	'E':{
		'Y':{
			'E':{
				'X':{'list':[210304]}
			},
		},
	},
	'F':{
		'list':[201404,510700,530500],
		'Q':{'list':[600202]},
		'X':{'list':[700207,530102,340310]}
	},
	'G':{
		'Q':{'list':[201505,620902]},
		'X':{'list':[210711,430205]},
		'Z':{'list':[220610]}
	},
	'H':{
		'list':[110911,710600,621006,160909],
		'K':{'list':[701007]},
		'Q':{'list':[201301,201501,220102,120103,621002,520401,430111,201507]},
		'X':{'list':[201403,510304,720706,610805,130703,320812,340403]}
	},
	'J':{
		'list':[201907,610306,610905,340900],
		'Q':{'list':[110710]},
		'X':{'list':[100502,110207,211106,600909,320403,140304]},
		'Z':{'list':[220507]}
	},
	'K':{
		'list':[141507],
		'X':{'list':[710510,600805]},
		'Z':{
			'X':{'list':[330712]}
		},
	},
	'L':{
		'list':[721409,140402,530600],
		'G':{
			'Z':{'list':[210312]}
		},
		'Q':{'list':[710710]},
		'X':{'list':[310603,510807,720206,530608,330302,340204,341103]}
	},
	'M':{
		'N':{
			'C':{'list':[220604]}
		},
		'T':{
			'Q':{'list':[321103]}
		},
		'X':{'list':[200605]}
	},
	'N':{
		'list':[400800,620000],
		'Q':{'list':[211108,510901]},
		'X':{'list':[510907,710703,130311,430502]},
		'Y':{
			'Z':{'list':[201105]}
		},
	},
	'O':{
		'Z':{
			'X':{'list':[330705]}
		},
	},
	'P':{
		'list':[130504],
		'S':{'list':[310400]},
		'X':{'list':[300109,200504,210702,310506,510305,440805,341004,341105]}
	},
	'Q':{
		'list':[510123,140708,160509,161011],
		'Q':{'list':[210108,160903]},
		'X':{'list':[100804,400407,141308,430808,530204,340103]},
		'Y':{
			'Q':{'list':[320114]}
		},
	},
	'S':{
		'list':[320900,330100,160500,220600],
		'G':{
			'Z':{'list':[210705]}
		},
		'J':{'list':[720604]},
		'K':{
			'Q':{'list':[620606]}
		},
		'Q':{'list':[100903,600704,600901,721402,610501,130601,620203,620901,140901,141008,141102,141509,530601]},
		'T':{
			'Q':{'list':[721210]}
		},
		'X':{'list':[211203,310503,510219,510113,710904,711104,711508,720908,721203,610603,120305,120102,320604,321807,140604,140912,530402,341001]},
		'Y':{
			'Z':{'list':[321000]}
		},
		'Z':{
			'Z':{
				'Y':{
					'Z':{'list':[201104]}
				},
			},
		},
	},
	'T':{
		'Q':{'list':[710501,610402,410401,430106]},
		'X':{'list':[400305,400402,401003,700407,510906,320805,430104,440502]}
	},
	'W':{
		'list':[410106,140800],
		'Q':{
			'list':[110910,200111,430701,150117,161010],
			'X':{'list':[330308]}
		},
		'X':{'list':[720305]}
	},
	'X':{
		'list':[400807,400901,510205,510908,720205,721109,320212,321104,140410,141012,430305,530609,330407,340402,160306],
		'Q':{'list':[720601,140101,340801,120909]},
		'X':{'list':[100404,101702,400303,400902,511003,601108,720902,130705,520506,340706]},
		'Z':{'list':[400900]}
	},
	'Y':{
		'list':[110300,710700,720109,720502,720605,610500,120206,620407,621100,140900,141506],
		'G':{'list':[120400]},
		'Q':{'list':[100601,100102,711201,610106,120401,340201]},
		'X':{'list':[110206,210305,510213,511013,710605,711602,621106,140407,430303,430404,530912,160705]}
	},
	'Z':{
		'list':[201108,201908,400100,211100,710209,321100,321409,141505],
		'D':{
			'Q':{'list':[330400]}
		},
		'H':{
			'Q':{'list':[100301,700301]}
		},
		'Q':{'list':[401301,140911,141604]},
		'T':{
			'Q':{'list':[310402]}
		},
		'X':{'list':[401404,210404,211104,510514,620104,322103,330102,330401,330613,330703]}
	},
},
'M':{
	'A':{
		'S':{'list':[101300]}
	},
	'B':{
		'X':{'list':[320902]}
	},
	'C':{
		'list':[700402],
		'Q':{'list':[710409]},
		'X':{'list':[100403,510217,510405,711102,320904]}
	},
	'D':{
		'J':{'list':[600800]},
		'Q':{'list':[140501]},
		'X':{'list':[420206,340308,340508]}
	},
	'E':{
		'K':{
			'X':{'list':[320205]}
		},
	},
	'F':{
		'X':{'list':[440808]}
	},
	'G':{
		'list':[100608],
		'Q':{'list':[200902]},
		'T':{
			'X':{'list':[441005]}
		},
		'X':{'list':[321002,341305]}
	},
	'H':{
		'K':{'list':[610806]},
		'X':{'list':[110208,600303,420402,341402]}
	},
	'J':{
		'Q':{'list':[201001,700801]},
		'X':{'list':[310502,710709,341208]}
	},
	'K':{
		'X':{'list':[330303]}
	},
	'L':{
		'list':[600810,721108],
		'P':{
			'X':{'list':[341304]}
		},
		'Q':{'list':[110801,220104]},
		'S':{'list':[600910]},
		'X':{'list':[401403,600107,440608,330403,340707,341102,341203,341403]},
		'Z':{
			'Z':{'list':[321016]}
		},
	},
	'M':{'list':[200900]},
	'N':{
		'Q':{'list':[200901]},
		'S':{
			'X':{'list':[440605]}
		},
		'X':{'list':[321005]}
	},
	'P':{
		'Q':{'list':[141510]}
	},
	'Q':{
		'list':[520711,440603],
		'X':{'list':[110205,400406,401302,711203,420201]}
	},
	'S':{
		'list':[600709,321200],
		'Q':{'list':[710107,600706,620303]},
		'X':{'list':[210104,211306,601105,321802]}
	},
	'T':{
		'G':{
			'Q':{'list':[500108]}
		},
		'Q':{'list':[101602]},
		'X':{'list':[310905,330404]}
	},
	'W':{
		'Q':{'list':[110210]}
	},
	'X':{
		'list':[201002,400307,320211,430306,430406],
		'Q':{'list':[601311,150109]},
		'X':{'list':[110810]}
	},
	'Y':{
		'list':[321300],
		'M':{
			'Z':{'list':[720406]}
		},
		'Q':{'list':[711409]},
		'X':{'list':[711704,420301,321604,140902,440803]},
		'Z':{'list':[200317]}
	},
	'Z':{
		'list':[201000,710411,320406],
		'G':{
			'K':{
				'X':{'list':[330108]}
			},
		},
		'L':{'list':[520705]},
		'Q':{'list':[201904]},
		'X':{'list':[431005,340711]},
		'Z':{'list':[202116,701402]}
	},
},
'N':{
	'A':{
		'list':[110712,600802],
		'Q':{'list':[300123]},
		'X':{'list':[201307,610104]}
	},
	'B':{
		'list':[160600],
		'X':{'list':[321404]}
	},
	'C':{
		'list':[300140,130100,321400],
		'Q':{'list':[601316,200302]},
		'X':{'list':[130210,130106,520502]}
	},
	'D':{
		'list':[110400],
		'X':{'list':[210810,130308,330701]}
	},
	'F':{
		'N':{
			'C':{'list':[220517]}
		},
		'Q':{'list':[620304]},
		'X':{'list':[130208]}
	},
	'G':{
		'list':[101707,511002],
		'Q':{'list':[710507,600118,610101]}
	},
	'H':{
		'list':[600916],
		'Q':{'list':[200402,150102]},
		'X':{'list':[110808,511011,710208,340307,160604,540117]}
	},
	'J':{
		'list':[120100,321500],
		'Q':{'list':[610701,530209]},
		'X':{'list':[110904,511010,600502,320303,140409,340507]},
		'Z':{'list':[341000]}
	},
	'K':{
		'list':[130318],
		'Q':{'list':[540112]}
	},
	'L':{
		'K':{
			'X':{'list':[441510]}
		},
		'M':{
			'X':{'list':[330603]}
		},
		'X':{'list':[101607,711003,711205]},
		'Y':{
			'Z':{'list':[340905]}
		},
		'Z':{'list':[202117]}
	},
	'M':{
		'G':{'list':[520000]},
		'L':{
			'X':{'list':[330617]}
		},
		'Q':{'list':[310101,520806]},
		'X':{'list':[210403,330104,330510]}
	},
	'N':{
		'list':[210100],
		'X':{'list':[321011]}
	},
	'P':{
		'list':[110500],
		'N':{
			'C':{'list':[220605]}
		},
		'Q':{'list':[620903]},
		'X':{'list':[210306,510408]},
		'Z':{'list':[220602]}
	},
	'Q':{
		'list':[202104],
		'D':{
			'Q':{'list':[330500]}
		},
		'Q':{'list':[100602]},
		'X':{'list':[511015,420805,430405,330501]}
	},
	'R':{
		'X':{'list':[330507]}
	},
	'S':{
		'Q':{'list':[201503,510216,600403]},
		'X':{'list':[430207]}
	},
	'T':{
		'list':[120500],
		'Z':{'list':[202108]}
	},
	'W':{
		'X':{'list':[530809]}
	},
	'X':{
		'list':[201210,401107,721003,410000],
		'Q':{'list':[321102,160202]},
		'X':{'list':[710807,720108,321908]}
	},
	'Y':{
		'list':[710800],
		'Q':{'list':[720508]},
		'X':{'list':[310306,721204,141203]}
	},
	'Z':{
		'S':{
			'Q':{'list':[600911]}
		},
		'X':{'list':[701004,710811,430410]}
	},
},
'O':{
	'H':{
		'Q':{'list':[161009]}
	},
},
'P':{
	'A':{
		'X':{'list':[310703,420401,321406,160305]}
	},
	'B':{
		'X':{'list':[211204,310202,340710]}
	},
	'C':{
		'Q':{'list':[400202]},
		'X':{'list':[110508,320304,430705]},
		'Z':{'list':[701407]}
	},
	'D':{
		'list':[141003],
		'S':{'list':[710900]},
		'X':{
			'list':[310203,531004],
			'Q':{'list':[150106]}
		},
	},
	'E':{
		'X':{'list':[341209]}
	},
	'F':{
		'Q':{'list':[600114]}
	},
	'G':{
		'Q':{'list':[500116]},
		'X':{'list':[210309,321010,530802]}
	},
	'H':{
		'list':[160406],
		'X':{'list':[110903]}
	},
	'J':{
		'list':[621200],
		'Q':{'list':[101005,200701,120710]},
		'X':{'list':[721107,320106,160304]}
	},
	'K':{
		'Q':{'list':[120107]}
	},
	'L':{
		'list':[401000,141504],
		'D':{'list':[620602]},
		'Q':{'list':[530702,340113]},
		'X':{'list':[210703,410303,430204,530904,330201]}
	},
	'N':{
		'list':[200805],
		'X':{'list':[110404,210604]}
	},
	'Q':{
		'Q':{'list':[711509]},
		'X':{'list':[510306]}
	},
	'S':{
		'list':[610409],
		'Q':{'list':[620301]},
		'X':{'list':[300115,510104,621204,321203,321910,531108,440804]}
	},
	'T':{
		'list':[110600],
		'Q':{'list':[201903,150113,161102]},
		'X':{'list':[110203,310606]}
	},
	'W':{
		'X':{'list':[321308]}
	},
	'X':{
		'list':[210407,310404,121005,130700,320108,530504],
		'X':{'list':[511006,321703]}
	},
	'Y':{
		'list':[711000],
		'X':{'list':[201006,711006,711707,130804,410205,140405,140104,140904,530403,161006]}
	},
	'Z':{
		'list':[121011,320103],
		'H':{'list':[321600]},
		'X':{'list':[130602]}
	},
},
'Q':{
	'A':{
		'list':[510914],
		'X':{'list':[401204,601106,610704]}
	},
	'B':{
		'J':{
			'Q':{'list':[320113]}
		},
		'Q':{'list':[211202,710303]},
		'X':{'list':[341306]}
	},
	'C':{
		'Q':{'list':[100401,201101,401201]},
		'X':{'list':[401102,700404,320705]}
	},
	'D':{
		'list':[120505,141000],
		'N':{
			'Z':{'list':[310500]}
		},
		'Q':{'list':[510114,511001,511101,430801]},
		'X':{'list':[720503]}
	},
	'F':{
		'list':[140603],
		'X':{'list':[711002]}
	},
	'G':{
		'Q':{'list':[110709]},
		'X':{'list':[601107,610702]}
	},
	'H':{
		'list':[420000,220500],
		'D':{'list':[510800]},
		'M':{
			'Q':{'list':[620804]}
		},
		'Q':{'list':[120301,120111,621302]},
		'X':{'list':[511004,140406,440306]}
	},
	'J':{
		'list':[341100],
		'Q':{'list':[300137,201208,600609,160702,300135]},
		'X':{'list':[100604,431002,330708,341609]}
	},
	'K':{
		'Q':{'list':[700111]}
	},
	'L':{
		'list':[320102],
		'H':{
			'Q':{'list':[400102]}
		},
		'Q':{'list':[341101]},
		'X':{'list':[110809,310704,510804,420302]}
	},
	'M':{
		'L':{
			'X':{'list':[420806]}
		},
		'X':{'list':[101107,440505,150119]}
	},
	'N':{
		'Q':{'list':[211201]},
		'X':{'list':[130309]},
		'Z':{'list':[310600]}
	},
	'P':{
		'Q':{'list':[120304,150103]}
	},
	'Q':{
		'H':{
			'E':{'list':[600900]}
		},
	},
	'S':{
		'H':{
			'Q':{'list':[130105]},
			'X':{'list':[520108,430308]}
		},
		'Q':{'list':[700108,220103,121007,620204,520303]},
		'X':{'list':[100206,401203,711705,130808,321206,530302,330105,330707]},
		'Y':{
			'Q':{'list':[120203]}
		},
		'Z':{'list':[200309]}
	},
	'T':{
		'H':{'list':[601000]},
		'X':{'list':[410404,440606,160502]},
		'Z':{'list':[200311]}
	},
	'W':{
		'X':{'list':[530516]}
	},
	'X':{
		'list':[510413,510507,710305,710505,320506,141502,430809,530404,531103],
		'N':{
			'Z':{'list':[310700]}
		},
		'Q':{'list':[210714,210111,510115,511018,511116,120106]},
		'X':{'list':[201106,310303,510905,530104]},
		'Z':{'list':[200325]}
	},
	'Y':{
		'list':[201100,401100,710402],
		'A':{
			'X':{'list':[510204]}
		},
		'P':{
			'Q':{'list':[130103]}
		},
		'Q':{'list':[130412,320118]},
		'X':{'list':[100704,510218,721209,620707,140408,430304,531102,160507,220616]}
	},
	'Z':{
		'list':[110700,211200,310110,141306,160700],
		'H':{
			'Q':{'list':[601003]}
		},
		'X':{'list':[210709,510502]}
	},
},
'R':{
	'A':{
		'list':[161002],
		'X':{'list':[211103]}
	},
	'B':{
		'X':{'list':[330609]}
	},
	'C':{
		'list':[130612,141403],
		'Q':{'list':[200801,140611]},
		'X':{'list':[300121,510214,720304,530903]}
	},
	'D':{
		'X':{'list':[120504]}
	},
	'E':{
		'G':{
			'X':{'list':[320202]}
		},
	},
	'G':{'list':[120506]},
	'H':{
		'list':[310914],
		'L':{
			'Q':{'list':[600203]}
		},
		'Q':{'list':[321603]},
		'X':{'list':[201206,601208]}
	},
	'J':{
		'list':[130302],
		'X':{'list':[310505]}
	},
	'K':{
		'Z':{
			'list':[330601],
			'D':{
				'Q':{'list':[330600]}
			},
		},
	},
	'L':{'list':[340401]},
	'N':{
		'X':{'list':[711703]}
	},
	'P':{
		'X':{'list':[200203]}
	},
	'Q':{
		'list':[510403],
		'X':{'list':[440504]}
	},
	'S':{
		'list':[141404],
		'M':{
			'Z':{'list':[211102]}
		},
		'X':{'list':[321202]}
	},
	'T':{
		'X':{'list':[320204,330204]}
	},
	'X':{'list':[211402,511012,322005]},
	'Y':{
		'X':{'list':[510606,710705]},
		'Y':{
			'Z':{'list':[201204]}
		},
	},
	'Z':{
		'list':[710910,141100],
		'Q':{'list':[121302]}
	},
},
'S':{
	'B':{
		'Q':{'list':[600113,141011]},
		'X':{
			'list':[400604,310514,600408,340309]
			,
			'Q':{'list':[620115]}
		},
		'Z':{'list':[220503]}
	},
	'C':{
		'list':[600103,320000],
		'Q':{'list':[200401,710302,120601,620704,530701,160101]},
		'X':{'list':[101205,110509,310403,711505,711708,130303,130405,530807,441007,160504]},
		'Z':{'list':[220608]}
	},
	'D':{
		'list':[140000],
		'Q':{'list':[200403]},
		'X':{'list':[401406,310612,720709,521008,320806,431006,340202]}
	},
	'E':{
		'T':{
			'Q':{'list':[600201]}
		},
	},
	'F':{
		'list':[320405],
		'H':{'list':[600804]},
		'Q':{'list':[721403,141010]},
		'T':{
			'Q':{'list':[601203]},
			'Z':{'list':[701404]}
		},
		'X':{'list':[720602,441011,341611]}
	},
	'G':{
		'list':[201200,141304],
		'L':{
			'Q':{'list':[601303]}
		},
		'Q':{'list':[720510,520304]},
		'X':{'list':[131007,330602]}
	},
	'H':{
		'list':[202008,510710,511019,601100,150000,150100],
		'G':{
			'Q':{'list':[510802]}
		},
		'H':{
			'Z':{
				'Q':{'list':[710509]}
			},
		},
		'K':{
			'Q':{'list':[620608]}
		},
		'Q':{'list':[711501,620112,520104]},
		'X':{'list':[110304,120605,321704,140102,430000]},
		'Y':{
			'X':{'list':[120603]}
		},
		'Z':{'list':[441200,200305,701408]}
	},
	'J':{
		'list':[110714],
		'Q':{'list':[710108,150104]},
		'S':{
			'Q':{'list':[500110]}
		},
		'T':{
			'Q':{'list':[620108]}
		},
		'X':{'list':[211110,330614,340806,341605]},
		'Z':{'list':[510100,202115]}
	},
	'L':{
		'list':[610408,610606,430500],
		'Q':{'list':[510310,710908]},
		'X':{'list':[210103,601104,130704,320109,530607,441010]},
		'Y':{
			'Z':{'list':[340105]}
		},
		'Z':{'list':[200306]}
	},
	'M':{
		'list':[110800,341200],
		'G':{
			'Q':{'list':[440104]}
		},
		'Q':{'list':[110101]},
		'X':{'list':[711100,720208,321805,431011,340104,160905]}
	},
	'N':{
		'list':[321700],
		'D':{
			'Q':{'list':[330700]}
		},
		'Q':{'list':[141001]},
		'T':{
			'Y':{
				'Q':{'list':[521208]}
			},
			'Z':{
				'Q':{'list':[521209]}
			},
		},
		'X':{'list':[110405,401402,310806,510409,720704,121003,430504]}
	},
	'P':{
		'list':[610600],
		'B':{
			'Q':{'list':[300125]}
		},
		'T':{
			'Q':{'list':[410501]}
		},
		'X':{'list':[510206,711702,721207,320210,340708]},
		'Z':{'list':[200308]}
	},
	'Q':{
		'list':[711200,120600],
		'Q':{'list':[300131,510301,720701,321401,202101]},
		'X':{'list':[310807,710805,711606,320807,430208]}
	},
	'R':{
		'list':[130800],
		'X':{'list':[130811,330709]}
	},
	'S':{
		'list':[110703,700706,720805],
		'Q':{'list':[100103,200404,700701,520510]},
		'X':{'list':[100204,210503,310513,711607,140605,441402,161104]}
	},
	'T':{
		'list':[201300,110713],
		'M':{
			'Z':{'list':[310802]}
		},
		'Q':{'list':[620401,141705]},
		'X':{'list':[100703,321303]},
		'Z':{
			'list':[200326],
			'Q':{'list':[621201]}
		},
	},
	'W':{
		'list':[110504,201400],
		'Q':{'list':[320910]},
		'X':{'list':[600504,441304]},
		'Z':{'list':[202123]}
	},
	'X':{
		'list':[101104,101203,101405,110805,510511,710706,711103,711204,530000,330504,160800],
		'Q':{'list':[720310]},
		'X':{'list':[100904,110506,201207,201905,160802]},
		'Z':{'list':[202120,202121]}
	},
	'Y':{
		'list':[700800,220200,720700,610700,620100,160805],
		'B':{
			'K':{
				'Q':{'list':[440102]}
			},
		},
		'Q':{'list':[500105,110811,710408,711202,610105,120602]},
		'S':{'list':[601200]},
		'X':{'list':[310910,700604,511109,720707,120604,121106,130314,430505,430811,530406,530703,440204,160505]}
	},
	'Z':{
		'list':[101400,201500,700708,700900,600102,120700,530700,160806],
		'Q':{'list':[400601,320701,320901,321501,140109,140601,141701,430501]},
		'S':{
			'list':[410300],
			'Q':{'list':[101502]}
		},
		'W':{
			'Q':{'list':[521002]}
		},
		'X':{'list':[300118,510111,721304,620904,330505,341104]}
	},
},
'T':{
	'A':{
		'list':[141200],
		'Q':{'list':[110105]},
		'X':{'list':[620205]}
	},
	'B':{
		'Q':{'list':[610201]},
		'X':{'list':[710802,430312]}
	},
	'C':{
		'list':[100211,120711,430600,441301],
		'D':{
			'Q':{'list':[441300]}
		},
		'Q':{'list':[510601,320501]},
		'X':{'list':[701203,140908,340203]}
	},
	'D':{
		'D':{
			'Z':{'list':[720402]}
		},
		'Q':{'list':[610602,620201]},
		'X':{'list':[210310,210406,420502]}
	},
	'E':{
		'X':{'list':[210809]},
		'Z':{
			'Q':{'list':[141704]}
		},
	},
	'F':{
		'Q':{'list':[600914]},
		'X':{'list':[700409]}
	},
	'G':{
		'S':{
			'Q':{'list':[101501]}
		},
		'X':{'list':[131004,430709,530405]}
	},
	'H':{
		'list':[610800],
		'K':{
			'Z':{'list':[701412]}
		},
		'Q':{'list':[200108,121101,621003]},
		'X':{'list':[100205,100805,510903,710804,600302,600106,610803,130406,341504]}
	},
	'J':{
		'list':[600602,540000,540100],
		'A':{
			'Q':{'list':[101002]}
		},
		'Q':{'list':[110212]},
		'X':{'list':[310507,721004,420705,320302]}
	},
	'K':{
		'S':{
			'X':{'list':[441502]}
		},
		'T':{
			'X':{'list':[520106]}
		},
		'X':{
			'list':[711603],
			'X':{'list':[441403]}
		},
	},
	'L':{
		'list':[101500,601317,621300,520800],
		'F':{
			'list':[441401],
			'D':{
				'Q':{'list':[441400]}
			},
		},
		'X':{'list':[101504,300133,210303,600907,621303,531109,441305,160105]}
	},
	'M':{
		'list':[610902],
		'T':{
			'Z':{
				'Q':{'list':[520105]}
			},
		},
		'Z':{'list':[220508]}
	},
	'N':{
		'list':[610204],
		'Q':{'list':[120201]},
		'X':{'list':[300134,110803]}
	},
	'P':{
		'Q':{'list':[620803]},
		'S':{
			'Q':{'list':[521205]}
		},
	},
	'Q':{
		'Q':{'list':[140107]},
		'X':{'list':[711005,521106,321806]}
	},
	'R':{
		'list':[310801],
		'D':{
			'Q':{'list':[310800]}
		},
		'X':{'list':[420601]}
	},
	'S':{
		'list':[200704,401200,510900],
		'G':{
			'Q':{'list':[210203]}
		},
		'K':{
			'E':{
				'G':{'list':[441012]}
			},
		},
		'Q':{'list':[700504,601002,141201,440101]},
		'X':{'list':[701205,121004,161003]}
	},
	'T':{
		'H':{
			'Q':{'list':[440105]}
		},
		'Q':{'list':[210603]},
		'X':{'list':[160906]}
	},
	'W':{
		'list':[810000,810100,810101],
		'H':{
			'Q':{'list':[601307]}
		},
		'X':{'list':[400302]}
	},
	'X':{
		'list':[211305,510223,120805,160407],
		'Q':{'list':[101101,720102,610601,620202,620109]},
		'X':{'list':[710504,410403]},
		'Z':{'list':[200328]}
	},
	'Y':{
		'list':[530100],
		'Q':{'list':[721404,520307,220213]},
		'X':{'list':[210311,710206,600604,720207,610203]},
		'Z':{'list':[220208,220509]}
	},
	'Z':{
		'list':[100607,120507,120800,141706,160900],
		'H':{
			'Q':{'list':[621105]}
		},
		'Q':{'list':[500106]},
		'X':{'list':[401304,310510,310911,530206]},
		'Z':{'list':[202124]}
	},
},
'W':{
	'A':{
		'list':[510519],
		'X':{'list':[310608,510704,130404]}
	},
	'B':{
		'L':{
			'Q':{'list':[530106]}
		},
		'Q':{'list':[711411,430301]},
		'X':{'list':[431003]}
	},
	'C':{
		'list':[201909,600119,220300],
		'Q':{'list':[300101,700109,710801,141301,430812,160301,200301,200304]},
		'S':{'list':[220301]},
		'X':{'list':[310907,510311,720107,520109,320201,320704,140403,161004]}
	},
	'D':{
		'list':[141402],
		'L':{
			'C':{'list':[600506]}
		},
		'Q':{'list':[400801,310107,710909,711301,520903]},
		'X':{'list':[510212,140204,340302]}
	},
	'E':{
		'H':{
			'Q':{'list':[440904]}
		},
		'I':{
			'S':{
				'X':{'list':[140610]}
			},
		},
	},
	'F':{
		'list':[141300],
		'D':{'list':[620603]},
		'Q':{'list':[710201]},
		'T':{
			'J':{
				'Z':{'list':[701304]}
			},
		},
	},
	'G':{
		'list':[710902,720712],
		'S':{
			'Q':{'list':[202105]}
		},
		'X':{'list':[430802]}
	},
	'H':{
		'list':[101600,700100,711402,520900,141400],
		'Q':{'list':[620703,320116,340101]},
		'X':{'list':[100306,101605,201005]},
		'Z':{'list':[701403]}
	},
	'J':{
		'list':[120702],
		'G':{
			'Q':{'list':[701312]}
		},
		'Q':{'list':[201201,120205,320111]},
		'X':{'list':[100203,510103]}
	},
	'K':{
		'X':{'list':[601109]}
	},
	'L':{
		'list':[160908],
		'C':{
			'B':{'list':[521000]}
		},
		'D':{
			'Z':{'list':[200322]}
		},
		'H':{
			'T':{'list':[521101]}
		},
		'M':{
			'Q':{
				'list':[440100],
				'X':{'list':[440108]}
			},
		},
		'Q':{'list':[710812,720201,130104]},
		'T':{
			'H':{
				'Q':{'list':[520406]}
			},
			'Q':{
				'Q':{'list':[520404]}
			},
			'Z':{
				'Q':{'list':[520405]}
			},
		},
		'X':{'list':[300105,420703,141103,440503]},
		'Y':{
			'Q':{'list':[721302]}
		},
		'Z':{'list':[220611]}
	},
	'M':{
		'H':{
			'Q':{'list':[601308]}
		},
		'X':{'list':[210106,310706]}
	},
	'N':{
		'list':[430700],
		'T':{
			'Q':{'list':[520504]}
		},
		'X':{'list':[310307,130609,130803]}
	},
	'P':{
		'X':{'list':[110305]}
	},
	'Q':{
		'Q':{'list':[540102]},
		'X':{'list':[510407,510607,511105,610907,430907,440403,441104]},
		'Z':{'list':[220502]}
	},
	'R':{
		'X':{'list':[530911]}
	},
	'S':{
		'list':[441302],
		'Q':{'list':[300130,621102,520607]},
		'T':{
			'Q':{'list':[310810]}
		},
		'X':{'list':[300111,401206,710503,320603,140606,530612,440202,340506,341301]},
		'Z':{'list':[341300,400702]}
	},
	'T':{
		'Q':{
			'Q':{'list':[320909]}
		},
		'X':{'list':[530812]}
	},
	'U':{
		'S':{
			'X':{'list':[440207]}
		},
	},
	'W':{
		'list':[401300],
		'X':{'list':[100503]}
	},
	'X':{
		'list':[400803,700410,510503,511005,710404,120900],
		'Q':{'list':[211301,160201,120910]},
		'X':{'list':[300119,211004,530910,531104,340603,341602]}
	},
	'Y':{
		'list':[320507],
		'L':{
			'Q':{'list':[601305]}
		},
		'Q':{'list':[601309,430601,430109]},
		'S':{'list':[110503]},
		'X':{'list':[100402,201205,400304,510608,710604,130802,520402,321503,160303]}
	},
	'Z':{
		'list':[211300,410400,161000],
		'Q':{'list':[120707]},
		'S':{
			'list':[220400],
			'S':{'list':[220401]}
		},
		'X':{'list':[710405,131008,530806]}
	},
},
'X':{
	'A':{
		'list':[430100],
		'M':{'list':[521100]},
		'Q':{'list':[110106,701201,600404,600807,610502]},
		'X':{'list':[210708,710708]}
	},
	'B':{
		'Q':{'list':[211001,120204]},
		'X':{'list':[620706]}
	},
	'C':{
		'list':[101700,711300,711610,620906,321001],
		'Q':{'list':[500115,110901,701001,120706,520101,141702,430101,160112,160401]},
		'X':{'list':[211002,701102,710806,711304,711710,320803,321408,341303,160803]},
		'Z':{
			'list':[400703,220613],
			'Q':{'list':[620106]}
		},
	},
	'D':{
		'Q':{'list':[130702,320112,530101]},
		'X':{'list':[321006,340102]}
	},
	'E':{
		'X':{'list':[700205]}
	},
	'F':{
		'list':[701000],
		'Q':{'list':[401101,210701,600116,620701,530801]},
		'X':{'list':[201203,310103,700206,130316,621304,530514]}
	},
	'G':{
		'list':[701100,820000,820100,820101],
		'L':{
			'L':{
				'X':{'list':[340601]}
			},
		},
		'Q':{'list':[400103,710714,120108,620609]},
		'X':{'list':[130306,130408]},
		'Z':{'list':[200312]}
	},
	'H':{
		'list':[120803],
		'D':{
			'Z':{'list':[720405]}
		},
		'L':{
			'Q':{'list':[530108]}
		},
		'Q':{'list':[200703,310105,510401,510116,511115,710901,130102,620302,620805,521204,150116,160109]},
		'X':{'list':[400408,400806,510706,511008,511113,711608,720603,521007,420406,420504,320503,440205]},
		'Y':{
			'Q':{'list':[511114]}
		},
	},
	'I':{
		'X':{'list':[711510]}
	},
	'J':{
		'list':[510107,440000],
		'J':{
			'Q':{'list':[101003]}
		},
		'X':{'list':[130409,130107,410202,320207,320105,140404,530908,160907]}
	},
	'K':{
		'X':{'list':[600503]}
	},
	'L':{
		'list':[510110],
		'G':{
			'L':{
				'M':{'list':[521200]}
			},
		},
		'H':{
			'T':{'list':[521211]},
			'Z':{'list':[701406]}
		},
		'Q':{'list':[110301,700503,701301,601314]},
		'T':{
			'Q':{'list':[621202]}
		},
		'X':{'list':[210302,510307,320810]},
		'Z':{'list':[202111]}
	},
	'M':{
		'list':[110100,710103,620113],
		'W':{
			'Z':{'list':[341210]}
		},
	},
	'N':{
		'list':[201008,701200,420100],
		'Q':{'list':[210101,701101]},
		'X':{'list':[101105,720703,530508]}
	},
	'P':{
		'list':[430814],
		'Q':{'list':[120402]},
		'X':{'list':[110402,711709,720408,341508]}
	},
	'Q':{
		'list':[321602,202103],
		'Q':{'list':[200201,601312,620802,410101,540105]}
	},
	'R':{
		'Q':{'list':[530208]},
		'X':{'list':[310702]}
	},
	'S':{
		'B':{
			'N':{'list':[341400]}
		},
		'Q':{'list':[100902,201902,210715,510201,600406,120904,621402,440103,340111,160107]},
		'S':{
			'Q':{'list':[700502]}
		},
		'X':{'list':[300117,310903,700405,701307,510221,720708,121103,130608,160605]}
	},
	'T':{
		'list':[701400,511000,720800,141205],
		'M':{
			'X':{'list':[330611]}
		},
		'X':{'list':[510122,511017,720803,721202]}
	},
	'U':{
		'C':{
			'X':{'list':[711302]}
		},
	},
	'W':{
		'list':[341109],
		'Q':{'list':[101603,500113,120101,521206]},
		'X':{'list':[201906,310102,710407,130304,321902]}
	},
	'X':{
		'list':[101403,510208,510406,711400,711506,720804,140703,530506,530610,530905],
		'Q':{'list':[310201,601001,410102]},
		'T':{
			'Q':{'list':[210109]}
		},
		'X':{'list':[201602,710809,711408,430407]},
		'Z':{'list':[720900]}
	},
	'Y':{
		'list':[200906,310701,711500,121002,130900,430800,530602],
		'Q':{'list':[110604,701003,600401,600610,220101,130611,520706]},
		'X':{'list':[110605,211405,710803,711208,721106,120307,620206,321106,430202,430804,530407,531110,441504,340510]}
	},
	'Z':{
		'list':[710102,121000,530800,330000],
		'Q':{'list':[101701,201801,700113,130801,520707,160402]},
		'X':{'list':[211003,130605]}
	},
},
'Y':{
	'A':{
		'list':[110812,321800,430900],
		'C':{
			'X':{'list':[430911]}
		},
		'Q':{'list':[101202]},
		'X':{'list':[201604,701308,600908,340306]}
	},
	'B':{
		'list':[321900],
		'C':{
			'Z':{'list':[610900]}
		},
		'Q':{'list':[300139,620501,320702]},
		'S':{
			'Q':{'list':[520511]}
		},
		'X':{'list':[321605,321909,340511]}
	},
	'C':{
		'list':[300112,201704,701009,701105,701300,711209,601300,121100,131000,410100,140411,530900],
		'Q':{'list':[300128,200501,201601,710602,711701,601301,321801,141703,530401,160801]},
		'X':{'list':[110706,400502,710702,711207,410402,320602,140506,430903,530303,530515,441006]},
		'Z':{'list':[220207,220209]}
	},
	'D':{
		'list':[201107,701303],
		'Q':{'list':[100802,710203,721301,121102,530501]},
		'X':{'list':[110303,201703,400106,130307,330605,340804]}
	},
	'F':{
		'list':[201600],
		'Q':{'list':[211109,720511]},
		'X':{'list':[210707,130407,131006]}
	},
	'G':{
		'X':{'list':[130805,140702,530207]}
	},
	'H':{
		'Q':{'list':[100303,100101,210202,510415,510118,710601,600601,601315,720105,720801,131101,620105,530901,160106]},
		'T':{
			'Q':{'list':[120105]}
		},
		'X':{'list':[310803,130205,530505,160506,160904]}
	},
	'I':{
		'Y':{'list':[721000]}
	},
	'J':{
		'list':[201700,721006,610901,530902],
		'H':{
			'L':{
				'Q':{'list':[520608]}
			},
		},
		'Q':{'list':[100201,210301,322101]},
		'S':{
			'X':{'list':[441009]}
		},
		'X':{'list':[400904,310805,711405,610405,131102,320814,321803,430604,340404,341509,341608,161007]},
		'Z':{'list':[220506]}
	},
	'K':{
		'list':[621400,160309],
		'S':{'list':[520704]}
	},
	'L':{
		'list':[211400,431000],
		'Q':{'list':[701309,720103,121010,430107,430813]},
		'W':{
			'Z':{'list':[701409]}
		},
		'X':{'list':[711303,600111,720410,721408,321407,321903,340504,340106,340902,341603]},
		'Z':{'list':[441500,220606]}
	},
	'M':{
		'list':[400606,711105],
		'Q':{'list':[600809]},
		'X':{'list':[701104,441306,340303,341506,220615]}
	},
	'N':{
		'list':[441501,340000],
		'Q':{'list':[210107]},
		'X':{'list':[201603,510508,410104,140909,441508]}
	},
	'P':{
		'list':[530814],
		'D':{
			'Z':{'list':[310808]}
		},
		'H':{
			'X':{'list':[441004]}
		},
		'Q':{'list':[110501,150110]},
		'X':{'list':[340505]}
	},
	'Q':{
		'list':[531000],
		'Q':{'list':[100803,101401,520103]},
		'X':{'list':[310904,510707,530103,530906,440506]},
		'Z':{'list':[400701]}
	},
	'R':{
		'X':{'list':[340304]}
	},
	'S':{
		'list':[710715,610102],
		'H':{
			'X':{'list':[430807]}
		},
		'Q':{'list':[101303,210713,130901]},
		'X':{'list':[100807,201103,210712,700406,510410,510105,600105,720907,130809,420801,321405,140907,530410,340903,341302,341606]},
		'Y':{
			'Z':{'list':[510309]}
		},
		'Z':{'list':[420800]}
	},
	'T':{
		'list':[131100,141500],
		'Q':{'list':[201506,701310,720802,322004,430602,430108]},
		'X':{'list':[110204,510904,610604,321304,140609,440807]}
	},
	'U':{
		'Y':{
			'X':{'list':[300102]}
		},
	},
	'W':{
		'list':[160307],
		'X':{'list':[440703]}
	},
	'X':{
		'list':[101106,700803,510203,511108,710905,721406,120908,621005,430408,530704,531005,340803,341500,540116],
		'Q':{'list':[200110,721102,321302]},
		'X':{'list':[100202,110806,110909,201702,700505,700804,720307,130402,130607,321004,140203]}
	},
	'Y':{
		'list':[710104,721100,160603],
		'L':{
			'Q':{'list':[721101]}
		},
		'Q':{'list':[310109,431001]},
		'X':{'list':[300116,511107,710704,711406,601206,721104,130806,321015,141608,530705,340705]}
	},
	'Z':{
		'list':[210811,711305,721200,121200,121205,121305,140602],
		'Q':{'list':[100801,211401,131001,621301,410201,430603,530109,160606,220210]},
		'X':{'list':[400108,720308,430912]},
		'Z':{'list':[220609]}
	},
},
'Z':{
	'A':{
		'D':{
			'X':{'list':[420802]}
		},
		'Q':{'list':[510101,620503,430105]},
		'X':{'list':[110907,310909,430506]}
	},
	'B':{
		'list':[141600],
		'Q':{'list':[150112]},
		'X':{'list':[511112,610304,430403,330606]}
	},
	'C':{
		'list':[200102,140612,141305],
		'K':{
			'Z':{'list':[701414]}
		},
		'Q':{'list':[141601]},
		'U':{
			'Q':{'list':[141605]}
		},
		'X':{'list':[711206]},
		'Z':{'list':[701401]}
	},
	'D':{
		'list':[601102],
		'Q':{'list':[141602]},
		'X':{'list':[510120,420804,141508,430908,330202]}
	},
	'F':{
		'Q':{'list':[141501]},
		'X':{'list':[100105,310705,720411]}
	},
	'G':{
		'list':[711306,322000],
		'E':{
			'Q':{'list':[520603]}
		},
		'Q':{'list':[130301]},
		'X':{'list':[701306,330304]},
		'Z':{'list':[701410]}
	},
	'H':{
		'list':[201800,510902,620610],
		'Q':{'list':[710907,720501,160607]},
		'X':{'list':[110505,510102,620604,140205]}
	},
	'J':{
		'list':[201900,701313,121300,160000,160804],
		'C':{
			'X':{'list':[401207]}
		},
		'D':{
			'Z':{'list':[720404]}
		},
		'G':{'list':[120704]},
		'J':{'list':[721300]},
		'K':{'list':[511100]},
		'Q':{'list':[201209]},
		'X':{'list':[200502,310305,320402,321007]}
	},
	'K':{
		'list':[711600],
		'X':{'list':[420603,340805]}
	},
	'L':{
		'list':[110213],
		'J':{
			'Q':{'list':[322001]}
		},
		'Q':{'list':[710603,120202,521202]},
		'T':{
			'list':[520703],
			'Q':{'list':[520807,521105]}
		},
		'X':{'list':[401006,511103,610202,610703]}
	},
	'M':{
		'D':{'list':[711700]},
		'T':{
			'Z':{'list':[200320]}
		},
		'X':{'list':[710106]}
	},
	'N':{
		'Q':{'list':[150115]},
		'X':{'list':[110406,400403,401106,310204,410502,321906,330711]}
	},
	'P':{
		'list':[110307],
		'X':{'list':[110908,210902,710808,140207,430203,441008]}
	},
	'Q':{
		'list':[202000,140110],
		'Q':{'list':[621401,140105]},
		'X':{'list':[400404,510609,530409]}
	},
	'R':{
		'X':{'list':[110407]}
	},
	'S':{
		'list':[202100,131002,161100],
		'H':{
			'X':{'list':[430507]}
		},
		'Q':{'list':[300136,310401,721201,130502,620601]},
		'X':{'list':[210903,310604,700805,720106,441503]},
		'Z':{'list':[202110]}
	},
	'T':{
		'list':[341600],
		'X':{'list':[110302,110906,321306]},
		'Z':{'list':[200318]}
	},
	'W':{
		'list':[410500],
		'Q':{'list':[700802]},
		'X':{'list':[620807,430805]}
	},
	'X':{
		'list':[300104,400306,700605,510106,720311],
		'B':{
			'Q':{'list':[521203]}
		},
		'Q':{'list':[720509,620502]},
		'X':{'list':[700806,130203,341604,160204]}
	},
	'Y':{
		'list':[401400,310900,701008,322100,141503],
		'Q':{'list':[710101,721001,341601]},
		'T':{
			'J':{
				'Z':{'list':[701305]}
			},
		},
		'X':{'list':[100207,401108,210704,310206,310512,310912,711403,711706,600207,430206,530202,530604,341108,341205]},
		'Z':{'list':[220504]}
	},
	'Z':{
		'list':[110900,510209,710100,721400,141700,531100],
		'I':{
			'X':{'list':[531105]}
		},
		'Q':{'list':[211303,710410]},
		'X':{'list':[600206,721405,521010,321504,430103,430910,431012,530305]}
	},
},
};

//常用城市显示处理
function getLevelCityName(cityStr){
	var result ;
	var citys = cityStr.split('-');
	var citysLength = citys.length;
	if(citysLength == 1){
		result = citys[0];
	}else if(citysLength == 2){
		result = citys[1];
	}else{
		result = citys[3];
	}
	return result;
}


var CityJson =[{key:"anhui",value:"100000"},{key:"anqing",value:"100200"},{key:"daguanqu",value:"100210"},{key:"huainingxian",value:"100208"},{key:"qianshanxian",value:"100206"},{key:"susongxian",value:"100204"},{key:"tongcheng",value:"100211"},{key:"taihuxian",value:"100205"},{key:"wangjiangxian",value:"100203"},{key:"yingjiangqu",value:"100201"},{key:"yuexixian",value:"100202"},{key:"zuoyangxian",value:"100207"},{key:"bangbu",value:"100300"},{key:"bangshanqu",value:"100302"},{key:"guzhenxian",value:"100307"},{key:"huaishangqu",value:"100304"},{key:"huaiyuanxian",value:"100305"},{key:"longzihuqu",value:"100301"},{key:"wuhexian",value:"100306"},{key:"yuhuiqu",value:"100303"},{key:"zuozhou",value:"100400"},{key:"lixinxian",value:"100404"},{key:"mengchengxian",value:"100403"},{key:"zuochengqu",value:"100401"},{key:"woyangxian",value:"100402"},{key:"chaohu",value:"100500"},{key:"chuzhou",value:"100600"},{key:"dingyuanxian",value:"100605"},{key:"fengyangxian",value:"100606"},{key:"laianxian",value:"100603"},{key:"langzuoqu",value:"100601"},{key:"mingguang",value:"100608"},{key:"nanzuoqu",value:"100602"},{key:"quanjiaoxian",value:"100604"},{key:"tianchang",value:"100607"},{key:"hanshanxian",value:"100504"},{key:"hexian",value:"100505"},{key:"juchaoqu",value:"100501"},{key:"lujiangxian",value:"100502"},{key:"wuweixian",value:"100503"},{key:"chizhou",value:"100700"},{key:"dongzhixian",value:"100702"},{key:"guichiqu",value:"100701"},{key:"qingyangxian",value:"100704"},{key:"shitaixian",value:"100703"},{key:"fuyang",value:"100800"},{key:"funanxian",value:"100806"},{key:"jieshou",value:"100808"},{key:"linquanxian",value:"100804"},{key:"taihexian",value:"100805"},{key:"zuodongqu",value:"100802"},{key:"zuoquanqu",value:"100803"},{key:"zuoshangxian",value:"100807"},{key:"zuozhouqu",value:"100801"},{key:"huaibei",value:"100900"},{key:"dujiqu",value:"100901"},{key:"lieshanqu",value:"100903"},{key:"zuoxixian",value:"100904"},{key:"xiangshanqu",value:"100902"},{key:"hefei",value:"100100"},{key:"baohequ",value:"100104"},{key:"feidongxian",value:"100106"},{key:"feixixian",value:"100107"},{key:"luyangqu",value:"100102"},{key:"shushanqu",value:"100103"},{key:"yaohaiqu",value:"100101"},{key:"changfengxian",value:"100105"},{key:"huainan",value:"101000"},{key:"bagongshanqu",value:"101004"},{key:"datongqu",value:"101001"},{key:"fengtaixian",value:"101006"},{key:"panjiqu",value:"101005"},{key:"tianjiazuoqu",value:"101002"},{key:"xiejiajiqu",value:"101003"},{key:"huangshan",value:"101100"},{key:"huangshanqu",value:"101102"},{key:"huizhouqu",value:"101103"},{key:"qimenxian",value:"101107"},{key:"zuoxian",value:"101104"},{key:"tunxiqu",value:"101101"},{key:"xiuningxian",value:"101105"},{key:"zuoxian",value:"101106"},{key:"liuan",value:"101200"},{key:"huoqiuxian",value:"101204"},{key:"huoshanxian",value:"101207"},{key:"jinanqu",value:"101201"},{key:"jinzhaixian",value:"101206"},{key:"shuchengxian",value:"101205"},{key:"shouxian",value:"101203"},{key:"yuanqu",value:"101202"},{key:"maanshan",value:"101300"},{key:"dangtuxian",value:"101304"},{key:"huashanqu",value:"101302"},{key:"jinjiazhuangqu",value:"101301"},{key:"yushanqu",value:"101303"},{key:"suzhou",value:"101400"},{key:"zuoshanxian",value:"101402"},{key:"lingzuoxian",value:"101404"},{key:"zuoxian",value:"101405"},{key:"xiaoxian",value:"101403"},{key:"zuoqiaoqu",value:"101401"},{key:"tongling",value:"101500"},{key:"shizishanqu",value:"101502"},{key:"tongguanshanqu",value:"101501"},{key:"tonglingxian",value:"101504"},{key:"wuhu",value:"101600"},{key:"fanchangxian",value:"101606"},{key:"jinghuqu",value:"101601"},{key:"zuojiangqu",value:"101604"},{key:"matangqu",value:"101602"},{key:"nanlingxian",value:"101607"},{key:"wuhuxian",value:"101605"},{key:"xinwuqu",value:"101603"},{key:"xuancheng",value:"101700"},{key:"guangdexian",value:"101703"},{key:"zuodexian",value:"101706"},{key:"zuoxian",value:"101704"},{key:"jixixian",value:"101705"},{key:"langxixian",value:"101702"},{key:"ningguo",value:"101707"},{key:"xuanzhouqu",value:"101701"},{key:"aomen",value:"800000"},{key:"aomen",value:"800100"},{key:"aomen",value:"800101"},{key:"beijing",value:"500000"},{key:"beijing",value:"500100"},{key:"changpingqu",value:"500104"},{key:"chongwenqu",value:"500114"},{key:"chaoyangqu",value:"500112"},{key:"dongchengqu",value:"500101"},{key:"daxingqu",value:"500103"},{key:"fangshanqu",value:"500107"},{key:"fengtaiqu",value:"500111"},{key:"haidianqu",value:"500109"},{key:"huairouqu",value:"500102"},{key:"mentougouqu",value:"500108"},{key:"pingguqu",value:"500116"},{key:"shijingshanqu",value:"500110"},{key:"shunyiqu",value:"500105"},{key:"tongzhouqu",value:"500106"},{key:"xichengqu",value:"500115"},{key:"xuanwuqu",value:"500113"},{key:"zhongqing",value:"300000"},{key:"zhongqing",value:"300100"},{key:"beizuoqu",value:"300122"},{key:"bananqu",value:"300138"},{key:"zuoshanxian",value:"300120"},{key:"chengkouxian",value:"300108"},{key:"dadukouqu",value:"300127"},{key:"dianjiangxian",value:"300106"},{key:"dazuxian",value:"300132"},{key:"fengduxian",value:"300107"},{key:"fengjiexian",value:"300110"},{key:"fulingqu",value:"300129"},{key:"hechuan",value:"300113"},{key:"jiangbeiqu",value:"300126"},{key:"jiangjin",value:"300114"},{key:"jiulongpoqu",value:"300124"},{key:"kaixian",value:"300103"},{key:"liangpingxian",value:"300109"},{key:"nananqu",value:"300123"},{key:"nanchuan",value:"300140"},{key:"pengshuixian",value:"300115"},{key:"qianjiangqu",value:"300137"},{key:"zuojiangqu",value:"300135"},{key:"rongchangxian",value:"300121"},{key:"shapingbaqu",value:"300125"},{key:"shuangqiaoqu",value:"300131"},{key:"shizhuxian",value:"300118"},{key:"tongliangxian",value:"300133"},{key:"zuonanxian",value:"300134"},{key:"wanzhouqu",value:"300101"},{key:"wulongxian",value:"300105"},{key:"wanshengqu",value:"300130"},{key:"wushanxian",value:"300111"},{key:"wuxixian",value:"300119"},{key:"xiushanxian",value:"300117"},{key:"yubeiqu",value:"300139"},{key:"yongchuan",value:"300112"},{key:"yuzhongqu",value:"300128"},{key:"yunyangxian",value:"300102"},{key:"youyangxian",value:"300116"},{key:"changshouqu",value:"300136"},{key:"zhongxian",value:"300104"},{key:"fujian",value:"110000"},{key:"fuzhou",value:"110200"},{key:"cangshanqu",value:"110211"},{key:"fuqing",value:"110202"},{key:"gulouqu",value:"110201"},{key:"jinanqu",value:"110209"},{key:"lianjiangxian",value:"110207"},{key:"luoyuanxian",value:"110206"},{key:"minhouxian",value:"110208"},{key:"minqingxian",value:"110205"},{key:"maweiqu",value:"110210"},{key:"pingtanxian",value:"110203"},{key:"taijiangqu",value:"110212"},{key:"yongtaixian",value:"110204"},{key:"changle",value:"110213"},{key:"longyan",value:"110300"},{key:"lianchengxian",value:"110306"},{key:"shanghangxian",value:"110304"},{key:"wupingxian",value:"110305"},{key:"xinluoqu",value:"110301"},{key:"yongdingxian",value:"110303"},{key:"zhangping",value:"110307"},{key:"changtingxian",value:"110302"},{key:"ningde",value:"110400"},{key:"fuan",value:"110408"},{key:"fuding",value:"110409"},{key:"gutianxian",value:"110403"},{key:"jiaochengqu",value:"110401"},{key:"pingnanxian",value:"110404"},{key:"shouningxian",value:"110405"},{key:"xiapuxian",value:"110402"},{key:"zhouningxian",value:"110406"},{key:"zuorongxian",value:"110407"},{key:"nanping",value:"110500"},{key:"guangzexian",value:"110507"},{key:"jianzuo",value:"110502"},{key:"jianyang",value:"110510"},{key:"puchengxian",value:"110508"},{key:"shunchangxian",value:"110509"},{key:"shaowu",value:"110504"},{key:"songxixian",value:"110506"},{key:"wuyishan",value:"110503"},{key:"yanpingqu",value:"110501"},{key:"zhenghexian",value:"110505"},{key:"putian",value:"110600"},{key:"chengxiangqu",value:"110601"},{key:"hanjiangqu",value:"110602"},{key:"lichengqu",value:"110603"},{key:"xiuyuqu",value:"110604"},{key:"xianyouxian",value:"110605"},{key:"quanzhou",value:"110700"},{key:"anxixian",value:"110707"},{key:"dehuaxian",value:"110705"},{key:"fengzequ",value:"110711"},{key:"huianxian",value:"110708"},{key:"jinjiang",value:"110702"},{key:"jinmenxian",value:"110704"},{key:"lichengqu",value:"110701"},{key:"luojiangqu",value:"110710"},{key:"nanan",value:"110712"},{key:"quangangqu",value:"110709"},{key:"shishi",value:"110703"},{key:"yongchunxian",value:"110706"},{key:"sanming",value:"110800"},{key:"datianxian",value:"110807"},{key:"jianglexian",value:"110804"},{key:"jianningxian",value:"110802"},{key:"meiliequ",value:"110801"},{key:"mingxixian",value:"110810"},{key:"ninghuaxian",value:"110808"},{key:"qingliuxian",value:"110809"},{key:"shaxian",value:"110805"},{key:"sanyuanqu",value:"110811"},{key:"tainingxian",value:"110803"},{key:"yongan",value:"110812"},{key:"youxixian",value:"110806"},{key:"xiamen",value:"110100"},{key:"haicangqu",value:"110102"},{key:"huliqu",value:"110103"},{key:"jimeiqu",value:"110104"},{key:"simingqu",value:"110101"},{key:"tonganqu",value:"110105"},{key:"xianganqu",value:"110106"},{key:"zhangzhou",value:"110900"},{key:"dongshanxian",value:"110905"},{key:"huaanxian",value:"110902"},{key:"longhai",value:"110911"},{key:"longwenqu",value:"110910"},{key:"nanjingxian",value:"110904"},{key:"pinghexian",value:"110903"},{key:"zuochengqu",value:"110901"},{key:"yunxiaoxian",value:"110909"},{key:"zuoanxian",value:"110907"},{key:"zhangpuxian",value:"110908"},{key:"changtaixian",value:"110906"},{key:"guangdong",value:"200000"},{key:"chaozhou",value:"200200"},{key:"chaoanxian",value:"200202"},{key:"raopingxian",value:"200203"},{key:"xiangqiaoqu",value:"200201"},{key:"dongzuo",value:"200300"},{key:"foshan",value:"200400"},{key:"gaomingqu",value:"200405"},{key:"nanhaiqu",value:"200402"},{key:"zuochengqu",value:"200401"},{key:"shundequ",value:"200403"},{key:"sanshuiqu",value:"200404"},{key:"guangzhou",value:"200100"},{key:"baiyunqu",value:"200106"},{key:"conghua",value:"200112"},{key:"dongshanqu",value:"200101"},{key:"fangcunqu",value:"200107"},{key:"fanzuoqu",value:"200104"},{key:"huaduqu",value:"200103"},{key:"huangpuqu",value:"200105"},{key:"haizhuqu",value:"200109"},{key:"liwanqu",value:"200111"},{key:"tianhequ",value:"200108"},{key:"yuexiuqu",value:"200110"},{key:"zengcheng",value:"200102"},{key:"heyuan",value:"200500"},{key:"dongyuanxian",value:"200506"},{key:"hepingxian",value:"200505"},{key:"longchuanxian",value:"200503"},{key:"lianpingxian",value:"200504"},{key:"yuanchengqu",value:"200501"},{key:"zijinxian",value:"200502"},{key:"huizhou",value:"200600"},{key:"boluoxian",value:"200603"},{key:"huichengqu",value:"200601"},{key:"huidongxian",value:"200604"},{key:"huiyangqu",value:"200602"},{key:"longmenxian",value:"200605"},{key:"jiangmen",value:"200700"},{key:"enping",value:"200707"},{key:"heshan",value:"200706"},{key:"jianghaiqu",value:"200702"},{key:"kaiping",value:"200705"},{key:"pengjiangqu",value:"200701"},{key:"taishan",value:"200704"},{key:"xinhuiqu",value:"200703"},{key:"jieyang",value:"200800"},{key:"huilaixian",value:"200804"},{key:"jiedongxian",value:"200802"},{key:"jiexixian",value:"200803"},{key:"puning",value:"200805"},{key:"zuochengqu",value:"200801"},{key:"maoming",value:"200900"},{key:"dianbaixian",value:"200903"},{key:"gaozhou",value:"200904"},{key:"huazhou",value:"200905"},{key:"maogangqu",value:"200902"},{key:"maonanqu",value:"200901"},{key:"xinyi",value:"200906"},{key:"meizhou",value:"201000"},{key:"dapuxian",value:"201003"},{key:"fengshunxian",value:"201004"},{key:"jiaolingxian",value:"201007"},{key:"meijiangqu",value:"201001"},{key:"meixian",value:"201002"},{key:"pingyuanxian",value:"201006"},{key:"wuhuaxian",value:"201005"},{key:"xingning",value:"201008"},{key:"qingyuan",value:"201100"},{key:"fogangxian",value:"201102"},{key:"liannanyaozu",value:"201105"},{key:"lianshanzhuangzuyaozu",value:"201104"},{key:"lianzhou",value:"201108"},{key:"qingchengqu",value:"201101"},{key:"qingxinxian",value:"201106"},{key:"yingde",value:"201107"},{key:"yangshanxian",value:"201103"},{key:"shaoguan",value:"201200"},{key:"lechang",value:"201202"},{key:"nanxiong",value:"201210"},{key:"qujiangqu",value:"201208"},{key:"renhuaxian",value:"201206"},{key:"ruyuanyaozu",value:"201204"},{key:"shixingxian",value:"201207"},{key:"wujiangqu",value:"201201"},{key:"wengyuanxian",value:"201205"},{key:"xinfengxian",value:"201203"},{key:"zuojiangqu",value:"201209"},{key:"shantou",value:"201300"},{key:"chenghaiqu",value:"201306"},{key:"chaonanqu",value:"201305"},{key:"chaoyangqu",value:"201304"},{key:"zuojiangqu",value:"201303"},{key:"jinpingqu",value:"201302"},{key:"longhuqu",value:"201301"},{key:"nanaoxian",value:"201307"},{key:"shanwei",value:"201400"},{key:"chengqu",value:"201401"},{key:"haifengxian",value:"201402"},{key:"lufeng",value:"201404"},{key:"luhexian",value:"201403"},{key:"shenzuo",value:"201500"},{key:"baoanqu",value:"201504"},{key:"futianqu",value:"201502"},{key:"longgangqu",value:"201505"},{key:"luohuqu",value:"201501"},{key:"nanshanqu",value:"201503"},{key:"yantianqu",value:"201506"},{key:"yunfu",value:"201600"},{key:"luoding",value:"201605"},{key:"xinxingxian",value:"201602"},{key:"yunanxian",value:"201604"},{key:"yunchengqu",value:"201601"},{key:"yunanxian",value:"201603"},{key:"yangjiang",value:"201700"},{key:"jiangchengqu",value:"201701"},{key:"yangchun",value:"201704"},{key:"yangdongxian",value:"201703"},{key:"yangxixian",value:"201702"},{key:"zhuhai",value:"201800"},{key:"doumenqu",value:"201802"},{key:"jinwanqu",value:"201803"},{key:"xiangzhouqu",value:"201801"},{key:"zhanjiang",value:"201900"},{key:"chikanqu",value:"201901"},{key:"lianjiang",value:"201907"},{key:"leizhou",value:"201908"},{key:"mazhangqu",value:"201904"},{key:"potouqu",value:"201903"},{key:"suixixian",value:"201905"},{key:"wuchuan",value:"201909"},{key:"xiashanqu",value:"201902"},{key:"xuwenxian",value:"201906"},{key:"zhaoqing",value:"202000"},{key:"dinghuqu",value:"202002"},{key:"deqingxian",value:"202006"},{key:"duanzhouqu",value:"202001"},{key:"fengkaixian",value:"202005"},{key:"guangningxian",value:"202003"},{key:"gaoyao",value:"202007"},{key:"huaijixian",value:"202004"},{key:"sihui",value:"202008"},{key:"zhongshan",value:"202100"},{key:"gansu",value:"400000"},{key:"baiyin",value:"400200"},{key:"baiyinqu",value:"400201"},{key:"huiningxian",value:"400204"},{key:"jingtaixian",value:"400205"},{key:"jingyuanxian",value:"400203"},{key:"pingchuanqu",value:"400202"},{key:"dingxi",value:"400300"},{key:"andingqu",value:"400301"},{key:"linzuoxian",value:"400305"},{key:"longxixian",value:"400303"},{key:"zuoxian",value:"400307"},{key:"tongweixian",value:"400302"},{key:"weiyuanxian",value:"400304"},{key:"zhangxian",value:"400306"},{key:"gannanzhou",value:"400400"},{key:"diebuxian",value:"400405"},{key:"hezuo",value:"400401"},{key:"luquxian",value:"400407"},{key:"lintanxian",value:"400402"},{key:"maquxian",value:"400406"},{key:"xiahexian",value:"400408"},{key:"zhuonixian",value:"400403"},{key:"zhouquxian",value:"400404"},{key:"jinchang",value:"400500"},{key:"jinchuanqu",value:"400501"},{key:"yongchangxian",value:"400502"},{key:"jiuquan",value:"400600"},{key:"akesai",value:"400605"},{key:"anxixian",value:"400603"},{key:"dunhuang",value:"400607"},{key:"jintaxian",value:"400602"},{key:"subeixian",value:"400604"},{key:"suzhouqu",value:"400601"},{key:"yumen",value:"400606"},{key:"jiayuguan",value:"400700"},{key:"longnan",value:"400800"},{key:"chengxian",value:"400802"},{key:"zuochangxian",value:"400804"},{key:"huixian",value:"400808"},{key:"kangxian",value:"400805"},{key:"liangdangxian",value:"400809"},{key:"lixian",value:"400807"},{key:"wuduqu",value:"400801"},{key:"wenxian",value:"400803"},{key:"xihexian",value:"400806"},{key:"linxiazhou",value:"400900"},{key:"dongxiangzu",value:"400907"},{key:"guanghexian",value:"400905"},{key:"hezhengxian",value:"400906"},{key:"jishishanxian",value:"400908"},{key:"kanglexian",value:"400903"},{key:"linxia",value:"400901"},{key:"linxiaxian",value:"400902"},{key:"yongjingxian",value:"400904"},{key:"lanzhou",value:"400100"},{key:"anningqu",value:"400104"},{key:"chengguanqu",value:"400101"},{key:"gaolanxian",value:"400107"},{key:"hongguqu",value:"400105"},{key:"qilihequ",value:"400102"},{key:"xiguqu",value:"400103"},{key:"yongdengxian",value:"400106"},{key:"yuzhongxian",value:"400108"},{key:"pingliang",value:"401000"},{key:"chongxinxian",value:"401004"},{key:"huatingxian",value:"401005"},{key:"zuochuanxian",value:"401002"},{key:"jingningxian",value:"401007"},{key:"zuozuoqu",value:"401001"},{key:"lingtaixian",value:"401003"},{key:"zhuanglangxian",value:"401006"},{key:"qingyang",value:"401100"},{key:"huachixian",value:"401104"},{key:"heshuixian",value:"401105"},{key:"huanxian",value:"401103"},{key:"ningxian",value:"401107"},{key:"qingchengxian",value:"401102"},{key:"xifengqu",value:"401101"},{key:"zhengningxian",value:"401106"},{key:"zhenyuanxian",value:"401108"},{key:"tianshui",value:"401200"},{key:"beidaoqu",value:"401202"},{key:"ganguxian",value:"401205"},{key:"qinanxian",value:"401204"},{key:"qinchengqu",value:"401201"},{key:"qingshuixian",value:"401203"},{key:"wushanxian",value:"401206"},{key:"zhangjiachuanxian",value:"401207"},{key:"wuwei",value:"401300"},{key:"gulangxian",value:"401303"},{key:"liangzhouqu",value:"401301"},{key:"minqinxian",value:"401302"},{key:"tianzhuxian",value:"401304"},{key:"zhangye",value:"401400"},{key:"gaotaixian",value:"401405"},{key:"ganzhouqu",value:"401401"},{key:"linzexian",value:"401404"},{key:"minlexian",value:"401403"},{key:"shandanxian",value:"401406"},{key:"sunanxian",value:"401402"},{key:"guangxi",value:"210000"},{key:"beihai",value:"210200"},{key:"haichengqu",value:"210201"},{key:"hepuxian",value:"210204"},{key:"tieshangangqu",value:"210203"},{key:"yinhaiqu",value:"210202"},{key:"baise",value:"210300"},{key:"debaoxian",value:"210308"},{key:"jingxixian",value:"210307"},{key:"leyexian",value:"210304"},{key:"longlingezu",value:"210312"},{key:"lingyunxian",value:"210305"},{key:"napoxian",value:"210306"},{key:"pingguoxian",value:"210309"},{key:"tiandongxian",value:"210310"},{key:"tianlinxian",value:"210303"},{key:"tianyangxian",value:"210311"},{key:"xilinxian",value:"210302"},{key:"youjiangqu",value:"210301"},{key:"chongzuo",value:"210400"},{key:"daxinxian",value:"210405"},{key:"fusuixian",value:"210402"},{key:"jiangzhouqu",value:"210401"},{key:"longzhouxian",value:"210404"},{key:"ningmingxian",value:"210403"},{key:"pingxiang",value:"210407"},{key:"tiandengxian",value:"210406"},{key:"fangchenggang",value:"210500"},{key:"dongxing",value:"210504"},{key:"fangchengqu",value:"210502"},{key:"gangkouqu",value:"210501"},{key:"shangsixian",value:"210503"},{key:"guigang",value:"210600"},{key:"gangbeiqu",value:"210601"},{key:"gangnanqu",value:"210602"},{key:"guiping",value:"210605"},{key:"pingnanxian",value:"210604"},{key:"zuotangqu",value:"210603"},{key:"guilin",value:"210700"},{key:"diecaiqu",value:"210716"},{key:"gongchengyaozu",value:"210717"},{key:"guanyangxian",value:"210706"},{key:"lingchuanxian",value:"210710"},{key:"linguixian",value:"210711"},{key:"lipuxian",value:"210702"},{key:"longshenggezu",value:"210705"},{key:"pinglexian",value:"210703"},{key:"qixingqu",value:"210714"},{key:"quanzhouxian",value:"210709"},{key:"xinganxian",value:"210708"},{key:"xiufengqu",value:"210701"},{key:"xiangshanqu",value:"210715"},{key:"yongfuxian",value:"210707"},{key:"yanshanqu",value:"210713"},{key:"yangshuoxian",value:"210712"},{key:"ziyuanxian",value:"210704"},{key:"hechi",value:"210800"},{key:"bamayaozu",value:"210804"},{key:"duanyaozu",value:"210803"},{key:"dahuayaozu",value:"210802"},{key:"donglanxian",value:"210807"},{key:"fengshanxian",value:"210808"},{key:"huanjiangmaonanzu",value:"210805"},{key:"jinchengjiangqu",value:"210801"},{key:"luochengzuolaozu",value:"210806"},{key:"nandanxian",value:"210810"},{key:"tianexian",value:"210809"},{key:"yizhou",value:"210811"},{key:"hezhou",value:"210900"},{key:"babuqu",value:"210901"},{key:"fuchuanyaozu",value:"210904"},{key:"zhaopingxian",value:"210902"},{key:"zhongshanxian",value:"210903"},{key:"laibin",value:"211000"},{key:"heshan",value:"211006"},{key:"jinxiuyaozu",value:"211005"},{key:"wuxuanxian",value:"211004"},{key:"xingbinqu",value:"211001"},{key:"xinchengxian",value:"211002"},{key:"xiangzhouxian",value:"211003"},{key:"liuzhou",value:"211100"},{key:"chengzhongqu",value:"211101"},{key:"liubeiqu",value:"211107"},{key:"liuchengxian",value:"211105"},{key:"liujiangxian",value:"211106"},{key:"liunanqu",value:"211108"},{key:"luzhaixian",value:"211104"},{key:"ronganxian",value:"211103"},{key:"rongshuimiaozu",value:"211102"},{key:"sanjiangxian",value:"211110"},{key:"yufengqu",value:"211109"},{key:"nanning",value:"210100"},{key:"binyangxian",value:"210102"},{key:"hengxian",value:"210112"},{key:"jiangnanqu",value:"210110"},{key:"longanxian",value:"210105"},{key:"liangqingqu",value:"210108"},{key:"mashanxian",value:"210104"},{key:"qingxiuqu",value:"210111"},{key:"shanglinxian",value:"210103"},{key:"wumingxian",value:"210106"},{key:"xingningqu",value:"210101"},{key:"xixiangtangqu",value:"210109"},{key:"zuoningqu",value:"210107"},{key:"qinzhou",value:"211200"},{key:"lingshanxian",value:"211203"},{key:"pubeixian",value:"211204"},{key:"qinbeiqu",value:"211202"},{key:"qinnanqu",value:"211201"},{key:"wuzhou",value:"211300"},{key:"cangwuxian",value:"211304"},{key:"zuoxi",value:"211307"},{key:"dieshanqu",value:"211302"},{key:"mengshanxian",value:"211306"},{key:"tengxian",value:"211305"},{key:"wanxiuqu",value:"211301"},{key:"changzhouqu",value:"211303"},{key:"yulin",value:"211400"},{key:"bobaixian",value:"211404"},{key:"beiliu",value:"211406"},{key:"luchuanxian",value:"211403"},{key:"rongxian",value:"211402"},{key:"xingyexian",value:"211405"},{key:"yuzhouqu",value:"211401"},{key:"guizhou",value:"310000"},{key:"anshun",value:"310200"},{key:"guanlingxian",value:"310205"},{key:"pingbaxian",value:"310202"},{key:"pudingxian",value:"310203"},{key:"xixiuqu",value:"310201"},{key:"zhenningxian",value:"310204"},{key:"ziyunxian",value:"310206"},{key:"bijie",value:"310300"},{key:"bijie",value:"310301"},{key:"dafangxian",value:"310302"},{key:"hezhangxian",value:"310308"},{key:"jinshaxian",value:"310304"},{key:"nayongxian",value:"310306"},{key:"qianxixian",value:"310303"},{key:"weiningxian",value:"310307"},{key:"zhijinxian",value:"310305"},{key:"guiyang",value:"310100"},{key:"baiyunqu",value:"310106"},{key:"huaxiqu",value:"310108"},{key:"kaiyangxian",value:"310104"},{key:"nanmingqu",value:"310101"},{key:"qingzhen",value:"310110"},{key:"wudangqu",value:"310107"},{key:"xifengxian",value:"310103"},{key:"xiaohequ",value:"310105"},{key:"xiuwenxian",value:"310102"},{key:"yunyanqu",value:"310109"},{key:"liupanshui",value:"310400"},{key:"liuzhitequ",value:"310402"},{key:"panxian",value:"310404"},{key:"shuichengxian",value:"310403"},{key:"zhongshanqu",value:"310401"},{key:"qiandongnanzhou",value:"310500"},{key:"zuogongxian",value:"310511"},{key:"congjiangxian",value:"310504"},{key:"danzhaixian",value:"310516"},{key:"huangpingxian",value:"310515"},{key:"jianhexian",value:"310508"},{key:"jinpingxian",value:"310509"},{key:"kaili",value:"310501"},{key:"lipingxian",value:"310506"},{key:"leishanxian",value:"310503"},{key:"majiangxian",value:"310502"},{key:"zuojiangxian",value:"310505"},{key:"shibingxian",value:"310514"},{key:"sansuixian",value:"310513"},{key:"taijiangxian",value:"310507"},{key:"tianzhuxian",value:"310510"},{key:"zhenyuanxian",value:"310512"},{key:"qiannanzhou",value:"310600"},{key:"dushanxian",value:"310607"},{key:"duyun",value:"310601"},{key:"fuquan",value:"310611"},{key:"guidingxian",value:"310609"},{key:"huishuixian",value:"310602"},{key:"liboxian",value:"310610"},{key:"luodianxian",value:"310605"},{key:"longlixian",value:"310603"},{key:"pingtangxian",value:"310606"},{key:"sanduxian",value:"310612"},{key:"wenganxian",value:"310608"},{key:"changshunxian",value:"310604"},{key:"qianxinanzhou",value:"310700"},{key:"anlongxian",value:"310708"},{key:"cehengxian",value:"310707"},{key:"puanxian",value:"310703"},{key:"qinglongxian",value:"310704"},{key:"wangzuoxian",value:"310706"},{key:"xingrenxian",value:"310702"},{key:"xingyi",value:"310701"},{key:"zhenfengxian",value:"310705"},{key:"tongren",value:"310800"},{key:"dejiangxian",value:"310804"},{key:"jiangkouxian",value:"310809"},{key:"sinanxian",value:"310806"},{key:"shizuoxian",value:"310807"},{key:"songtaomiaozu",value:"310802"},{key:"tongren",value:"310801"},{key:"wanshantequ",value:"310810"},{key:"yanhexian",value:"310803"},{key:"yinjiangxian",value:"310805"},{key:"yupingdongzu",value:"310808"},{key:"zunyi",value:"310900"},{key:"chishui",value:"310902"},{key:"daozhenxian",value:"310908"},{key:"fenggangxian",value:"310906"},{key:"huichuanqu",value:"310913"},{key:"honghuagangqu",value:"310901"},{key:"zuotanxian",value:"310905"},{key:"renhuai",value:"310914"},{key:"suiyangxian",value:"310910"},{key:"tongzuoxian",value:"310911"},{key:"wuchuanxian",value:"310907"},{key:"xishuixian",value:"310903"},{key:"yuqingxian",value:"310904"},{key:"zhenganxian",value:"310909"},{key:"zunyixian",value:"310912"},{key:"hubei",value:"700000"},{key:"enshizhou",value:"700200"},{key:"badongxian",value:"700204"},{key:"enshi",value:"700201"},{key:"hefengxian",value:"700208"},{key:"jianshixian",value:"700203"},{key:"lichuan",value:"700202"},{key:"laifengxian",value:"700207"},{key:"xuanenxian",value:"700205"},{key:"xianfengxian",value:"700206"},{key:"ezhou",value:"700300"},{key:"echengqu",value:"700303"},{key:"huarongqu",value:"700302"},{key:"liangzihuqu",value:"700301"},{key:"huanggang",value:"700400"},{key:"honganxian",value:"700408"},{key:"huangmeixian",value:"700403"},{key:"huangzhouqu",value:"700401"},{key:"luotianxian",value:"700407"},{key:"macheng",value:"700402"},{key:"zuochunxian",value:"700404"},{key:"tuanfengxian",value:"700409"},{key:"wuxue",value:"700410"},{key:"zuoshuixian",value:"700405"},{key:"yingshanxian",value:"700406"},{key:"huangshi",value:"700500"},{key:"daye",value:"700506"},{key:"huangshigangqu",value:"700501"},{key:"tieshanqu",value:"700504"},{key:"xialuqu",value:"700503"},{key:"xisaishanqu",value:"700502"},{key:"yangxinxian",value:"700505"},{key:"jingmen",value:"700600"},{key:"dongbaoqu",value:"700601"},{key:"duodaoqu",value:"700602"},{key:"jingshanxian",value:"700603"},{key:"shayangxian",value:"700604"},{key:"zhongxiang",value:"700605"},{key:"jingzhou",value:"700700"},{key:"gonganxian",value:"700703"},{key:"honghu",value:"700707"},{key:"jianlixian",value:"700704"},{key:"jianglingxian",value:"700705"},{key:"jingzhouqu",value:"700702"},{key:"shishou",value:"700706"},{key:"shashiqu",value:"700701"},{key:"songzi",value:"700708"},{key:"shiyan",value:"700800"},{key:"danjiangkou",value:"700808"},{key:"fangxian",value:"700807"},{key:"maojianqu",value:"700801"},{key:"yunxian",value:"700803"},{key:"yunxixian",value:"700804"},{key:"zhushanxian",value:"700805"},{key:"zhangwanqu",value:"700802"},{key:"zhuxixian",value:"700806"},{key:"suizhou",value:"700900"},{key:"zengduqu",value:"700901"},{key:"guangshui",value:"700902"},{key:"wuhan",value:"700100"},{key:"caidianqu",value:"700104"},{key:"dongxihuqu",value:"700106"},{key:"hannanqu",value:"700105"},{key:"huangzuoqu",value:"700102"},{key:"hongshanqu",value:"700107"},{key:"hanyangqu",value:"700110"},{key:"jianganqu",value:"700101"},{key:"jianghanqu",value:"700112"},{key:"jiangxiaqu",value:"700103"},{key:"qiaokouqu",value:"700111"},{key:"qingshanqu",value:"700108"},{key:"wuchangqu",value:"700109"},{key:"xinzhouqu",value:"700113"},{key:"xiangfan",value:"701000"},{key:"baokangxian",value:"701006"},{key:"fanchengqu",value:"701002"},{key:"guchengxian",value:"701005"},{key:"laohekou",value:"701007"},{key:"nanzhangxian",value:"701004"},{key:"xiangchengqu",value:"701001"},{key:"xiangyangqu",value:"701003"},{key:"yicheng",value:"701009"},{key:"zaoyang",value:"701008"},{key:"xiaogan",value:"701100"},{key:"anlu",value:"701106"},{key:"dawuxian",value:"701103"},{key:"hanchuan",value:"701107"},{key:"xiaochangxian",value:"701102"},{key:"xiaonanqu",value:"701101"},{key:"yingcheng",value:"701105"},{key:"yunmengxian",value:"701104"},{key:"xianning",value:"701200"},{key:"chibi",value:"701206"},{key:"chongyangxian",value:"701204"},{key:"jiayuxian",value:"701202"},{key:"tongchengxian",value:"701203"},{key:"tongshanxian",value:"701205"},{key:"xiananqu",value:"701201"},{key:"xiantao",value:"701400"},{key:"yichang",value:"701300"},{key:"dianjunqu",value:"701311"},{key:"dangyang",value:"701302"},{key:"wufengtujiazu",value:"701304"},{key:"wujiagangqu",value:"701312"},{key:"xilingqu",value:"701301"},{key:"xingshanxian",value:"701307"},{key:"yuananxian",value:"701308"},{key:"yidu",value:"701303"},{key:"yilingqu",value:"701309"},{key:"tingqu",value:"701310"},{key:"zuoguixian",value:"701306"},{key:"zhijiang",value:"701313"},{key:"changyangtujiazu",value:"701305"},{key:"hebei",value:"510000"},{key:"baoding",value:"510200"},{key:"anguo",value:"510211"},{key:"anxinxian",value:"510202"},{key:"beishiqu",value:"510215"},{key:"boyexian",value:"510207"},{key:"dingxingxian",value:"510222"},{key:"dingzhou",value:"510210"},{key:"fupingxian",value:"510220"},{key:"gaobeidian",value:"510225"},{key:"gaoyangxian",value:"510224"},{key:"zuoshuixian",value:"510219"},{key:"zuoxian",value:"510205"},{key:"zuoyuanxian",value:"510213"},{key:"manchengxian",value:"510217"},{key:"nanshiqu",value:"510216"},{key:"quyangxian",value:"510204"},{key:"qingyuanxian",value:"510218"},{key:"rongchengxian",value:"510214"},{key:"shunpingxian",value:"510206"},{key:"tangxian",value:"510223"},{key:"wangduxian",value:"510212"},{key:"xinshiqu",value:"510201"},{key:"xushuixian",value:"510221"},{key:"xiongxian",value:"510208"},{key:"yixian",value:"510203"},{key:"zuozhou",value:"510209"},{key:"chengde",value:"510300"},{key:"chengdexian",value:"510308"},{key:"fengningxian",value:"510303"},{key:"kuanchengxian",value:"510302"},{key:"longhuaxian",value:"510304"},{key:"luanpingxian",value:"510305"},{key:"pingquanxian",value:"510306"},{key:"shuangluanqu",value:"510310"},{key:"shuangqiaoqu",value:"510301"},{key:"weichangxian",value:"510311"},{key:"xinglongxian",value:"510307"},{key:"yingshouyingzi",value:"510309"},{key:"cangzhou",value:"510400"},{key:"botou",value:"510404"},{key:"cangxian",value:"510414"},{key:"dongguangxian",value:"510412"},{key:"huangzuo",value:"510402"},{key:"hejian",value:"510416"},{key:"haixingxian",value:"510411"},{key:"mengcunxian",value:"510405"},{key:"nanpixian",value:"510408"},{key:"qingxian",value:"510413"},{key:"renqiu",value:"510403"},{key:"suningxian",value:"510409"},{key:"wuqiaoxian",value:"510407"},{key:"xinhuaqu",value:"510401"},{key:"xianxian",value:"510406"},{key:"yunhequ",value:"510415"},{key:"yanshanxian",value:"510410"},{key:"handan",value:"510500"},{key:"chenganxian",value:"510513"},{key:"congtaiqu",value:"510518"},{key:"cixian",value:"510510"},{key:"damingxian",value:"510512"},{key:"fengfengkuangqu",value:"510516"},{key:"fuxingqu",value:"510517"},{key:"feixiangxian",value:"510509"},{key:"guangpingxian",value:"510505"},{key:"guantaoxian",value:"510504"},{key:"handanxian",value:"510515"},{key:"hanshanqu",value:"510501"},{key:"jizexian",value:"510506"},{key:"linzhangxian",value:"510514"},{key:"qiuxian",value:"510507"},{key:"quzhouxian",value:"510502"},{key:"shexian",value:"510511"},{key:"wuan",value:"510519"},{key:"weixian",value:"510503"},{key:"yongnianxian",value:"510508"},{key:"hengshui",value:"510600"},{key:"anpingxian",value:"510605"},{key:"fuchengxian",value:"510602"},{key:"guchengxian",value:"510604"},{key:"jingxian",value:"510603"},{key:"jizhou",value:"510610"},{key:"raoyangxian",value:"510606"},{key:"taochengqu",value:"510601"},{key:"wuqiangxian",value:"510607"},{key:"wuyixian",value:"510608"},{key:"zaoqiangxian",value:"510609"},{key:"langfang",value:"510700"},{key:"anciqu",value:"510701"},{key:"bazhou",value:"510702"},{key:"dachangxian",value:"510703"},{key:"dachengxian",value:"510705"},{key:"guanxian",value:"510708"},{key:"guangyangqu",value:"510709"},{key:"sanhe",value:"510710"},{key:"wenanxian",value:"510704"},{key:"xianghexian",value:"510706"},{key:"yongqingxian",value:"510707"},{key:"qinhuangdao",value:"510800"},{key:"beidaihequ",value:"510803"},{key:"changlixian",value:"510805"},{key:"funingxian",value:"510806"},{key:"haigangqu",value:"510801"},{key:"lulongxian",value:"510807"},{key:"qinglongxian",value:"510804"},{key:"shanhaiguanqu",value:"510802"},{key:"shijiazhuang",value:"510100"},{key:"zuocheng",value:"510108"},{key:"gaoyixian",value:"510112"},{key:"jingzuokuangqu",value:"510117"},{key:"jingzuoxian",value:"510119"},{key:"jinzhou",value:"510109"},{key:"zuochengxian",value:"510121"},{key:"luquan",value:"510123"},{key:"lingshouxian",value:"510113"},{key:"pingshanxian",value:"510104"},{key:"qiaodongqu",value:"510114"},{key:"qiaoxiqu",value:"510115"},{key:"shenzexian",value:"510111"},{key:"wujixian",value:"510103"},{key:"xinhuaqu",value:"510116"},{key:"xinji",value:"510107"},{key:"xinle",value:"510110"},{key:"xingtangxian",value:"510122"},{key:"yuhuaqu",value:"510118"},{key:"yuanshixian",value:"510105"},{key:"changanqu",value:"510101"},{key:"zhengdingxian",value:"510120"},{key:"zanhuangxian",value:"510102"},{key:"zhaoxian",value:"510106"},{key:"tangshan",value:"510900"},{key:"fengnanqu",value:"510910"},{key:"fengrunqu",value:"510909"},{key:"guyequ",value:"510912"},{key:"kaipingqu",value:"510911"},{key:"lubeiqu",value:"510913"},{key:"lunanqu",value:"510901"},{key:"luannanxian",value:"510907"},{key:"letingxian",value:"510906"},{key:"luanxian",value:"510908"},{key:"qianan",value:"510914"},{key:"qianxixian",value:"510905"},{key:"tanghaixian",value:"510903"},{key:"yutianxian",value:"510904"},{key:"zunhua",value:"510902"},{key:"xingtai",value:"511000"},{key:"baixiangxian",value:"511014"},{key:"guangzongxian",value:"511007"},{key:"juluxian",value:"511009"},{key:"linchengxian",value:"511016"},{key:"linxixian",value:"511003"},{key:"longyaoxian",value:"511013"},{key:"nangong",value:"511002"},{key:"nanhexian",value:"511011"},{key:"ningjinxian",value:"511010"},{key:"neiqiuxian",value:"511015"},{key:"pingxiangxian",value:"511006"},{key:"qiaodongqu",value:"511001"},{key:"qinghexian",value:"511004"},{key:"qiaoxiqu",value:"511018"},{key:"renxian",value:"511012"},{key:"shahe",value:"511019"},{key:"weixian",value:"511005"},{key:"xinhexian",value:"511008"},{key:"xingtaixian",value:"511017"},{key:"zhangjiakou",value:"511100"},{key:"chichengxian",value:"511102"},{key:"chonglixian",value:"511117"},{key:"guyuanxian",value:"511110"},{key:"huaianxian",value:"511106"},{key:"huailaixian",value:"511104"},{key:"kangbaoxian",value:"511111"},{key:"qiaodongqu",value:"511101"},{key:"qiaoxiqu",value:"511116"},{key:"shangyixian",value:"511109"},{key:"wanquanxian",value:"511105"},{key:"xuanhuaqu",value:"511115"},{key:"xuanhuaxian",value:"511113"},{key:"xiahuayuanqu",value:"511114"},{key:"weixian",value:"511108"},{key:"yangyuanxian",value:"511107"},{key:"zhangbeixian",value:"511112"},{key:"zuoluxian",value:"511103"},{key:"henan",value:"710000"},{key:"anyang",value:"710200"},{key:"anyangxian",value:"710205"},{key:"beiguanqu",value:"710202"},{key:"huaxian",value:"710207"},{key:"longanqu",value:"710204"},{key:"linzhou",value:"710209"},{key:"neihuangxian",value:"710208"},{key:"tangyinxian",value:"710206"},{key:"wenfengqu",value:"710201"},{key:"yinduqu",value:"710203"},{key:"hebi",value:"710300"},{key:"heshanqu",value:"710301"},{key:"junxian",value:"710304"},{key:"zuobinqu",value:"710303"},{key:"zuoxian",value:"710305"},{key:"shanchengqu",value:"710302"},{key:"jiaozuo",value:"710400"},{key:"boaixian",value:"710406"},{key:"jiefangqu",value:"710401"},{key:"jiyuan",value:"711800"},{key:"jiyuan",value:"711801"},{key:"macunqu",value:"710409"},{key:"mengzhou",value:"710411"},{key:"qinyang",value:"710402"},{key:"shanyangqu",value:"710408"},{key:"wenxian",value:"710404"},{key:"wuzuoxian",value:"710405"},{key:"xiuwuxian",value:"710407"},{key:"zhongzhanqu",value:"710410"},{key:"kaifeng",value:"710500"},{key:"gulouqu",value:"710508"},{key:"kaifengxian",value:"710502"},{key:"lankaoxian",value:"710510"},{key:"longtingqu",value:"710501"},{key:"nanguanqu",value:"710507"},{key:"zuoxian",value:"710505"},{key:"shunhehuizuqu",value:"710509"},{key:"tongxuxian",value:"710504"},{key:"weishixian",value:"710503"},{key:"zuohe",value:"710600"},{key:"linzuoxian",value:"710605"},{key:"wuyangxian",value:"710604"},{key:"zuochengqu",value:"710602"},{key:"yuanhuiqu",value:"710601"},{key:"zhaolingqu",value:"710603"},{key:"luoyang",value:"710700"},{key:"zuohehuizuqu",value:"710713"},{key:"jiliqu",value:"710711"},{key:"jianxiqu",value:"710712"},{key:"laochengqu",value:"710701"},{key:"zuochuanxian",value:"710707"},{key:"luolongqu",value:"710710"},{key:"luoningxian",value:"710703"},{key:"mengjinxian",value:"710709"},{key:"ruyangxian",value:"710705"},{key:"zuoxian",value:"710706"},{key:"xinanxian",value:"710708"},{key:"xigongqu",value:"710714"},{key:"yichuanxian",value:"710702"},{key:"zuoshi",value:"710715"},{key:"yiyangxian",value:"710704"},{key:"nanyang",value:"710800"},{key:"dengzhou",value:"710813"},{key:"fangchengxian",value:"710810"},{key:"neixiangxian",value:"710807"},{key:"nanzhaoxian",value:"710811"},{key:"sheqixian",value:"710805"},{key:"tongbaixian",value:"710802"},{key:"tanghexian",value:"710804"},{key:"wanchengqu",value:"710801"},{key:"wolongqu",value:"710812"},{key:"zuochuanxian",value:"710806"},{key:"xixiaxian",value:"710809"},{key:"xinyexian",value:"710803"},{key:"zhenpingxian",value:"710808"},{key:"pingdingshan",value:"710900"},{key:"baofengxian",value:"710906"},{key:"zuoxian",value:"710903"},{key:"lushanxian",value:"710904"},{key:"ruzhou",value:"710910"},{key:"shilongqu",value:"710908"},{key:"weidongqu",value:"710909"},{key:"wugang",value:"710902"},{key:"xinhuaqu",value:"710901"},{key:"yexian",value:"710905"},{key:"zhanhequ",value:"710907"},{key:"zuoyang",value:"711000"},{key:"fanxian",value:"711004"},{key:"hualongqu",value:"711001"},{key:"nanlexian",value:"711003"},{key:"zuoyangxian",value:"711006"},{key:"qingfengxian",value:"711002"},{key:"taiqianxian",value:"711005"},{key:"sanmenxia",value:"711100"},{key:"hubinqu",value:"711101"},{key:"lingbao",value:"711106"},{key:"lushixian",value:"711104"},{key:"zuochixian",value:"711102"},{key:"shanxian",value:"711103"},{key:"yima",value:"711105"},{key:"shangqiu",value:"711200"},{key:"liangyuanqu",value:"711201"},{key:"minquanxian",value:"711203"},{key:"ninglingxian",value:"711205"},{key:"zuoxian",value:"711204"},{key:"zuoyangqu",value:"711202"},{key:"xiayixian",value:"711208"},{key:"yongcheng",value:"711209"},{key:"yuchengxian",value:"711207"},{key:"zuochengxian",value:"711206"},{key:"xuchang",value:"711300"},{key:"weiduqu",value:"711301"},{key:"xiangchengxian",value:"711304"},{key:"xuchangxian",value:"711302"},{key:"zuolingxian",value:"711303"},{key:"yuzhou",value:"711305"},{key:"changge",value:"711306"},{key:"xinxiang",value:"711400"},{key:"fengquanqu",value:"711410"},{key:"fengqiuxian",value:"711404"},{key:"huojiaxian",value:"711407"},{key:"hongqiqu",value:"711401"},{key:"huixian",value:"711412"},{key:"muyequ",value:"711409"},{key:"weibinqu",value:"711411"},{key:"weihui",value:"711402"},{key:"xinxiangxian",value:"711408"},{key:"yanjinxian",value:"711405"},{key:"yuanyangxian",value:"711406"},{key:"changyuanxian",value:"711403"},{key:"xinyang",value:"711500"},{key:"guangshanxian",value:"711507"},{key:"gushixian",value:"711504"},{key:"huaibinxian",value:"711502"},{key:"zuochuanxian",value:"711503"},{key:"luoshanxian",value:"711508"},{key:"pingqiaoqu",value:"711509"},{key:"shangchengxian",value:"711505"},{key:"shihequ",value:"711501"},{key:"xixian",value:"711510"},{key:"xinxian",value:"711506"},{key:"zhoukou",value:"711600"},{key:"chuanhuiqu",value:"711601"},{key:"danchengxian",value:"711605"},{key:"fugouxian",value:"711609"},{key:"huaiyangxian",value:"711604"},{key:"luyixian",value:"711602"},{key:"shenqiuxian",value:"711606"},{key:"shangshuixian",value:"711607"},{key:"taikangxian",value:"711603"},{key:"xiangcheng",value:"711610"},{key:"xihuaxian",value:"711608"},{key:"zhumadian",value:"711700"},{key:"miyangxian",value:"711704"},{key:"pingyuxian",value:"711707"},{key:"queshanxian",value:"711705"},{key:"runanxian",value:"711703"},{key:"shangcaixian",value:"711708"},{key:"suipingxian",value:"711702"},{key:"xincaixian",value:"711710"},{key:"xipingxian",value:"711709"},{key:"zuochengqu",value:"711701"},{key:"zhengyangxian",value:"711706"},{key:"zhengzhou",value:"710100"},{key:"dengfeng",value:"710112"},{key:"erqiqu",value:"710111"},{key:"guanchengqu",value:"710110"},{key:"gongyi",value:"710105"},{key:"jinshuiqu",value:"710109"},{key:"zuoshanqu",value:"710107"},{key:"shangjiequ",value:"710108"},{key:"xinmi",value:"710103"},{key:"xinzheng",value:"710102"},{key:"zuoyang",value:"710104"},{key:"zhongmouxian",value:"710106"},{key:"zhongyuanqu",value:"710101"},{key:"heilongjiang",value:"600000"},{key:"daqing",value:"600200"},{key:"duerbotexian",value:"600209"},{key:"datongqu",value:"600205"},{key:"honggangqu",value:"600204"},{key:"lindianxian",value:"600208"},{key:"longfengqu",value:"600202"},{key:"ranghuluqu",value:"600203"},{key:"saertuqu",value:"600201"},{key:"zhaoyuanxian",value:"600207"},{key:"zhaozhouxian",value:"600206"},{key:"daxinganling",value:"600300"},{key:"humaxian",value:"600301"},{key:"mohexian",value:"600303"},{key:"tahexian",value:"600302"},{key:"haerbin",value:"600100"},{key:"acheng",value:"600104"},{key:"binxian",value:"600109"},{key:"bayanxian",value:"600108"},{key:"daoliqu",value:"600101"},{key:"dongliqu",value:"600115"},{key:"daowaiqu",value:"600117"},{key:"fangzhengxian",value:"600110"},{key:"hulanqu",value:"600112"},{key:"mulanxian",value:"600107"},{key:"nangangqu",value:"600118"},{key:"pingfangqu",value:"600114"},{key:"songbeiqu",value:"600113"},{key:"shuangcheng",value:"600103"},{key:"shangzhi",value:"600102"},{key:"tonghexian",value:"600106"},{key:"wuchang",value:"600119"},{key:"xiangfangqu",value:"600116"},{key:"yilanxian",value:"600111"},{key:"yanshouxian",value:"600105"},{key:"hegang",value:"600400"},{key:"dongshanqu",value:"600405"},{key:"gongnongqu",value:"600402"},{key:"luobeixian",value:"600407"},{key:"nanshanqu",value:"600403"},{key:"suibinxian",value:"600408"},{key:"xinganqu",value:"600404"},{key:"xingshanqu",value:"600406"},{key:"xiangyangqu",value:"600401"},{key:"heihe",value:"600500"},{key:"aihuiqu",value:"600501"},{key:"beian",value:"600505"},{key:"nenjiangxian",value:"600502"},{key:"sunwuxian",value:"600504"},{key:"wudalianchi",value:"600506"},{key:"xunkexian",value:"600503"},{key:"jiamusi",value:"600600"},{key:"dongfengqu",value:"600608"},{key:"fujin",value:"600611"},{key:"fuyuanxian",value:"600603"},{key:"zuochuanxian",value:"600605"},{key:"zuonanxian",value:"600606"},{key:"qianjinqu",value:"600609"},{key:"tongjiang",value:"600602"},{key:"tangyuanxian",value:"600604"},{key:"xiangyangqu",value:"600610"},{key:"yonghongqu",value:"600601"},{key:"jixi",value:"600700"},{key:"chengzihequ",value:"600705"},{key:"didaoqu",value:"600703"},{key:"hulin",value:"600708"},{key:"hengshanqu",value:"600702"},{key:"jidongxian",value:"600707"},{key:"jiguanqu",value:"600701"},{key:"lishuqu",value:"600704"},{key:"mishan",value:"600709"},{key:"mashanqu",value:"600706"},{key:"mudanjiang",value:"600800"},{key:"aiminqu",value:"600808"},{key:"donganqu",value:"600801"},{key:"dongningxian",value:"600806"},{key:"hailin",value:"600803"},{key:"linkouxian",value:"600805"},{key:"muleng",value:"600810"},{key:"ningan",value:"600802"},{key:"suifenhe",value:"600804"},{key:"xianqu",value:"600807"},{key:"yangmingqu",value:"600809"},{key:"qiqihaer",value:"600900"},{key:"angangxiqu",value:"600913"},{key:"baiquanxian",value:"600902"},{key:"fulaerjiqu",value:"600912"},{key:"fuyuxian",value:"600905"},{key:"gannanxian",value:"600906"},{key:"jianhuaqu",value:"600915"},{key:"kedongxian",value:"600903"},{key:"keshanxian",value:"600904"},{key:"longjiangxian",value:"600909"},{key:"longshaqu",value:"600901"},{key:"meilisi",value:"600910"},{key:"zuohe",value:"600916"},{key:"nianzishanqu",value:"600911"},{key:"tiefengqu",value:"600914"},{key:"tailaixian",value:"600907"},{key:"yianxian",value:"600908"},{key:"qitaihe",value:"601000"},{key:"bolixian",value:"601004"},{key:"qiezihequ",value:"601003"},{key:"taoshanqu",value:"601002"},{key:"xinxingqu",value:"601001"},{key:"suihua",value:"601100"},{key:"anda",value:"601103"},{key:"beilinqu",value:"601101"},{key:"hailun",value:"601110"},{key:"lanxixian",value:"601108"},{key:"mingshuixian",value:"601105"},{key:"qinganxian",value:"601106"},{key:"qinggangxian",value:"601107"},{key:"suilengxian",value:"601104"},{key:"wangkuixian",value:"601109"},{key:"zhaodong",value:"601102"},{key:"shuangyashan",value:"601200"},{key:"baoqingxian",value:"601207"},{key:"baoshanqu",value:"601204"},{key:"jianshanqu",value:"601201"},{key:"jixianxian",value:"601205"},{key:"lingdongqu",value:"601202"},{key:"raohexian",value:"601208"},{key:"sifangtaiqu",value:"601203"},{key:"youyixian",value:"601206"},{key:"yichun",value:"601300"},{key:"cuiluanqu",value:"601313"},{key:"dailingqu",value:"601306"},{key:"hongxingqu",value:"601304"},{key:"jinshantunqu",value:"601310"},{key:"jiayinxian",value:"601302"},{key:"meixiqu",value:"601311"},{key:"nanchaqu",value:"601316"},{key:"shangganlingqu",value:"601303"},{key:"tieli",value:"601317"},{key:"tangwanghequ",value:"601307"},{key:"wumahequ",value:"601308"},{key:"wuyilingqu",value:"601305"},{key:"wuyingqu",value:"601309"},{key:"xilinqu",value:"601314"},{key:"xinqingqu",value:"601312"},{key:"yichunqu",value:"601301"},{key:"youhaoqu",value:"601315"},{key:"hainan",value:"220000"},{key:"haikou",value:"220100"},{key:"longhuaqu",value:"220102"},{key:"meilanqu",value:"220104"},{key:"qiongshanqu",value:"220103"},{key:"xiuyingqu",value:"220101"},{key:"sanya",value:"220200"},{key:"hunan",value:"720000"},{key:"changde",value:"720200"},{key:"anxiangxian",value:"720203"},{key:"dingchengqu",value:"720202"},{key:"hanshouxian",value:"720204"},{key:"jinshi",value:"720209"},{key:"linzuoxian",value:"720206"},{key:"zuoxian",value:"720205"},{key:"shimenxian",value:"720208"},{key:"taoyuanxian",value:"720207"},{key:"wulingqu",value:"720201"},{key:"changsha",value:"720100"},{key:"zuorongqu",value:"720101"},{key:"kaifuqu",value:"720104"},{key:"zuoyang",value:"720109"},{key:"ningxiangxian",value:"720108"},{key:"tianxinqu",value:"720102"},{key:"wangchengxian",value:"720107"},{key:"yuhuaqu",value:"720105"},{key:"yueluqu",value:"720103"},{key:"changshaxian",value:"720106"},{key:"chenzhou",value:"720300"},{key:"anrenxian",value:"720302"},{key:"beihuqu",value:"720301"},{key:"guidongxian",value:"720303"},{key:"guiyangxian",value:"720309"},{key:"jiahexian",value:"720306"},{key:"linwuxian",value:"720305"},{key:"ruchengxian",value:"720304"},{key:"suxianqu",value:"720310"},{key:"yongxingxian",value:"720307"},{key:"yizhangxian",value:"720308"},{key:"zixing",value:"720311"},{key:"huaihua",value:"720400"},{key:"chenxixian",value:"720409"},{key:"hechengqu",value:"720401"},{key:"hongjiang",value:"720412"},{key:"huitongxian",value:"720407"},{key:"jingzhou",value:"720403"},{key:"mayangmiaozu",value:"720406"},{key:"tongdaodongzu",value:"720402"},{key:"xinhuangdongzu",value:"720405"},{key:"zuopuxian",value:"720408"},{key:"zuolingxian",value:"720410"},{key:"zhongfangxian",value:"720411"},{key:"zuojiangdongzu",value:"720404"},{key:"hengyang",value:"720500"},{key:"changning",value:"720512"},{key:"hengdongxian",value:"720504"},{key:"hengnanxian",value:"720506"},{key:"hengshanxian",value:"720505"},{key:"hengyangxian",value:"720507"},{key:"zuoyang",value:"720502"},{key:"nanyuequ",value:"720508"},{key:"qidongxian",value:"720503"},{key:"shiguqu",value:"720510"},{key:"yanfengqu",value:"720511"},{key:"zhuzuoqu",value:"720501"},{key:"zhengxiangqu",value:"720509"},{key:"loudi",value:"720600"},{key:"lengshuijiang",value:"720604"},{key:"louxingqu",value:"720601"},{key:"lianyuan",value:"720605"},{key:"shuangfengxian",value:"720602"},{key:"xinhuaxian",value:"720603"},{key:"shaoyang",value:"720700"},{key:"beitaqu",value:"720710"},{key:"chengbumiaozu",value:"720702"},{key:"dongkouxian",value:"720705"},{key:"daxiangqu",value:"720711"},{key:"longhuixian",value:"720706"},{key:"shaodongxian",value:"720709"},{key:"suiningxian",value:"720704"},{key:"shuangqingqu",value:"720701"},{key:"shaoyangxian",value:"720707"},{key:"wugang",value:"720712"},{key:"xinningxian",value:"720703"},{key:"xinshaoxian",value:"720708"},{key:"xiangtan",value:"720800"},{key:"shaoshan",value:"720805"},{key:"xiangtanxian",value:"720803"},{key:"xiangxiang",value:"720804"},{key:"yuhuqu",value:"720801"},{key:"yuetangqu",value:"720802"},{key:"xiangxizhou",value:"720900"},{key:"baojingxian",value:"720905"},{key:"fenghuangxian",value:"720903"},{key:"guzhangxian",value:"720906"},{key:"huayuanxian",value:"720904"},{key:"jishou",value:"720901"},{key:"longshanxian",value:"720908"},{key:"zuoxixian",value:"720902"},{key:"yongshunxian",value:"720907"},{key:"yiyang",value:"721000"},{key:"anhuaxian",value:"721005"},{key:"heshanqu",value:"721002"},{key:"nanxian",value:"721003"},{key:"taojiangxian",value:"721004"},{key:"zuojiang",value:"721006"},{key:"ziyangqu",value:"721001"},{key:"yueyang",value:"721100"},{key:"huarongxian",value:"721105"},{key:"junshanqu",value:"721103"},{key:"linxiang",value:"721109"},{key:"zuoluo",value:"721108"},{key:"pingjiangxian",value:"721107"},{key:"xiangyinxian",value:"721106"},{key:"yunxiqu",value:"721102"},{key:"yueyanglouqu",value:"721101"},{key:"yueyangxian",value:"721104"},{key:"yongzhou",value:"721200"},{key:"donganxian",value:"721208"},{key:"daoxian",value:"721206"},{key:"jianghuayaozu",value:"721211"},{key:"jiangyongxian",value:"721205"},{key:"lengshuitanqu",value:"721210"},{key:"lanshanxian",value:"721203"},{key:"ningyuanxian",value:"721204"},{key:"qiyangxian",value:"721209"},{key:"shuangpaixian",value:"721207"},{key:"xintianxian",value:"721202"},{key:"zhishanqu",value:"721201"},{key:"zhangjiajie",value:"721300"},{key:"cilixian",value:"721303"},{key:"sangzhixian",value:"721304"},{key:"wulingyuanqu",value:"721302"},{key:"yongdingqu",value:"721301"},{key:"zhuzhou",value:"721400"},{key:"chalingxian",value:"721407"},{key:"hetangqu",value:"721401"},{key:"zuoling",value:"721409"},{key:"luzuoqu",value:"721402"},{key:"shifengqu",value:"721403"},{key:"tianyuanqu",value:"721404"},{key:"yanlingxian",value:"721408"},{key:"zuoxian",value:"721406"},{key:"zhuzhouxian",value:"721405"},{key:"jilin",value:"610000"},{key:"baicheng",value:"610200"},{key:"daan",value:"610205"},{key:"zuobeiqu",value:"610201"},{key:"zuonan",value:"610204"},{key:"tongyuxian",value:"610203"},{key:"zhenzuoxian",value:"610202"},{key:"baishan",value:"610300"},{key:"badaojiangqu",value:"610301"},{key:"fusongxian",value:"610302"},{key:"jingyuxian",value:"610303"},{key:"jiangyuanxian",value:"610305"},{key:"linjiang",value:"610306"},{key:"changbaixian",value:"610304"},{key:"changchun",value:"610100"},{key:"chaoyangqu",value:"610108"},{key:"dehui",value:"610110"},{key:"erdaoqu",value:"610107"},{key:"jiutai",value:"610103"},{key:"kuanchengqu",value:"610109"},{key:"lvyuanqu",value:"610106"},{key:"nonganxian",value:"610104"},{key:"nanguanqu",value:"610101"},{key:"shuangyangqu",value:"610105"},{key:"yushu",value:"610102"},{key:"jilin",value:"610400"},{key:"changyiqu",value:"610401"},{key:"chuanyingqu",value:"610403"},{key:"fengmanqu",value:"610404"},{key:"zuodian",value:"610407"},{key:"zuohe",value:"610406"},{key:"longtanqu",value:"610402"},{key:"panshi",value:"610409"},{key:"shulan",value:"610408"},{key:"yongjixian",value:"610405"},{key:"liaoyuan",value:"610500"},{key:"dongfengxian",value:"610503"},{key:"dongliaoxian",value:"610504"},{key:"longshanqu",value:"610501"},{key:"xianqu",value:"610502"},{key:"siping",value:"610600"},{key:"gongzhuling",value:"610605"},{key:"lishuxian",value:"610603"},{key:"shuangliao",value:"610606"},{key:"tiedongqu",value:"610602"},{key:"tiexiqu",value:"610601"},{key:"yitongxian",value:"610604"},{key:"songyuan",value:"610700"},{key:"fuyuxian",value:"610705"},{key:"ningjiangqu",value:"610701"},{key:"qiananxian",value:"610704"},{key:"qianguoxian",value:"610702"},{key:"changlingxian",value:"610703"},{key:"tonghua",value:"610800"},{key:"dongchangqu",value:"610801"},{key:"erdaojiangqu",value:"610802"},{key:"huinanxian",value:"610804"},{key:"jian",value:"610807"},{key:"liuhexian",value:"610805"},{key:"meihekou",value:"610806"},{key:"tonghuaxian",value:"610803"},{key:"yanbianchaozhou",value:"610900"},{key:"antuxian",value:"610908"},{key:"dunhua",value:"610903"},{key:"zuochun",value:"610904"},{key:"helong",value:"610906"},{key:"longjing",value:"610905"},{key:"tumen",value:"610902"},{key:"wangqingxian",value:"610907"},{key:"yanji",value:"610901"},{key:"jiangsu",value:"120000"},{key:"changzhou",value:"120200"},{key:"jintan",value:"120207"},{key:"zuoyang",value:"120206"},{key:"qishuyanqu",value:"120203"},{key:"tianningqu",value:"120201"},{key:"wujinqu",value:"120205"},{key:"xinbeiqu",value:"120204"},{key:"zhonglouqu",value:"120202"},{key:"huaian",value:"120300"},{key:"chuzhouqu",value:"120302"},{key:"huaiyinqu",value:"120303"},{key:"hongzexian",value:"120306"},{key:"jinhuxian",value:"120308"},{key:"lianshuixian",value:"120305"},{key:"qinghequ",value:"120301"},{key:"qingpuqu",value:"120304"},{key:"zuozuoxian",value:"120307"},{key:"lianyungang",value:"120400"},{key:"donghaixian",value:"120405"},{key:"guannanxian",value:"120407"},{key:"guanyunxian",value:"120406"},{key:"ganyuxian",value:"120404"},{key:"haizhouqu",value:"120403"},{key:"lianyunqu",value:"120401"},{key:"xinpuqu",value:"120402"},{key:"nanjing",value:"120100"},{key:"baixiaqu",value:"120112"},{key:"gaochunxian",value:"120113"},{key:"gulouqu",value:"120109"},{key:"jiangningqu",value:"120104"},{key:"jianzuoqu",value:"120110"},{key:"liuhequ",value:"120103"},{key:"zuoshuixian",value:"120102"},{key:"pukouqu",value:"120107"},{key:"qinhuaiqu",value:"120111"},{key:"qixiaqu",value:"120106"},{key:"xiaguanqu",value:"120108"},{key:"xuanwuqu",value:"120101"},{key:"yuhuataiqu",value:"120105"},{key:"nantong",value:"120500"},{key:"chongchuanqu",value:"120501"},{key:"gangzhaqu",value:"120502"},{key:"haianxian",value:"120503"},{key:"haimen",value:"120508"},{key:"qidong",value:"120505"},{key:"rudongxian",value:"120504"},{key:"rugao",value:"120506"},{key:"tongzhou",value:"120507"},{key:"suqian",value:"120600"},{key:"suchengqu",value:"120601"},{key:"zuohongxian",value:"120605"},{key:"zuoyangxian",value:"120603"},{key:"suyuqu",value:"120602"},{key:"zuoyangxian",value:"120604"},{key:"suzhou",value:"120700"},{key:"canglangqu",value:"120701"},{key:"changshu",value:"120705"},{key:"huqiuqu",value:"120708"},{key:"jinzuoqu",value:"120709"},{key:"kunshan",value:"120703"},{key:"pingjiangqu",value:"120710"},{key:"taicang",value:"120711"},{key:"wujiang",value:"120702"},{key:"wuzhongqu",value:"120707"},{key:"xiangchengqu",value:"120706"},{key:"zhangjiagang",value:"120704"},{key:"taizhou",value:"120800"},{key:"gaogangqu",value:"120802"},{key:"hailingqu",value:"120801"},{key:"jingjiang",value:"120804"},{key:"jiangyan",value:"120806"},{key:"taixing",value:"120805"},{key:"xinghua",value:"120803"},{key:"wuxi",value:"120900"},{key:"binhuqu",value:"120906"},{key:"huishanqu",value:"120905"},{key:"jiangyin",value:"120907"},{key:"xishanqu",value:"120904"},{key:"yixing",value:"120908"},{key:"xuzhou",value:"121000"},{key:"fengxian",value:"121006"},{key:"gulouqu",value:"121001"},{key:"jiuliqu",value:"121009"},{key:"jiawangqu",value:"121008"},{key:"peixian",value:"121005"},{key:"zuozhou",value:"121011"},{key:"quanshanqu",value:"121007"},{key:"zuoningxian",value:"121003"},{key:"tongshanxian",value:"121004"},{key:"xinyi",value:"121002"},{key:"yunlongqu",value:"121010"},{key:"yancheng",value:"121100"},{key:"binhaixian",value:"121104"},{key:"dafeng",value:"121109"},{key:"dongtai",value:"121108"},{key:"funingxian",value:"121105"},{key:"jianhuxian",value:"121107"},{key:"sheyangxian",value:"121106"},{key:"tinghuqu",value:"121101"},{key:"xiangshuixian",value:"121103"},{key:"yanduqu",value:"121102"},{key:"yangzhou",value:"121200"},{key:"baoyingxian",value:"121204"},{key:"guanglingqu",value:"121201"},{key:"gaoyou",value:"121206"},{key:"zuojiangqu",value:"121202"},{key:"jiangdu",value:"121207"},{key:"yizheng",value:"121205"},{key:"zhenjiang",value:"121300"},{key:"dantuqu",value:"121303"},{key:"danyang",value:"121304"},{key:"jingkouqu",value:"121301"},{key:"jurong",value:"121306"},{key:"runzhouqu",value:"121302"},{key:"yangzhong",value:"121305"},{key:"jiangxi",value:"130000"},{key:"fuzhou",value:"130200"},{key:"chongrenxian",value:"130207"},{key:"dongxiangxian",value:"130202"},{key:"guangchangxian",value:"130211"},{key:"jinxixian",value:"130204"},{key:"leanxian",value:"130206"},{key:"linchuanqu",value:"130201"},{key:"lichuanxian",value:"130209"},{key:"nanchengxian",value:"130210"},{key:"nanfengxian",value:"130208"},{key:"yihuangxian",value:"130205"},{key:"zixixian",value:"130203"},{key:"ganzhou",value:"130300"},{key:"anyuanxian",value:"130312"},{key:"chongyixian",value:"130313"},{key:"dingnanxian",value:"130310"},{key:"dayuxian",value:"130315"},{key:"ganxian",value:"130317"},{key:"huichangxian",value:"130305"},{key:"longnanxian",value:"130311"},{key:"ningduxian",value:"130308"},{key:"nankang",value:"130318"},{key:"quannanxian",value:"130309"},{key:"ruijin",value:"130302"},{key:"shichengxian",value:"130303"},{key:"shangyouxian",value:"130314"},{key:"xinfengxian",value:"130316"},{key:"xingguoxian",value:"130306"},{key:"xunwuxian",value:"130304"},{key:"yuduxian",value:"130307"},{key:"zhanggongqu",value:"130301"},{key:"jian",value:"130400"},{key:"anfuxian",value:"130403"},{key:"jianxian",value:"130411"},{key:"jinggangshan",value:"130413"},{key:"jishuixian",value:"130410"},{key:"jizhouqu",value:"130401"},{key:"qingyuanqu",value:"130412"},{key:"suichuanxian",value:"130405"},{key:"taihexian",value:"130406"},{key:"wananxian",value:"130404"},{key:"xinganxian",value:"130408"},{key:"xiajiangxian",value:"130409"},{key:"yongfengxian",value:"130407"},{key:"yongxinxian",value:"130402"},{key:"jingdezhen",value:"130500"},{key:"changjiangqu",value:"130501"},{key:"fuliangxian",value:"130503"},{key:"leping",value:"130504"},{key:"zhushanqu",value:"130502"},{key:"jiujiang",value:"130600"},{key:"deanxian",value:"130606"},{key:"duchangxian",value:"130604"},{key:"hukouxian",value:"130603"},{key:"jiujiangxian",value:"130610"},{key:"lushanqu",value:"130601"},{key:"pengzexian",value:"130602"},{key:"ruichang",value:"130612"},{key:"wuningxian",value:"130609"},{key:"xiushuixian",value:"130608"},{key:"zuoyangqu",value:"130611"},{key:"xingzixian",value:"130605"},{key:"yongxiuxian",value:"130607"},{key:"nanchang",value:"130100"},{key:"anyixian",value:"130108"},{key:"donghuqu",value:"130101"},{key:"jinxianxian",value:"130109"},{key:"nanchangxian",value:"130106"},{key:"qingshanhuqu",value:"130105"},{key:"qingyunpuqu",value:"130103"},{key:"wanliqu",value:"130104"},{key:"xihuqu",value:"130102"},{key:"xinjianxian",value:"130107"},{key:"pingxiang",value:"130700"},{key:"anyuanqu",value:"130701"},{key:"lianhuaxian",value:"130703"},{key:"luxixian",value:"130705"},{key:"shanglixian",value:"130704"},{key:"xiangdongqu",value:"130702"},{key:"shangrao",value:"130800"},{key:"dexing",value:"130812"},{key:"guangfengxian",value:"130810"},{key:"hengfengxian",value:"130807"},{key:"zuoyangxian",value:"130804"},{key:"qianshanxian",value:"130808"},{key:"shangraoxian",value:"130811"},{key:"wannianxian",value:"130803"},{key:"zuoyuanxian",value:"130802"},{key:"xinzhouqu",value:"130801"},{key:"yuganxian",value:"130805"},{key:"yushanxian",value:"130809"},{key:"zuoyangxian",value:"130806"},{key:"xinyu",value:"130900"},{key:"fenyixian",value:"130902"},{key:"yushuiqu",value:"130901"},{key:"yichun",value:"131000"},{key:"fengcheng",value:"131003"},{key:"fengxinxian",value:"131009"},{key:"gaoan",value:"131010"},{key:"jinganxian",value:"131005"},{key:"shanggaoxian",value:"131007"},{key:"tongguxian",value:"131004"},{key:"wanzaixian",value:"131008"},{key:"yifengxian",value:"131006"},{key:"yuanzhouqu",value:"131001"},{key:"zhangshu",value:"131002"},{key:"yingtan",value:"131100"},{key:"guixi",value:"131103"},{key:"yuehuqu",value:"131101"},{key:"yujiangxian",value:"131102"},{key:"liaoning",value:"620000"},{key:"anshan",value:"620200"},{key:"haicheng",value:"620207"},{key:"lishanqu",value:"620203"},{key:"qianshanqu",value:"620204"},{key:"taianxian",value:"620205"},{key:"tiedongqu",value:"620201"},{key:"tiexiqu",value:"620202"},{key:"zuoyanxian",value:"620206"},{key:"benxi",value:"620300"},{key:"benxixian",value:"620305"},{key:"huanrenxian",value:"620306"},{key:"mingshanqu",value:"620303"},{key:"nanfenqu",value:"620304"},{key:"pingshanqu",value:"620301"},{key:"xihuqu",value:"620302"},{key:"chaoyang",value:"620400"},{key:"beipiao",value:"620406"},{key:"chaoyangxian",value:"620403"},{key:"jianpingxian",value:"620404"},{key:"kazuoxian",value:"620405"},{key:"longchengqu",value:"620402"},{key:"lingyuan",value:"620407"},{key:"shuangtaqu",value:"620401"},{key:"dandong",value:"620500"},{key:"donggang",value:"620505"},{key:"fengcheng",value:"620506"},{key:"kuandianxian",value:"620504"},{key:"yuanbaoqu",value:"620501"},{key:"zhenanqu",value:"620503"},{key:"zhenxingqu",value:"620502"},{key:"dalian",value:"620600"},{key:"ganjingziqu",value:"620607"},{key:"jinzhouqu",value:"620605"},{key:"lvshunkouqu",value:"620606"},{key:"pulandian",value:"620602"},{key:"shahekouqu",value:"620608"},{key:"wafangdian",value:"620603"},{key:"xigangqu",value:"620609"},{key:"zhuanghe",value:"620610"},{key:"changhaixian",value:"620604"},{key:"zhongshanqu",value:"620601"},{key:"fushun",value:"620700"},{key:"dongzhouqu",value:"620702"},{key:"fushunxian",value:"620705"},{key:"qingyuanxian",value:"620707"},{key:"shunchengqu",value:"620704"},{key:"wanghuaqu",value:"620703"},{key:"xinbinxian",value:"620706"},{key:"xinfuqu",value:"620701"},{key:"fuxin",value:"620800"},{key:"fuxinxian",value:"620806"},{key:"haizhouqu",value:"620801"},{key:"qinghemenqu",value:"620804"},{key:"taipingqu",value:"620803"},{key:"xihequ",value:"620805"},{key:"xinqiuqu",value:"620802"},{key:"zhangwuxian",value:"620807"},{key:"huludao",value:"620900"},{key:"jianchangxian",value:"620905"},{key:"longgangqu",value:"620902"},{key:"lianshanqu",value:"620901"},{key:"nanpiaoqu",value:"620903"},{key:"suizhongxian",value:"620904"},{key:"xingcheng",value:"620906"},{key:"jinzhou",value:"621000"},{key:"beining",value:"621007"},{key:"gutaqu",value:"621001"},{key:"heishanxian",value:"621004"},{key:"linghai",value:"621006"},{key:"linghequ",value:"621002"},{key:"taihequ",value:"621003"},{key:"yixian",value:"621005"},{key:"liaoyang",value:"621100"},{key:"baitaqu",value:"621101"},{key:"dengta",value:"621107"},{key:"gongchanglingqu",value:"621104"},{key:"hongweiqu",value:"621103"},{key:"liaoyangxian",value:"621106"},{key:"taizihequ",value:"621105"},{key:"wenshengqu",value:"621102"},{key:"panjin",value:"621200"},{key:"dawaxian",value:"621203"},{key:"panshanxian",value:"621204"},{key:"shuangtaiziqu",value:"621201"},{key:"xinglongtaiqu",value:"621202"},{key:"shenyang",value:"620100"},{key:"dadongqu",value:"620111"},{key:"donglingqu",value:"620107"},{key:"fakuxian",value:"620102"},{key:"huangguqu",value:"620110"},{key:"hepingqu",value:"620101"},{key:"kangpingxian",value:"620103"},{key:"liaozhongxian",value:"620104"},{key:"shenhequ",value:"620112"},{key:"sujiatunqu",value:"620108"},{key:"tiexiqu",value:"620109"},{key:"xinchengziqu",value:"620106"},{key:"xinmin",value:"620113"},{key:"yuhongqu",value:"620105"},{key:"tieling",value:"621300"},{key:"changtuxian",value:"621305"},{key:"diaobingshan",value:"621306"},{key:"kaiyuan",value:"621307"},{key:"qinghequ",value:"621302"},{key:"tielingxian",value:"621303"},{key:"xifengxian",value:"621304"},{key:"yinzhouqu",value:"621301"},{key:"yingkou",value:"621400"},{key:"zuoyuquanqu",value:"621403"},{key:"dashiqiao",value:"621406"},{key:"gaizhou",value:"621405"},{key:"laobianqu",value:"621404"},{key:"xishiqu",value:"621402"},{key:"zhanqianqu",value:"621401"},{key:"neimenggu",value:"520000"},{key:"alashanmeng",value:"520200"},{key:"alashanyouqi",value:"520202"},{key:"alashanzuoqi",value:"520201"},{key:"ejinaqi",value:"520203"},{key:"baotou",value:"520300"},{key:"baiyunkuangqu",value:"520305"},{key:"donghequ",value:"520301"},{key:"damaoqi",value:"520309"},{key:"guyangxian",value:"520308"},{key:"jiuyuanqu",value:"520306"},{key:"kundulunqu",value:"520302"},{key:"qingshanqu",value:"520303"},{key:"shiguaiqu",value:"520304"},{key:"tuyouqi",value:"520307"},{key:"bayannaoer",value:"520400"},{key:"zuokouxian",value:"520403"},{key:"hangjinhouqi",value:"520407"},{key:"linhequ",value:"520401"},{key:"wulatehouqi",value:"520406"},{key:"wulateqianqi",value:"520404"},{key:"wulatezhongqi",value:"520405"},{key:"wuyuanxian",value:"520402"},{key:"chifeng",value:"520500"},{key:"aohanqi",value:"520512"},{key:"aqi",value:"520509"},{key:"balinyouqi",value:"520507"},{key:"balinzuoqi",value:"520508"},{key:"hongshanqu",value:"520501"},{key:"kalaqinqi",value:"520503"},{key:"keshiketengqi",value:"520505"},{key:"linxixian",value:"520506"},{key:"ningchengxian",value:"520502"},{key:"songshanqu",value:"520510"},{key:"wengniuteqi",value:"520504"},{key:"yuanbaoshanqu",value:"520511"},{key:"eerduosi",value:"520600"},{key:"dalateqi",value:"520602"},{key:"dongshengqu",value:"520601"},{key:"etuokeqi",value:"520605"},{key:"etuokeqianqi",value:"520604"},{key:"hangjinqi",value:"520606"},{key:"wushenqi",value:"520607"},{key:"yijinhuoluoqi",value:"520608"},{key:"zhungeerqi",value:"520603"},{key:"huhehaote",value:"520100"},{key:"helingeerxian",value:"520107"},{key:"huiminqu",value:"520102"},{key:"qingshuihexian",value:"520108"},{key:"saihanqu",value:"520104"},{key:"tuoketuoxian",value:"520106"},{key:"tumotezuoqi",value:"520105"},{key:"wuchuanxian",value:"520109"},{key:"xinchengqu",value:"520101"},{key:"yuquanqu",value:"520103"},{key:"hulunbeier",value:"520700"},{key:"arongqi",value:"520712"},{key:"chenbaerhuqi",value:"520708"},{key:"eerguna",value:"520702"},{key:"elunchun",value:"520710"},{key:"ewenkezu",value:"520709"},{key:"genhe",value:"520713"},{key:"hailaerqu",value:"520701"},{key:"moqi",value:"520711"},{key:"manzhouli",value:"520705"},{key:"xinyouqi",value:"520706"},{key:"xinzuoqi",value:"520707"},{key:"yakeshi",value:"520704"},{key:"zhalantun",value:"520703"},{key:"tongliao",value:"520800"},{key:"huolinguole",value:"520808"},{key:"keerqinqu",value:"520801"},{key:"kulunqi",value:"520805"},{key:"kailuxian",value:"520804"},{key:"kezuohouqi",value:"520803"},{key:"kezuozhongqi",value:"520802"},{key:"naimanqi",value:"520806"},{key:"zhaluteqi",value:"520807"},{key:"wuhai",value:"520900"},{key:"haibowanqu",value:"520901"},{key:"hainanqu",value:"520902"},{key:"wudaqu",value:"520903"},{key:"wulanchabu",value:"521000"},{key:"chayouhouqi",value:"521003"},{key:"chayouqianqi",value:"521005"},{key:"chayouzhongqi",value:"521004"},{key:"fengzhen",value:"521011"},{key:"huadexian",value:"521009"},{key:"jiningqu",value:"521001"},{key:"liangchengxian",value:"521006"},{key:"shangduxian",value:"521008"},{key:"siziwangqi",value:"521002"},{key:"xinghexian",value:"521007"},{key:"zhuozixian",value:"521010"},{key:"xinganmeng",value:"521100"},{key:"aershan",value:"521102"},{key:"keyouqianqi",value:"521103"},{key:"keyouzhongqi",value:"521104"},{key:"tuquanxian",value:"521106"},{key:"wulanhaote",value:"521101"},{key:"zhazuoteqi",value:"521105"},{key:"xilinguole",value:"521200"},{key:"abagaqi",value:"521210"},{key:"duolunxian",value:"521212"},{key:"dongwuqi",value:"521207"},{key:"erlianhaote",value:"521201"},{key:"suniteyouqi",value:"521208"},{key:"sunitezuoqi",value:"521209"},{key:"taipusiqi",value:"521205"},{key:"xianghuangqi",value:"521204"},{key:"xilinhaote",value:"521211"},{key:"xiwuqi",value:"521206"},{key:"zhenglanqi",value:"521202"},{key:"zhengxiangbaiqi",value:"521203"},{key:"ningxia",value:"410000"},{key:"guyuan",value:"410200"},{key:"zuoyuanxian",value:"410204"},{key:"longdexian",value:"410203"},{key:"pengyangxian",value:"410205"},{key:"xijixian",value:"410202"},{key:"yuanzhouqu",value:"410201"},{key:"shizuishan",value:"410300"},{key:"dawukouqu",value:"410301"},{key:"huinongqu",value:"410302"},{key:"pingluoxian",value:"410303"},{key:"wuzhong",value:"410400"},{key:"litongqu",value:"410401"},{key:"qingtongxia",value:"410404"},{key:"tongxinxian",value:"410403"},{key:"yanchixian",value:"410402"},{key:"yinchuan",value:"410100"},{key:"helanxian",value:"410105"},{key:"jinfengqu",value:"410103"},{key:"lingwu",value:"410106"},{key:"xingqingqu",value:"410101"},{key:"xixiaqu",value:"410102"},{key:"yongningxian",value:"410104"},{key:"zhongwei",value:"410500"},{key:"haiyuanxian",value:"410503"},{key:"shapotouqu",value:"410501"},{key:"zhongningxian",value:"410502"},{key:"qinghai",value:"420000"},{key:"guoluozhou",value:"420200"},{key:"banmaxian",value:"420202"},{key:"darixian",value:"420204"},{key:"gandexian",value:"420203"},{key:"jiuzhixian",value:"420205"},{key:"maduoxian",value:"420206"},{key:"maqinxian",value:"420201"},{key:"haibeizhou",value:"420300"},{key:"gangchaxian",value:"420304"},{key:"haizuoxian",value:"420303"},{key:"menyuanxian",value:"420301"},{key:"qilianxian",value:"420302"},{key:"haidong",value:"420400"},{key:"hualongxian",value:"420405"},{key:"huzhuxian",value:"420404"},{key:"leduxian",value:"420403"},{key:"minhexian",value:"420402"},{key:"pinganxian",value:"420401"},{key:"xunhuaxian",value:"420406"},{key:"hainanzhou",value:"420500"},{key:"guidexian",value:"420503"},{key:"gonghexian",value:"420501"},{key:"guinanxian",value:"420505"},{key:"tongdexian",value:"420502"},{key:"xinghaixian",value:"420504"},{key:"huangnanzhou",value:"420600"},{key:"henanmengguzu",value:"420604"},{key:"jianzhaxian",value:"420602"},{key:"tongrenxian",value:"420601"},{key:"zekuxian",value:"420603"},{key:"haixizhou",value:"420700"},{key:"delingha",value:"420702"},{key:"dulanxian",value:"420704"},{key:"geermu",value:"420701"},{key:"tianjunxian",value:"420705"},{key:"wulanxian",value:"420703"},{key:"xining",value:"420100"},{key:"chengbeiqu",value:"420104"},{key:"chengdongqu",value:"420101"},{key:"chengxiqu",value:"420103"},{key:"chengzhongqu",value:"420102"},{key:"datongxian",value:"420105"},{key:"zuoyuanxian",value:"420107"},{key:"zuozhongxian",value:"420106"},{key:"yushuzhou",value:"420800"},{key:"chengduoxian",value:"420803"},{key:"nangqianxian",value:"420805"},{key:"qumalaixian",value:"420806"},{key:"yushuxian",value:"420801"},{key:"zaduoxian",value:"420802"},{key:"zhiduoxian",value:"420804"},{key:"sichuan",value:"320000"},{key:"abazhou",value:"320200"},{key:"abaxian",value:"320203"},{key:"heishuixian",value:"320206"},{key:"hongyuanxian",value:"320213"},{key:"jinchuanxian",value:"320208"},{key:"jiuzhaigouxian",value:"320209"},{key:"lixian",value:"320212"},{key:"maerkangxian",value:"320205"},{key:"maoxian",value:"320211"},{key:"ruoergaixian",value:"320202"},{key:"rangtangxian",value:"320204"},{key:"songpanxian",value:"320210"},{key:"zuochuanxian",value:"320201"},{key:"xiaojinxian",value:"320207"},{key:"bazhong",value:"320300"},{key:"bazhouqu",value:"320301"},{key:"nanjiangxian",value:"320303"},{key:"pingchangxian",value:"320304"},{key:"tongjiangxian",value:"320302"},{key:"chengdu",value:"320100"},{key:"chenghuaqu",value:"320115"},{key:"chongzhou",value:"320119"},{key:"dujiangyan",value:"320104"},{key:"dayixian",value:"320107"},{key:"jinjiangqu",value:"320101"},{key:"jinniuqu",value:"320117"},{key:"jintangxian",value:"320110"},{key:"longquanzuoqu",value:"320114"},{key:"pujiangxian",value:"320106"},{key:"zuoxian",value:"320108"},{key:"pengzhou",value:"320103"},{key:"qingbaijiangqu",value:"320113"},{key:"zuozuo",value:"320102"},{key:"qingyangqu",value:"320118"},{key:"shuangliuxian",value:"320109"},{key:"wuhouqu",value:"320116"},{key:"wenjiangqu",value:"320111"},{key:"xinduqu",value:"320112"},{key:"xinjinxian",value:"320105"},{key:"deyang",value:"320400"},{key:"guanghan",value:"320404"},{key:"zuoyangqu",value:"320401"},{key:"luojiangxian",value:"320403"},{key:"mianzhu",value:"320406"},{key:"shizuo",value:"320405"},{key:"zhongjiangxian",value:"320402"},{key:"dazhou",value:"320500"},{key:"daxian",value:"320502"},{key:"dazhuxian",value:"320505"},{key:"kaijiangxian",value:"320504"},{key:"quxian",value:"320506"},{key:"tongchuanqu",value:"320501"},{key:"wanyuan",value:"320507"},{key:"xuanhanxian",value:"320503"},{key:"guangan",value:"320600"},{key:"guanganqu",value:"320601"},{key:"huaying",value:"320605"},{key:"linshuixian",value:"320604"},{key:"wushengxian",value:"320603"},{key:"yuechixian",value:"320602"},{key:"guangyuan",value:"320700"},{key:"chaotianqu",value:"320703"},{key:"cangxixian",value:"320707"},{key:"jiangexian",value:"320706"},{key:"qingchuanxian",value:"320705"},{key:"shizhongqu",value:"320701"},{key:"wangcangxian",value:"320704"},{key:"yuanbaqu",value:"320702"},{key:"ganzicangzu",value:"320800"},{key:"batangxian",value:"320804"},{key:"baiyuxian",value:"320808"},{key:"danbaxian",value:"320816"},{key:"daochengxian",value:"320802"},{key:"daozuoxian",value:"320813"},{key:"degexian",value:"320809"},{key:"derongxian",value:"320818"},{key:"ganzixian",value:"320811"},{key:"jiulongxian",value:"320815"},{key:"kangdingxian",value:"320801"},{key:"zuodingxian",value:"320817"},{key:"luhuoxian",value:"320812"},{key:"litangxian",value:"320805"},{key:"sedaxian",value:"320806"},{key:"shiquxian",value:"320807"},{key:"xiangchengxian",value:"320803"},{key:"xinlongxian",value:"320810"},{key:"yajiangxian",value:"320814"},{key:"leshan",value:"320900"},{key:"liangshanyizu",value:"321000"},{key:"butuoxian",value:"321009"},{key:"dechangxian",value:"321014"},{key:"ganluoxian",value:"321003"},{key:"huidongxian",value:"321012"},{key:"huilixian",value:"321013"},{key:"jinyangxian",value:"321008"},{key:"leiboxian",value:"321017"},{key:"meiguxian",value:"321002"},{key:"mulicangzu",value:"321016"},{key:"mianningxian",value:"321005"},{key:"ningnanxian",value:"321011"},{key:"pugexian",value:"321010"},{key:"xichang",value:"321001"},{key:"xidexian",value:"321006"},{key:"yuexixian",value:"321004"},{key:"yanyuanxian",value:"321015"},{key:"zhaojuexian",value:"321007"},{key:"ebianxian",value:"320903"},{key:"emeishan",value:"320911"},{key:"jiajiangxian",value:"320905"},{key:"jinkouhequ",value:"320908"},{key:"zuoweixian",value:"320907"},{key:"jingyanxian",value:"320906"},{key:"mabianxian",value:"320902"},{key:"zuochuanxian",value:"320904"},{key:"shawanqu",value:"320910"},{key:"shizhongqu",value:"320901"},{key:"wutongqiaoqu",value:"320909"},{key:"zuozhou",value:"321100"},{key:"guzuoxian",value:"321107"},{key:"hejiangxian",value:"321105"},{key:"jiangyangqu",value:"321101"},{key:"longmatanqu",value:"321103"},{key:"zuoxian",value:"321104"},{key:"naxiqu",value:"321102"},{key:"xuyongxian",value:"321106"},{key:"meishan",value:"321200"},{key:"danlengxian",value:"321205"},{key:"dongpoqu",value:"321201"},{key:"hongyaxian",value:"321204"},{key:"pengshanxian",value:"321203"},{key:"qingshenxian",value:"321206"},{key:"renshouxian",value:"321202"},{key:"mianyang",value:"321300"},{key:"anxian",value:"321305"},{key:"beichuanqiangzu",value:"321307"},{key:"fuchengqu",value:"321301"},{key:"jiangyou",value:"321309"},{key:"pingwuxian",value:"321308"},{key:"santaixian",value:"321303"},{key:"yantingxian",value:"321304"},{key:"youxianqu",value:"321302"},{key:"zuozuoxian",value:"321306"},{key:"nanchong",value:"321400"},{key:"gaopingqu",value:"321402"},{key:"jialingqu",value:"321403"},{key:"zuozhong",value:"321409"},{key:"nanbuxian",value:"321404"},{key:"penganxian",value:"321406"},{key:"shunqingqu",value:"321401"},{key:"xichongxian",value:"321408"},{key:"yilongxian",value:"321407"},{key:"yingshanxian",value:"321405"},{key:"neijiang",value:"321500"},{key:"dongxingqu",value:"321502"},{key:"longchangxian",value:"321505"},{key:"shizhongqu",value:"321501"},{key:"weiyuanxian",value:"321503"},{key:"zizhongxian",value:"321504"},{key:"panzhihua",value:"321600"},{key:"dongqu",value:"321601"},{key:"miyixian",value:"321604"},{key:"renhequ",value:"321603"},{key:"xiqu",value:"321602"},{key:"yanbianxian",value:"321605"},{key:"suining",value:"321700"},{key:"anjuqu",value:"321702"},{key:"chuanshanqu",value:"321701"},{key:"dayingxian",value:"321705"},{key:"pengxixian",value:"321703"},{key:"shehongxian",value:"321704"},{key:"yaan",value:"321800"},{key:"baoxingxian",value:"321808"},{key:"hanyuanxian",value:"321804"},{key:"lushanxian",value:"321807"},{key:"mingshanxian",value:"321802"},{key:"shimianxian",value:"321805"},{key:"tianquanxian",value:"321806"},{key:"yuchengqu",value:"321801"},{key:"zuojingxian",value:"321803"},{key:"yibin",value:"321900"},{key:"cuipingqu",value:"321901"},{key:"gaoxian",value:"321905"},{key:"zuoxian",value:"321904"},{key:"jianganxian",value:"321907"},{key:"nanxixian",value:"321908"},{key:"pingshanxian",value:"321910"},{key:"xingwenxian",value:"321902"},{key:"yibinxian",value:"321909"},{key:"zuolianxian",value:"321903"},{key:"changningxian",value:"321906"},{key:"zigong",value:"322000"},{key:"daanqu",value:"322003"},{key:"fushunxian",value:"322006"},{key:"gongjingqu",value:"322002"},{key:"rongxian",value:"322005"},{key:"yantanqu",value:"322004"},{key:"ziliujingqu",value:"322001"},{key:"ziyang",value:"322100"},{key:"anyuexian",value:"322102"},{key:"jianyang",value:"322104"},{key:"lezhixian",value:"322103"},{key:"yanjiangqu",value:"322101"},{key:"shandong",value:"140000"},{key:"binzhou",value:"140200"},{key:"binchengqu",value:"140201"},{key:"boxingxian",value:"140206"},{key:"huiminxian",value:"140202"},{key:"wuzuoxian",value:"140204"},{key:"yangxinxian",value:"140203"},{key:"zhanhuaxian",value:"140205"},{key:"zoupingxian",value:"140207"},{key:"dongying",value:"140300"},{key:"dongyingqu",value:"140301"},{key:"guangraoxian",value:"140305"},{key:"hekouqu",value:"140302"},{key:"kenlixian",value:"140303"},{key:"lijinxian",value:"140304"},{key:"dezhou",value:"140400"},{key:"dechengqu",value:"140401"},{key:"leling",value:"140402"},{key:"lingxian",value:"140410"},{key:"linyixian",value:"140407"},{key:"ningjinxian",value:"140409"},{key:"pingyuanxian",value:"140405"},{key:"qihexian",value:"140406"},{key:"qingyunxian",value:"140408"},{key:"wuchengxian",value:"140403"},{key:"xiajinxian",value:"140404"},{key:"yucheng",value:"140411"},{key:"heze",value:"140500"},{key:"chengwuxian",value:"140504"},{key:"caoxian",value:"140502"},{key:"dongmingxian",value:"140509"},{key:"dingtaoxian",value:"140508"},{key:"danxian",value:"140503"},{key:"zuochengxian",value:"140507"},{key:"juyexian",value:"140505"},{key:"mudanqu",value:"140501"},{key:"zuochengxian",value:"140506"},{key:"jining",value:"140600"},{key:"jinan",value:"140100"},{key:"huaiyinqu",value:"140108"},{key:"jiyangxian",value:"140103"},{key:"lichengqu",value:"140106"},{key:"lixiaqu",value:"140101"},{key:"pingyinxian",value:"140104"},{key:"shanghexian",value:"140102"},{key:"shizhongqu",value:"140109"},{key:"tianqiaoqu",value:"140107"},{key:"zhangqiu",value:"140110"},{key:"changqingqu",value:"140105"},{key:"jiaxiangxian",value:"140607"},{key:"jinxiangxian",value:"140608"},{key:"liangshanxian",value:"140604"},{key:"qufu",value:"140603"},{key:"renchengqu",value:"140611"},{key:"zuoshuixian",value:"140605"},{key:"shizhongqu",value:"140601"},{key:"weishanxian",value:"140610"},{key:"zuoshangxian",value:"140606"},{key:"yutaixian",value:"140609"},{key:"zuozhou",value:"140602"},{key:"zoucheng",value:"140612"},{key:"liaocheng",value:"140700"},{key:"zuopingxian",value:"140704"},{key:"dongaxian",value:"140705"},{key:"dongchangfuqu",value:"140701"},{key:"gaotangxian",value:"140707"},{key:"guanxian",value:"140706"},{key:"linqing",value:"140708"},{key:"zuoxian",value:"140703"},{key:"yangguxian",value:"140702"},{key:"laiwu",value:"140800"},{key:"gangchengqu",value:"140802"},{key:"laichengqu",value:"140801"},{key:"linyi",value:"140900"},{key:"cangshanxian",value:"140906"},{key:"feixian",value:"140905"},{key:"hedongqu",value:"140910"},{key:"zuonanxian",value:"140903"},{key:"lanshanqu",value:"140901"},{key:"linzuoxian",value:"140912"},{key:"luozhuangqu",value:"140911"},{key:"mengyinxian",value:"140902"},{key:"pingyixian",value:"140904"},{key:"zuochengxian",value:"140908"},{key:"yinanxian",value:"140909"},{key:"yishuixian",value:"140907"},{key:"qingdao",value:"141000"},{key:"chengyangqu",value:"141006"},{key:"huangdaoqu",value:"141009"},{key:"jimo",value:"141004"},{key:"jiaonan",value:"141002"},{key:"jiaozhou",value:"141005"},{key:"licangqu",value:"141007"},{key:"zuoshanqu",value:"141008"},{key:"laixi",value:"141012"},{key:"pingdu",value:"141003"},{key:"shibeiqu",value:"141011"},{key:"sifangqu",value:"141010"},{key:"shinanqu",value:"141001"},{key:"rizhao",value:"141100"},{key:"donggangqu",value:"141101"},{key:"zuoxian",value:"141104"},{key:"zuoshanqu",value:"141102"},{key:"wulianxian",value:"141103"},{key:"taian",value:"141200"},{key:"dongpingxian",value:"141204"},{key:"zuoyuequ",value:"141202"},{key:"feicheng",value:"141206"},{key:"ningyangxian",value:"141203"},{key:"taishanqu",value:"141201"},{key:"xintai",value:"141205"},{key:"weifang",value:"141300"},{key:"anqiu",value:"141303"},{key:"changlexian",value:"141307"},{key:"changyi",value:"141312"},{key:"fangziqu",value:"141310"},{key:"gaomi",value:"141302"},{key:"hantingqu",value:"141311"},{key:"kuiwenqu",value:"141309"},{key:"linzuoxian",value:"141308"},{key:"qingzhou",value:"141306"},{key:"shouguang",value:"141304"},{key:"weichengqu",value:"141301"},{key:"zhucheng",value:"141305"},{key:"weihai",value:"141400"},{key:"huancuiqu",value:"141401"},{key:"rongcheng",value:"141403"},{key:"rushan",value:"141404"},{key:"wendeng",value:"141402"},{key:"yantai",value:"141500"},{key:"fushanqu",value:"141511"},{key:"haiyang",value:"141512"},{key:"longkou",value:"141507"},{key:"laishanqu",value:"141509"},{key:"laiyang",value:"141506"},{key:"laizhou",value:"141505"},{key:"moupingqu",value:"141510"},{key:"penglai",value:"141504"},{key:"qixia",value:"141502"},{key:"changdaoxian",value:"141508"},{key:"zhizuoqu",value:"141501"},{key:"zhaoyuan",value:"141503"},{key:"zibo",value:"141600"},{key:"boshanqu",value:"141603"},{key:"gaoqingxian",value:"141607"},{key:"huantaixian",value:"141606"},{key:"linziqu",value:"141604"},{key:"yiyuanxian",value:"141608"},{key:"zichuanqu",value:"141601"},{key:"zhoucunqu",value:"141605"},{key:"zhangdianqu",value:"141602"},{key:"zaozhuang",value:"141700"},{key:"shantingqu",value:"141705"},{key:"shizhongqu",value:"141701"},{key:"taierzhuangqu",value:"141704"},{key:"zuozhou",value:"141706"},{key:"xuechengqu",value:"141702"},{key:"zuochengqu",value:"141703"},{key:"shanghai",value:"150000"},{key:"shanxi",value:"430000"},{key:"ankang",value:"430200"},{key:"baihexian",value:"430210"},{key:"hanbinqu",value:"430201"},{key:"hanyinxian",value:"430209"},{key:"zuogaoxian",value:"430205"},{key:"ningshanxian",value:"430207"},{key:"pinglixian",value:"430204"},{key:"shiquanxian",value:"430208"},{key:"xunyangxian",value:"430202"},{key:"zhenpingxian",value:"430203"},{key:"ziyangxian",value:"430206"},{key:"baoji",value:"430300"},{key:"chencangqu",value:"430310"},{key:"fufengxian",value:"430307"},{key:"fengxian",value:"430302"},{key:"fengxiangxian",value:"430309"},{key:"jintaiqu",value:"430311"},{key:"longxian",value:"430305"},{key:"zuoyouxian",value:"430303"},{key:"meixian",value:"430306"},{key:"zuoshanxian",value:"430308"},{key:"qianyangxian",value:"430304"},{key:"taibaixian",value:"430312"},{key:"weibinqu",value:"430301"},{key:"hanzhong",value:"430400"},{key:"chengguxian",value:"430409"},{key:"fopingxian",value:"430411"},{key:"hantaiqu",value:"430401"},{key:"liubaxian",value:"430402"},{key:"lueyangxian",value:"430404"},{key:"mianxian",value:"430406"},{key:"ningqiangxian",value:"430405"},{key:"nanzhengxian",value:"430410"},{key:"xixiangxian",value:"430407"},{key:"yangxian",value:"430408"},{key:"zhenbaxian",value:"430403"},{key:"shangluo",value:"430500"},{key:"danfengxian",value:"430503"},{key:"luonanxian",value:"430502"},{key:"shangnanxian",value:"430504"},{key:"shanyangxian",value:"430505"},{key:"shangzhouqu",value:"430501"},{key:"zhenanxian",value:"430506"},{key:"zuoshuixian",value:"430507"},{key:"tongchuan",value:"430600"},{key:"wangyiqu",value:"430601"},{key:"yijunxian",value:"430604"},{key:"yintaiqu",value:"430602"},{key:"yaozhouqu",value:"430603"},{key:"weinan",value:"430700"},{key:"baishuixian",value:"430704"},{key:"chengchengxian",value:"430706"},{key:"dalixian",value:"430708"},{key:"fupingxian",value:"430703"},{key:"hancheng",value:"430702"},{key:"huaxian",value:"430710"},{key:"huayin",value:"430711"},{key:"heyangxian",value:"430707"},{key:"linweiqu",value:"430701"},{key:"puchengxian",value:"430705"},{key:"zuoguanxian",value:"430709"},{key:"xian",value:"430100"},{key:"beilinqu",value:"430112"},{key:"zuoqiaoqu",value:"430110"},{key:"gaolingxian",value:"430113"},{key:"huxian",value:"430102"},{key:"lianhuqu",value:"430111"},{key:"linzuoqu",value:"430106"},{key:"lantianxian",value:"430104"},{key:"weiyangqu",value:"430109"},{key:"xinchengqu",value:"430101"},{key:"yanliangqu",value:"430107"},{key:"yantaqu",value:"430108"},{key:"changanqu",value:"430105"},{key:"zhouzhixian",value:"430103"},{key:"xianyang",value:"430800"},{key:"binxian",value:"430806"},{key:"chunhuaxian",value:"430803"},{key:"zuoyangxian",value:"430810"},{key:"liquanxian",value:"430808"},{key:"qinduqu",value:"430801"},{key:"qianxian",value:"430809"},{key:"sanyuanxian",value:"430811"},{key:"weichengqu",value:"430812"},{key:"wugongxian",value:"430802"},{key:"xingping",value:"430814"},{key:"xunyixian",value:"430804"},{key:"yanglingqu",value:"430813"},{key:"yongshouxian",value:"430807"},{key:"changwuxian",value:"430805"},{key:"yanan",value:"430900"},{key:"ansaixian",value:"430909"},{key:"baotaqu",value:"430901"},{key:"fuxian",value:"430905"},{key:"ganquanxian",value:"430906"},{key:"huanglongxian",value:"430902"},{key:"huanglingxian",value:"430913"},{key:"luochuanxian",value:"430904"},{key:"wuqixian",value:"430907"},{key:"yanchuanxian",value:"430911"},{key:"yichuanxian",value:"430903"},{key:"yanchangxian",value:"430912"},{key:"zhidanxian",value:"430908"},{key:"zichangxian",value:"430910"},{key:"yulin",value:"431000"},{key:"dingbianxian",value:"431007"},{key:"fuguxian",value:"431010"},{key:"hengshanxian",value:"431009"},{key:"jingbianxian",value:"431008"},{key:"jiaxian",value:"431004"},{key:"mizhixian",value:"431005"},{key:"qingjianxian",value:"431002"},{key:"suidexian",value:"431006"},{key:"shenmuxian",value:"431011"},{key:"wubaoxian",value:"431003"},{key:"yuyangqu",value:"431001"},{key:"zizhouxian",value:"431012"},{key:"shanghai",value:"150100"},{key:"baoshanqu",value:"150108"},{key:"fengxianqu",value:"150118"},{key:"hongkouqu",value:"150111"},{key:"huangpuqu",value:"150101"},{key:"jinganqu",value:"150114"},{key:"jiadingqu",value:"150107"},{key:"jinshanqu",value:"150105"},{key:"luwanqu",value:"150117"},{key:"minhangqu",value:"150109"},{key:"nanhuiqu",value:"150102"},{key:"pudongxinqu",value:"150106"},{key:"putuoqu",value:"150113"},{key:"qingpuqu",value:"150103"},{key:"songjiangqu",value:"150104"},{key:"xuhuiqu",value:"150116"},{key:"yangpuqu",value:"150110"},{key:"zhabeiqu",value:"150112"},{key:"changningqu",value:"150115"},{key:"shanxi",value:"530000"},{key:"datong",value:"530200"},{key:"chengqu",value:"530201"},{key:"datongxian",value:"530211"},{key:"guanglingxian",value:"530205"},{key:"hunyuanxian",value:"530203"},{key:"kuangqu",value:"530210"},{key:"lingqiuxian",value:"530204"},{key:"nanjiaoqu",value:"530209"},{key:"tianzhenxian",value:"530206"},{key:"xinrongqu",value:"530208"},{key:"yanggaoxian",value:"530207"},{key:"zuoyunxian",value:"530202"},{key:"jincheng",value:"530300"},{key:"chengqu",value:"530301"},{key:"gaoping",value:"530306"},{key:"lingchuanxian",value:"530304"},{key:"qinshuixian",value:"530302"},{key:"yangchengxian",value:"530303"},{key:"zezhouxian",value:"530305"},{key:"jinzhong",value:"530400"},{key:"heshunxian",value:"530408"},{key:"jiexiu",value:"530411"},{key:"lingshixian",value:"530402"},{key:"pingyaoxian",value:"530403"},{key:"qixian",value:"530404"},{key:"shouyangxian",value:"530406"},{key:"taiguxian",value:"530405"},{key:"xiyangxian",value:"530407"},{key:"yuciqu",value:"530401"},{key:"yushexian",value:"530410"},{key:"zuoquanxian",value:"530409"},{key:"linfen",value:"530500"},{key:"anzexian",value:"530511"},{key:"daningxian",value:"530507"},{key:"fushanxian",value:"530510"},{key:"fenxixian",value:"530503"},{key:"guxian",value:"530512"},{key:"hongdongxian",value:"530513"},{key:"houma",value:"530502"},{key:"huozhou",value:"530517"},{key:"ji",value:"530509"},{key:"puxian",value:"530504"},{key:"quwoxian",value:"530516"},{key:"xiangfenxian",value:"530514"},{key:"xiangningxian",value:"530508"},{key:"zuoxian",value:"530506"},{key:"yichengxian",value:"530515"},{key:"yaoduqu",value:"530501"},{key:"yonghexian",value:"530505"},{key:"lvliang",value:"530600"},{key:"fangshanxian",value:"530605"},{key:"fenyang",value:"530613"},{key:"jiaochengxian",value:"530611"},{key:"jiaokouxian",value:"530603"},{key:"zuoxian",value:"530606"},{key:"liulinxian",value:"530608"},{key:"lishiqu",value:"530601"},{key:"linxian",value:"530609"},{key:"shilouxian",value:"530607"},{key:"wenshuixian",value:"530612"},{key:"xingxian",value:"530610"},{key:"xiaoyi",value:"530602"},{key:"zhongyangxian",value:"530604"},{key:"shuozhou",value:"530700"},{key:"huairenxian",value:"530706"},{key:"pingluqu",value:"530702"},{key:"shuochengqu",value:"530701"},{key:"shanyinxian",value:"530703"},{key:"yingxian",value:"530704"},{key:"youyuxian",value:"530705"},{key:"taiyuan",value:"530100"},{key:"gujiao",value:"530110"},{key:"jiancaopingqu",value:"530107"},{key:"jinyuanqu",value:"530105"},{key:"loufanxian",value:"530102"},{key:"qingxuxian",value:"530104"},{key:"wanbailinqu",value:"530106"},{key:"xiaodianqu",value:"530101"},{key:"xinghualingqu",value:"530108"},{key:"yangquxian",value:"530103"},{key:"yingzequ",value:"530109"},{key:"xinzhou",value:"530800"},{key:"baodexian",value:"530803"},{key:"daixian",value:"530811"},{key:"dingxiangxian",value:"530813"},{key:"fanzhixian",value:"530810"},{key:"hequxian",value:"530804"},{key:"jinglexian",value:"530808"},{key:"zuozuoxian",value:"530805"},{key:"ningwuxian",value:"530809"},{key:"pianguanxian",value:"530802"},{key:"shenchixian",value:"530807"},{key:"wutaixian",value:"530812"},{key:"wuzhaixian",value:"530806"},{key:"xinfuqu",value:"530801"},{key:"yuanping",value:"530814"},{key:"yuncheng",value:"530900"},{key:"hejin",value:"530913"},{key:"zuoshanxian",value:"530909"},{key:"zuoxian",value:"530907"},{key:"linzuoxian",value:"530912"},{key:"pingluxian",value:"530904"},{key:"zuochengxian",value:"530903"},{key:"wanrongxian",value:"530911"},{key:"wenxixian",value:"530910"},{key:"xinzuoxian",value:"530908"},{key:"xiaxian",value:"530905"},{key:"yanhuqu",value:"530901"},{key:"yongji",value:"530902"},{key:"yuanquxian",value:"530906"},{key:"yangquan",value:"531000"},{key:"chengqu",value:"531001"},{key:"kuangqu",value:"531002"},{key:"pingdingxian",value:"531004"},{key:"yuxian",value:"531005"},{key:"changzhi",value:"531100"},{key:"chengqu",value:"531101"},{key:"changzhixian",value:"531111"},{key:"huguanxian",value:"531106"},{key:"lucheng",value:"531113"},{key:"lichengxian",value:"531107"},{key:"pingshunxian",value:"531108"},{key:"qinxian",value:"531103"},{key:"qinyuanxian",value:"531102"},{key:"tunliuxian",value:"531109"},{key:"wuxiangxian",value:"531104"},{key:"xiangyuanxian",value:"531110"},{key:"changzixian",value:"531105"},{key:"tianjin",value:"540000"},{key:"tianjin",value:"540100"},{key:"baozuoqu",value:"540115"},{key:"beichenqu",value:"540103"},{key:"dagangqu",value:"540107"},{key:"dongliqu",value:"540106"},{key:"hebeiqu",value:"540111"},{key:"hedongqu",value:"540114"},{key:"hepingqu",value:"540101"},{key:"hongqiaoqu",value:"540110"},{key:"hexiqu",value:"540113"},{key:"jinnanqu",value:"540104"},{key:"nankaiqu",value:"540112"},{key:"wuqingqu",value:"540102"},{key:"xiqingqu",value:"540105"},{key:"taiwan",value:"810000"},{key:"taiwan",value:"810100"},{key:"taiwan",value:"810101"},{key:"xianggang",value:"820000"},{key:"xianggang",value:"820100"},{key:"xianggang",value:"820101"},{key:"xinjiang",value:"440000"},{key:"akesu",value:"440200"},{key:"akesu",value:"440201"},{key:"awatixian",value:"440208"},{key:"baichengxian",value:"440206"},{key:"kuchexian",value:"440203"},{key:"kepingxian",value:"440209"},{key:"shayaxian",value:"440204"},{key:"wensuxian",value:"440202"},{key:"wushixian",value:"440207"},{key:"xinhexian",value:"440205"},{key:"aletai",value:"440300"},{key:"aletai",value:"440301"},{key:"buerjinxian",value:"440302"},{key:"fuhaixian",value:"440304"},{key:"fuyunxian",value:"440303"},{key:"habahexian",value:"440305"},{key:"jimunaixian",value:"440307"},{key:"qinghexian",value:"440306"},{key:"boertala",value:"440400"},{key:"bole",value:"440401"},{key:"jinghexian",value:"440402"},{key:"wenquanxian",value:"440403"},{key:"bayinguoleng",value:"440500"},{key:"bohuxian",value:"440509"},{key:"hejingxian",value:"440507"},{key:"heshuoxian",value:"440508"},{key:"kuerle",value:"440501"},{key:"luntaixian",value:"440502"},{key:"qiemoxian",value:"440505"},{key:"ruoqiangxian",value:"440504"},{key:"weilixian",value:"440503"},{key:"yanzuoxian",value:"440506"},{key:"changjizhou",value:"440600"},{key:"changji",value:"440601"},{key:"fukang",value:"440602"},{key:"hutubixian",value:"440604"},{key:"jimusaerxian",value:"440607"},{key:"muleixian",value:"440608"},{key:"manasixian",value:"440605"},{key:"miquan",value:"440603"},{key:"qitaixian",value:"440606"},{key:"hami",value:"440700"},{key:"balikun",value:"440702"},{key:"hami",value:"440701"},{key:"yiwuxian",value:"440703"},{key:"hetian",value:"440800"},{key:"celexian",value:"440806"},{key:"hetian",value:"440801"},{key:"hetianxian",value:"440802"},{key:"luopuxian",value:"440805"},{key:"minfengxian",value:"440808"},{key:"moyuxian",value:"440803"},{key:"pishanxian",value:"440804"},{key:"yutianxian",value:"440807"},{key:"kelamayi",value:"440900"},{key:"baijiantanqu",value:"440903"},{key:"dushanziqu",value:"440901"},{key:"kelamayiqu",value:"440902"},{key:"wuerhequ",value:"440904"},{key:"kashi",value:"441000"},{key:"bachuxian",value:"441002"},{key:"zuoshixian",value:"441003"},{key:"kashi",value:"441001"},{key:"maigaitixian",value:"441005"},{key:"shachexian",value:"441007"},{key:"shufuxian",value:"441011"},{key:"shulexian",value:"441010"},{key:"tashikuergan",value:"441012"},{key:"yechengxian",value:"441006"},{key:"yingjishaxian",value:"441009"},{key:"yuepuhuxian",value:"441004"},{key:"zepuxian",value:"441008"},{key:"kezilesu",value:"441100"},{key:"aheqixian",value:"441103"},{key:"aketaoxian",value:"441102"},{key:"atushi",value:"441101"},{key:"wuqiaxian",value:"441104"},{key:"shihezi",value:"441200"},{key:"tacheng",value:"441300"},{key:"eminxian",value:"441303"},{key:"hebukesaier",value:"441307"},{key:"shawanxian",value:"441304"},{key:"tacheng",value:"441301"},{key:"tuolixian",value:"441305"},{key:"wusu",value:"441302"},{key:"yuminxian",value:"441306"},{key:"tulufan",value:"441400"},{key:"zuoshanxian",value:"441402"},{key:"tuokexunxian",value:"441403"},{key:"tulufan",value:"441401"},{key:"wulumuqi",value:"440100"},{key:"dazuochengqu",value:"440106"},{key:"dongshanqu",value:"440107"},{key:"shuimogouqu",value:"440104"},{key:"shayibakequ",value:"440102"},{key:"tianshanqu",value:"440101"},{key:"toutunhequ",value:"440105"},{key:"wulumuqixian",value:"440108"},{key:"xinshiqu",value:"440103"},{key:"yilizhou",value:"441500"},{key:"chabuchaerxian",value:"441507"},{key:"gongliuxian",value:"441505"},{key:"huochengxian",value:"441506"},{key:"kuitun",value:"441509"},{key:"nilekexian",value:"441510"},{key:"tekesixian",value:"441502"},{key:"xinyuanxian",value:"441504"},{key:"yining",value:"441501"},{key:"yiningxian",value:"441508"},{key:"zhaosuxian",value:"441503"},{key:"xicang",value:"330000"},{key:"ali",value:"330200"},{key:"cuoqinxian",value:"330207"},{key:"gaerxian",value:"330203"},{key:"gejixian",value:"330205"},{key:"gaizexian",value:"330206"},{key:"pulanxian",value:"330201"},{key:"rituxian",value:"330204"},{key:"zhadaxian",value:"330202"},{key:"changdu",value:"330300"},{key:"bianbaxian",value:"330311"},{key:"basuxian",value:"330305"},{key:"changduxian",value:"330301"},{key:"chayaxian",value:"330306"},{key:"dingqingxian",value:"330307"},{key:"gongjuexian",value:"330309"},{key:"jiangdaxian",value:"330310"},{key:"luolongxian",value:"330302"},{key:"leiwuqixian",value:"330308"},{key:"mangkangxian",value:"330303"},{key:"zuogongxian",value:"330304"},{key:"lasa",value:"330100"},{key:"chengguanqu",value:"330101"},{key:"duilongdeqingxian",value:"330106"},{key:"dangxiongxian",value:"330103"},{key:"dazixian",value:"330107"},{key:"linzhouxian",value:"330102"},{key:"mozhugongkaxian",value:"330108"},{key:"nimuxian",value:"330104"},{key:"qushuixian",value:"330105"},{key:"linzhi",value:"330400"},{key:"bomixian",value:"330405"},{key:"chayuxian",value:"330406"},{key:"gongbujiangdaxian",value:"330402"},{key:"langxian",value:"330407"},{key:"linzhixian",value:"330401"},{key:"milinxian",value:"330403"},{key:"motuoxian",value:"330404"},{key:"naqu",value:"330500"},{key:"anduoxian",value:"330506"},{key:"bangexian",value:"330503"},{key:"baqingxian",value:"330502"},{key:"biruxian",value:"330508"},{key:"jialixian",value:"330509"},{key:"nimaxian",value:"330510"},{key:"naquxian",value:"330501"},{key:"nierongxian",value:"330507"},{key:"suoxian",value:"330504"},{key:"shenzhaxian",value:"330505"},{key:"rikaze",value:"330600"},{key:"angrenxian",value:"330612"},{key:"bailangxian",value:"330610"},{key:"dingjiexian",value:"330607"},{key:"dingrixian",value:"330615"},{key:"gangbaxian",value:"330618"},{key:"jilongxian",value:"330604"},{key:"jiangzixian",value:"330616"},{key:"kangmaxian",value:"330608"},{key:"lazixian",value:"330613"},{key:"nielamuxian",value:"330603"},{key:"nanmulinxian",value:"330617"},{key:"renbuxian",value:"330609"},{key:"rikaze",value:"330601"},{key:"sagaxian",value:"330602"},{key:"sazuoxian",value:"330614"},{key:"xietongmenxian",value:"330611"},{key:"yadongxian",value:"330605"},{key:"zhongbaxian",value:"330606"},{key:"shannan",value:"330700"},{key:"cuomeixian",value:"330706"},{key:"cuonaxian",value:"330702"},{key:"gonggaxian",value:"330710"},{key:"jiachaxian",value:"330704"},{key:"langkazixian",value:"330712"},{key:"luozhaxian",value:"330705"},{key:"longzixian",value:"330703"},{key:"naidongxian",value:"330701"},{key:"qiongjiexian",value:"330708"},{key:"qusongxian",value:"330707"},{key:"sangrixian",value:"330709"},{key:"zhanangxian",value:"330711"},{key:"yunnan",value:"340000"},{key:"baoshan",value:"340200"},{key:"changningxian",value:"340205"},{key:"longlingxian",value:"340204"},{key:"longyangqu",value:"340201"},{key:"shidianxian",value:"340202"},{key:"tengchongxian",value:"340203"},{key:"chuxiongzhou",value:"340300"},{key:"chuxiong",value:"340301"},{key:"dayaoxian",value:"340305"},{key:"lufengxian",value:"340310"},{key:"moudingxian",value:"340308"},{key:"nanhuaxian",value:"340307"},{key:"shuangbaixian",value:"340309"},{key:"wudingxian",value:"340302"},{key:"yaoanxian",value:"340306"},{key:"yuanmouxian",value:"340303"},{key:"yongrenxian",value:"340304"},{key:"dehongzhou",value:"340400"},{key:"longchuanxian",value:"340405"},{key:"lianghexian",value:"340403"},{key:"luxi",value:"340402"},{key:"ruili",value:"340401"},{key:"yingjiangxian",value:"340404"},{key:"dalizhou",value:"340500"},{key:"binchuanxian",value:"340509"},{key:"dali",value:"340501"},{key:"eryuanxian",value:"340503"},{key:"heqingxian",value:"340512"},{key:"jianchuanxian",value:"340502"},{key:"miduxian",value:"340508"},{key:"nanjianxian",value:"340507"},{key:"weishanxian",value:"340506"},{key:"xiangyunxian",value:"340510"},{key:"yangzuoxian",value:"340511"},{key:"yunlongxian",value:"340504"},{key:"yongpingxian",value:"340505"},{key:"diqingzhou",value:"340600"},{key:"deqinxian",value:"340602"},{key:"weixixian",value:"340603"},{key:"xianggelilaxian",value:"340601"},{key:"honghezhou",value:"340700"},{key:"gejiu",value:"340701"},{key:"honghexian",value:"340704"},{key:"hekouxian",value:"340713"},{key:"jinpingxian",value:"340703"},{key:"jianshuixian",value:"340709"},{key:"kaiyuan",value:"340712"},{key:"lvchunxian",value:"340702"},{key:"zuoxixian",value:"340706"},{key:"milexian",value:"340707"},{key:"mengzixian",value:"340711"},{key:"pingbianxian",value:"340710"},{key:"shipingxian",value:"340708"},{key:"yuanyangxian",value:"340705"},{key:"kunming",value:"340100"},{key:"anning",value:"340114"},{key:"chenggongxian",value:"340109"},{key:"dongchuanqu",value:"340110"},{key:"fuminxian",value:"340107"},{key:"guanduqu",value:"340112"},{key:"jinningxian",value:"340108"},{key:"luquanxian",value:"340103"},{key:"panlongqu",value:"340113"},{key:"shilinyizu",value:"340105"},{key:"zuomingxian",value:"340104"},{key:"wuhuaqu",value:"340101"},{key:"xundianxian",value:"340102"},{key:"xishanqu",value:"340111"},{key:"yiliangxian",value:"340106"},{key:"lincang",value:"340800"},{key:"cangyuanxian",value:"340808"},{key:"fengqingxian",value:"340802"},{key:"gengmaxian",value:"340807"},{key:"linxiangqu",value:"340801"},{key:"shuangjiangxian",value:"340806"},{key:"yongdexian",value:"340804"},{key:"yunxian",value:"340803"},{key:"zhenkangxian",value:"340805"},{key:"lijiang",value:"340900"},{key:"guchengqu",value:"340901"},{key:"huapingxian",value:"340904"},{key:"ningzuoyizu",value:"340905"},{key:"yulongxian",value:"340902"},{key:"yongshengxian",value:"340903"},{key:"nujiangzhou",value:"341000"},{key:"fugongxian",value:"341002"},{key:"gongshanxian",value:"341003"},{key:"lanpingxian",value:"341004"},{key:"zuoshuixian",value:"341001"},{key:"qujing",value:"341100"},{key:"fuyuanxian",value:"341106"},{key:"huizexian",value:"341107"},{key:"luliangxian",value:"341103"},{key:"luopingxian",value:"341105"},{key:"malongxian",value:"341102"},{key:"zuozuoqu",value:"341101"},{key:"shizongxian",value:"341104"},{key:"xuanwei",value:"341109"},{key:"zhanyixian",value:"341108"},{key:"simao",value:"341200"},{key:"cuiyunqu",value:"341201"},{key:"jiangchengxian",value:"341204"},{key:"jingdongyizu",value:"341207"},{key:"jingguxian",value:"341206"},{key:"lancangxian",value:"341202"},{key:"mojiangxian",value:"341208"},{key:"menglianxian",value:"341203"},{key:"puerxian",value:"341209"},{key:"ximengzuozu",value:"341210"},{key:"zhenzuoxian",value:"341205"},{key:"wenshanzhou",value:"341300"},{key:"funingxian",value:"341308"},{key:"guangnanxian",value:"341307"},{key:"maguanxian",value:"341305"},{key:"malipoxian",value:"341304"},{key:"qiubeixian",value:"341306"},{key:"wenshanxian",value:"341301"},{key:"xichouxian",value:"341303"},{key:"yanshanxian",value:"341302"},{key:"xishuangbanna",value:"341400"},{key:"jinghong",value:"341401"},{key:"zuohaixian",value:"341402"},{key:"zuolaxian",value:"341403"},{key:"yuxi",value:"341500"},{key:"chengjiangxian",value:"341503"},{key:"eshanyizu",value:"341507"},{key:"huaningxian",value:"341505"},{key:"hongtaqu",value:"341501"},{key:"jiangchuanxian",value:"341502"},{key:"tonghaixian",value:"341504"},{key:"xinpingxian",value:"341508"},{key:"yuanjiangxian",value:"341509"},{key:"yimenxian",value:"341506"},{key:"zhaotong",value:"341600"},{key:"daguanxian",value:"341607"},{key:"ludianxian",value:"341610"},{key:"qiaojiaxian",value:"341609"},{key:"shuifuxian",value:"341611"},{key:"suijiangxian",value:"341605"},{key:"weixinxian",value:"341602"},{key:"yanjinxian",value:"341608"},{key:"yiliangxian",value:"341603"},{key:"yongshanxian",value:"341606"},{key:"zhenxiongxian",value:"341604"},{key:"zhaoyangqu",value:"341601"},{key:"zhejiang",value:"160000"},{key:"huzhou",value:"160200"},{key:"anjixian",value:"160205"},{key:"deqingxian",value:"160203"},{key:"nanzuoqu",value:"160202"},{key:"wuxingqu",value:"160201"},{key:"changxingxian",value:"160204"},{key:"hangzhou",value:"160100"},{key:"binjiangqu",value:"160108"},{key:"chunanxian",value:"160104"},{key:"fuyang",value:"160102"},{key:"gongshuqu",value:"160110"},{key:"jiande",value:"160103"},{key:"jiangganqu",value:"160111"},{key:"linan",value:"160113"},{key:"shangchengqu",value:"160101"},{key:"tongluxian",value:"160105"},{key:"xiachengqu",value:"160112"},{key:"xihuqu",value:"160109"},{key:"xiaoshanqu",value:"160107"},{key:"yuhangqu",value:"160106"},{key:"jinhua",value:"160300"},{key:"dongyang",value:"160308"},{key:"jindongqu",value:"160302"},{key:"lanxi",value:"160306"},{key:"pananxian",value:"160305"},{key:"pujiangxian",value:"160304"},{key:"zuochengqu",value:"160301"},{key:"wuyixian",value:"160303"},{key:"yongkang",value:"160309"},{key:"yiwu",value:"160307"},{key:"jiaxing",value:"160400"},{key:"haining",value:"160405"},{key:"haiyanxian",value:"160404"},{key:"jiashanxian",value:"160403"},{key:"pinghu",value:"160406"},{key:"tongxiang",value:"160407"},{key:"xiuchengqu",value:"160401"},{key:"xiuzhouqu",value:"160402"},{key:"lishui",value:"160500"},{key:"jingningxian",value:"160508"},{key:"zuoyunxian",value:"160503"},{key:"lianduqu",value:"160501"},{key:"longquan",value:"160509"},{key:"qingtianxian",value:"160502"},{key:"qingyuanxian",value:"160507"},{key:"suichangxian",value:"160504"},{key:"songyangxian",value:"160505"},{key:"yunhexian",value:"160506"},{key:"ningbo",value:"160600"},{key:"beilunqu",value:"160608"},{key:"cixi",value:"160602"},{key:"fenghua",value:"160611"},{key:"haishuqu",value:"160601"},{key:"jiangbeiqu",value:"160609"},{key:"jiangdongqu",value:"160610"},{key:"ninghaixian",value:"160604"},{key:"xiangshanxian",value:"160605"},{key:"yuyao",value:"160603"},{key:"zuozhouqu",value:"160606"},{key:"zhenhaiqu",value:"160607"},{key:"zuozhou",value:"160700"},{key:"changshanxian",value:"160703"},{key:"jiangshan",value:"160706"},{key:"kechengqu",value:"160701"},{key:"kaihuaxian",value:"160704"},{key:"longyouxian",value:"160705"},{key:"zuojiangqu",value:"160702"},{key:"shaoxing",value:"160800"},{key:"shaoxingxian",value:"160802"},{key:"shangyu",value:"160805"},{key:"zuozhou",value:"160806"},{key:"xinchangxian",value:"160803"},{key:"yuechengqu",value:"160801"},{key:"zhuzuo",value:"160804"},{key:"taizhou",value:"160900"},{key:"huangyanqu",value:"160902"},{key:"jiaojiangqu",value:"160901"},{key:"linhai",value:"160909"},{key:"luqiaoqu",value:"160903"},{key:"sanmenxian",value:"160905"},{key:"tiantaixian",value:"160906"},{key:"wenling",value:"160908"},{key:"xianjuxian",value:"160907"},{key:"yuhuanxian",value:"160904"},{key:"wenzhou",value:"161000"},{key:"cangnanxian",value:"161005"},{key:"dongtouxian",value:"161008"},{key:"luchengqu",value:"161001"},{key:"leqing",value:"161011"},{key:"longwanqu",value:"161010"},{key:"zuohaiqu",value:"161009"},{key:"pingyangxian",value:"161006"},{key:"ruian",value:"161002"},{key:"taishunxian",value:"161003"},{key:"wenchengxian",value:"161004"},{key:"yongjiaxian",value:"161007"},{key:"zhoushan",value:"161100"},{key:"dinghaiqu",value:"161101"},{key:"zuoshanxian",value:"161103"},{key:"putuoqu",value:"161102"},{key:"zuozuoxian",value:"161104"},{key:"wanchengqu",value:"200301"},{key:"nanchengqu",value:"200302"},{key:"dongchengqu",value:"200303"},{key:"wanjiangqu",value:"200304"},{key:"shizuozhen",value:"200305"},{key:"shilongzhen",value:"200306"},{key:"chashanzhen",value:"200307"},{key:"shipaizhen",value:"200308"},{key:"qishizhen",value:"200309"},{key:"henglizhen",value:"200310"},{key:"qiaotouzhen",value:"200311"},{key:"xiegangzhen",value:"200312"},{key:"dongkengzhen",value:"200313"},{key:"changpingzhen",value:"200314"},{key:"zuobuzhen",value:"200315"},{key:"dalangzhen",value:"200316"},{key:"mayongzhen",value:"200317"},{key:"zhongtangzhen",value:"200318"},{key:"gaozhen",value:"200319"},{key:"zhangmutouzhen",value:"200320"},{key:"dalingshanzhen",value:"200321"},{key:"wangniudunzhen",value:"200322"},{key:"huangjiangzhen",value:"200323"},{key:"hongmeizhen",value:"200324"},{key:"qingxizhen",value:"200325"},{key:"shatianzhen",value:"200326"},{key:"daozhen",value:"200327"},{key:"tangxiazhen",value:"200328"},{key:"humenzhen",value:"200329"},{key:"houjiezhen",value:"200330"},{key:"fenggangzhen",value:"200331"},{key:"changanzhen",value:"200332"},{key:"shizuoqu",value:"202101"},{key:"dongqu",value:"202102"},{key:"xiqu",value:"202103"},{key:"nanqu",value:"202104"},{key:"wuguishanqu",value:"202105"},{key:"huojukaifaqu",value:"202106"},{key:"huangpuzhen",value:"202107"},{key:"nantouzhen",value:"202108"},{key:"dongfengzhen",value:"202109"},{key:"fushazhen",value:"202110"},{key:"xiaozuozhen",value:"202111"},{key:"dongshengzhen",value:"202112"},{key:"guzhenzhen",value:"202113"},{key:"henglanzhen",value:"202114"},{key:"sanjiaozhen",value:"202115"},{key:"minzhongzhen",value:"202116"},{key:"nanlangzhen",value:"202117"},{key:"gangkouzhen",value:"202118"},{key:"dayongzhen",value:"202119"},{key:"shaxizhen",value:"202120"},{key:"sanxiangzhen",value:"202121"},{key:"banzuozhen",value:"202122"},{key:"shenwanzhen",value:"202123"},{key:"tanzhouzhen",value:"202124"},{key:"beiquanzhen",value:"441201"},{key:"zhengchangzhen",value:"701401"},{key:"maozuizhen",value:"701402"},{key:"hezhen",value:"701403"},{key:"sanfutanzhen",value:"701404"},{key:"huchangzhen",value:"701405"},{key:"xiliuhezhen",value:"701406"},{key:"pengchangzhen",value:"701407"},{key:"shahuzhen",value:"701408"},{key:"yanglinweizhen",value:"701409"},{key:"zhanggouzhen",value:"701410"},{key:"guohezhen",value:"701411"},{key:"tonghaikouzhen",value:"701412"},{key:"chenchangzhen",value:"701413"},{key:"changkouzhen",value:"701414"},{key:"zuochenghuizuzhen",value:"701415"},{key:"yuquanzhen",value:"400701"},{key:"wenshuzhen",value:"400702"},{key:"xinchengzhen",value:"400703"},{key:"guoyingnongchang",value:"220201"},{key:"haitangwanzhen",value:"220202"},{key:"jiyangzhen",value:"220203"},{key:"fenghuangzhen",value:"220204"},{key:"hexiqu",value:"220205"},{key:"hedongqu",value:"220206"},{key:"yachengzhen",value:"220207"},{key:"tianyazhen",value:"220208"},{key:"yucaizhen",value:"220209"},{key:"chongmingxian",value:"150119"},{key:"jixian",value:"540116"},{key:"ninghexian",value:"540117"},{key:"jinghaixian",value:"540118"},{key:"binhaixinqu",value:"540119"},{key:"shuitouzhen",value:"110713"},{key:"shijingzhen",value:"110714"},{key:"guanqiaozhen",value:"110715"},{key:"cizaozhen",value:"110716"},{key:"anhaizhen",value:"110717"},{key:"qunyingxiang",value:"220616"},{key:"timengxiang",value:"220615"},{key:"lianzhen",value:"220614"},{key:"xincunzhen",value:"220613"},{key:"benhaozhen",value:"220612"},{key:"wenluozhen",value:"220611"},{key:"longguangzhen",value:"220610"},{key:"yingzhouzhen",value:"220609"},{key:"sancaizhen",value:"220608"},{key:"guangpozhen",value:"220607"},{key:"yelinzhen",value:"220606"},{key:"nanpingnongchang",value:"220605"},{key:"lingmennongchang",value:"220604"},{key:"diaoluoshanlinyegongsi",value:"220603"},{key:"nanpingzhen",value:"220602"},{key:"donghuazhen",value:"220601"},{key:"lingshui",value:"220600"},{key:"nanfengnongchang",value:"220517"},{key:"dongshengnongchang",value:"220516"},{key:"donghongnongchang",value:"220515"},{key:"dongtainongchang",value:"220514"},{key:"bincunshanhuaqiaonongchang",value:"220513"},{key:"huishanzhen",value:"220512"},{key:"daluzhen",value:"220511"},{key:"changpozhen",value:"220510"},{key:"tayangzhen",value:"220509"},{key:"tanmenzhen",value:"220508"},{key:"longjiangzhen",value:"220507"},{key:"yangjiangzhen",value:"220506"},{key:"boaozhen",value:"220505"},{key:"zhongyuanzhen",value:"220504"},{key:"shibizhen",value:"220503"},{key:"wanquanzhen",value:"220502"},{key:"jiajizhen",value:"220501"},{key:"qionghai",value:"220500"},{key:"wuzhishanshi",value:"220401"},{key:"wuzhishan",value:"220400"},{key:"wenchangshi",value:"220301"},{key:"wenchang",value:"220300"},{key:"haitangqu",value:"220211"},{key:"yazhouqu",value:"220210"},{key:"tianyaqu",value:"220213"},{key:"jiyangqu",value:"220212"},{key:"gaoxinqu",value:"320120"},{key:"gaoxinqu",value:"321310"},{key:"huijiqu",value:"710113"},{key:"hunnanxinqu",value:"620114"},{key:"longhuaqu",value:"201507"},{key:"guangmingxinqu",value:"201508"},{key:"liangxiqu",value:"120909"},{key:"wuxingqu",value:"120910"},{key:"shenbeixinqu",value:"620115"}];