window.IPCallBack = function IPCallBack(data) {
		remote_ip_info.ip= data.ip;
		console.log(remote_ip_info.ip);

		remote_ip_info.province= data.pro;	
		if(remote_ip_info.province.indexOf("省")==remote_ip_info.province.length-1){
			remote_ip_info.province= remote_ip_info.province.substring(0, remote_ip_info.province.indexOf("省"))	;
		}else if(remote_ip_info.province.indexOf("市")==remote_ip_info.province.length-1){
			remote_ip_info.province= remote_ip_info.province.substring(0, remote_ip_info.province.indexOf("市"))	;
		}
		console.log(remote_ip_info.province);
		
		remote_ip_info.city= data.city;
		if(remote_ip_info.city.indexOf("市")==remote_ip_info.city.length-1){
			remote_ip_info.city= remote_ip_info.city.substring(0, remote_ip_info.city.indexOf("市"))	;
		}else if(remote_ip_info.city.indexOf("地区")==remote_ip_info.city.length-1){
			remote_ip_info.city= remote_ip_info.city.substring(0, remote_ip_info.city.indexOf("地区"))	;
		}
		
		console.log(remote_ip_info.city);
	}

	
	
	