/**
 * @Author yanhui.rao
 * @returns
 */
(function(window,$){
	/**定义全局的ofc对象**/
	var utruck = {};
	
	/**定义settings**/
	var settings = {};
	
	/**定义全局setting_default**/
	var settings_default={
		/**定义AJAX回调函数data**/
		data:null,
		/**定义成功方法**/
		onSuccess:null,
		/**定义失败方法**/
		onError:null,
		/**定义AJAX会话过期方法**/
		onNoSession:null,
		/**定义是否显示异常**/
		showError:true,
		/**定义会话过期AJAX登录方法**/
		onLogined:null
	};
	
	/**每一个AJAX调用时,需要引用此方法, 调用参考如下：**/
	/**$.ajax({
		url:"path",
		type:"post",
		data:{"xx":xx},
		dataType:"json",
		success:function(result){
			utruck.IsSysError({
				data:result,
				onSuccess:function(){},
				onLogined:function(){}
			 });
		}
	});**/
	/**options格式 {data:data, onSuccess:function(){}, onLogined:function(){}}**/
	function IsSysError(options){
		/**JQUERY继承**/
		$.extend(true, settings, settings_default, options || {});
		var data = settings.data;
		if(data!=undefined){
			if(data.status==0){
				if(data.message=="会话超时"){
					if(settings.onNoSession==null){
						utruck.DefaultOnNoSession(options);
					}else{
						settings.onNoSession();
					}
				}else if(settings.onError!=null){
					settings.onError();
				}else if(settings.showError){
					utruck.Alerts(data.message);
				}
				return false;
			}else{
				if(settings.onSuccess!=null){
					settings.onSuccess();
				}
				return true;
			}
		}
	}
	
	/**定义无会话时候调用登录dialog框方法**/
	function DefaultOnNoSession(options){
		/**暂未实现**/
	}
	
	/**定义全局的alert框方法**/
	function Alerts(options){
		/**暂未实现**/
	}
	
	/**判断数组中是否含有某个值**/
	function HasContains(param, objArray) {
		if(objArray!=undefined && objArray!=null){
			for(var i=0;i<objArray.length;i++){
				if(param==objArray[i]){
					return true;
				}
			}
		}
	    return false;
	}
	
	/**
	 * 格式化日期YYYY-MM-DD HH:mm:ss 
	 */
	function FormatDateTime(strTime,format) {
		var date = new Date(strTime);
		
		if (!format) {
			format = "yyyy-MM-dd hh:mm:ss";
		}
		/*
		 * eg:format="yyyy-MM-dd hh:mm:ss";
		 */
		var o = {
			"M+" : date.getMonth() + 1, // month
			"d+" : date.getDate(), // day
			"h+" : date.getHours(), // hour
			"m+" : date.getMinutes(), // minute
			"s+" : date.getSeconds(), // second
			"q+" : Math.floor((date.getMonth() + 3) / 3), // quarter;
			"S" : date.getMilliseconds()
		// millisecond
		};

		var week = {
			"0" : "天",
			"1" : "一",
			"2" : "二",
			"3" : "三",
			"4" : "四",
			"5" : "五",
			"6" : "六"
		};

		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (date.getFullYear() + "")
					.substr(4 - RegExp.$1.length));
		}

		if (/(E+)/.test(format)) {
			format = format.replace(RegExp.$1,
					((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周")
							: "")
							+ week[date.getDay() + ""]);
		}

		for ( var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
						: ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	}
	
	var ajax_settings={
		type:"",
		url:"",
		data:"",
		dataType:"",
		success:null,
		error:null,
		beforeSend:null
		
	};
	
	var ajax_settings_default={
			type:"POST",
			url:"",
			data:"",
			dataType:"json",
			success:null,
			error:null,
			beforeSend:null
	};
	
	function Ajax(options){
		$.extend(true, ajax_settings, ajax_settings_default, options || {});
		
		$.ajax({
			url:ajax_settings.url,
			type:ajax_settings.type,
			data: ajax_settings.data,
			dataType:ajax_settings.dataType,
			beforeSend:function(res){
				if(null!=ajax_settings.beforeSend&&typeof(ajax_settings.beforeSend)=="function"){
					ajax_settings.beforeSend(res);
				}
			},
			success:function(res){
				if(null!=ajax_settings.success&&typeof(ajax_settings.success)=="function"){
					ajax_settings.success(res);
				}
			},
			error:function(res,e){
				if(null!=ajax_settings.error&&typeof(ajax_settings.error)=="function"){
					ajax_settings.error(res);
				}
			}
			
		});
		
		
	}
	
	/**定义匿名函数/闭包访问格式**/
	utruck.IsSysError=IsSysError;
	utruck.DefaultOnNoSession=DefaultOnNoSession;
	utruck.Alerts=Alerts;
	utruck.HasContains=HasContains;
	utruck.FormatDateTime=FormatDateTime;
	utruck.Ajax=Ajax;
	window.utruck=utruck;
})(window,jQuery);