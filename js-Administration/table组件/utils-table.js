function DataTable(options) {
	var defaults = {
		className : "",
		pageInterval:3,
		params:{},
		sortParam:"sort",
		sortNameParam:"sortName",
		ajaxResult:null
	}
	var opts = $.extend(defaults, options);
	var target = this;
	
	this.opts = opts;
	this.page = null;
	this.params = opts.params;
	this.onSelected = function() {
		var $table = $(opts.id);
		if (opts.selectOne) {
			var str = target.getSelecteds();
			if (str) {
				target.checkAll(false);
				$(this).prop('checked', true);
			}
		}
	}

	this.getSelecteds = function(field) {
		var target = this;
		var $table = $(this.opts.id);
		var arr = [];
		$table.find(".group-checkable-item").each(function(i, item) {
			if ($(item).prop('checked')) {
				var data = target.page.rows[$(item).val()]
				if(field){
					arr.push(data[field]);
				}else{
					arr.push(data);
				}
			}
		});
		if(field){
			return arr.join(",");
		}else{
			return arr;
		}
	}

	this.getSelected = function() {
		var $table = $(this.opts.id);
		var data = this.getSelecteds();
		if (data.length > 0) {
			return data[0];
		}
	}

	this.checkAll = function(check) {
		var $table = $(opts.id);
		if (check === true || check === false) {
			$table.find(".group-checkable").prop('checked', check);
		}
		var checked = $table.find(".group-checkable").prop('checked')
		if (checked) {
			if (!opts.selectOne) {
				$table.find(".group-checkable-item").each(function() {
					$(this).prop('checked', true);
				});
			}
		} else {
			$table.find(".group-checkable-item").each(function() {
				$(this).prop('checked', false);
			});
		}
	}

	this.initPageNav = function($table,page) {
		if(!page.page){
			page.page = 0;
		}
		if(!page.pageSize){
			page.pageSize = 10;
		}
		if(!page.pageCount){
			page.pageCount = 0;
		}
		if(!page.total){
			page.total = 0;
		}
		var target = this;
		var size = target.opts.pageInterval;
		var interval = parseInt(size / 2);
		var begin = page.page - interval;
		if(begin < 1){
			begin = 1;
		}
		var over = begin + size - 1;
		if(over > page.pageCount){
			over = page.pageCount;
			begin = over - size + 1;
		}
		
		var html = '<div class="row">'
			+ '<div class="col-md-5 col-sm-5">'
			+ '<div aria-live="polite" role="status" id="sample_1_info" class="dataTables_info">'
			+ '<label> <select class="bs-select form-control input-small input-pagesize" data-style="btn-primary">'
			+ '<option value="5">5</option>'
			+ '<option value="10">10</option>'
			+ '<option value="15">15</option>'
			+ '<option value="20">20</option>'
			+ '<option value="30">30</option>'
			+ '<option value="50">50</option>'
			+ '<option value="100">100</option>'
//			+ '<option value="200">200</option>'
//			+ '<option value="300">300</option>'
			+ '</select>'
			+ '</label> 当前第'+page.page+'/'+page.pageCount+'页 ，共'+page.total+'条</div></div>'
			+ '<div class="col-md-7 col-sm-7">'
			+ '<div id="" class="dataTables_paginate paging_bootstrap_full_number">'
			+ '<ul style="visibility: visible;" class="pagination">';
		
		if(page.page <= 1){
			if(interval >= 5){
				html+= '<li class="prev disabled"><a title="首页"><i class="fa fa-angle-double-left"></i></a></li>';
			}
			html+= '<li class="prev disabled"><a href="javascript:;" title="上一页"> <i class="fa fa-angle-left"></i></a></li>';
		}else{
			if(interval >= 5){
				html+= '<li class="prev page-btn"><a data-id="'+(1)+'" href="javascript:;" title="首页"><i class="fa fa-angle-double-left"></i></a></li>';
			}
			html+= '<li class="prev page-btn"><a data-id="'+(parseInt(page.page)-1)+'" href="javascript:;" title="上一页"> <i class="fa fa-angle-left"></i></a></li>';
		}
		
		for(var i=begin; i <= over;i++){
			if((i>=1) && (i<=page.pageCount)){
				if(i == page.page){
					html += '<li class="active"><a href="javascript:;">'+i+'</a></li>'
				}else{
					html += '<li class="page-btn"><a data-id="'+(i)+'" href="javascript:;">'+i+'</a></li>'
				}
			}
		}
			
		if(page.page >= page.pageCount){
			html+= '<li class="next disabled"><a href="javascript:;" title="下一页"><i class="fa fa-angle-right"></i></a></li>';
			if(interval >= 5){
				html+= '<li class="next disabled"><a title="尾页"><i class="fa fa-angle-double-right"></i></a></li>';
			}
		}else{
			html+= '<li class="next page-btn"><a data-id="'+(parseInt(page.page)+1)+'" href="javascript:;" title="下一页"><i class="fa fa-angle-right"></i></a></li>';
			if(interval >= 5){
				html+= '<li class="next page-btn"><a data-id="'+(page.pageCount)+'" href="javascript:;" title="尾页"><i class="fa fa-angle-double-right"></i></a></li>';
			}
		}
		html+=  '</ul>' + '</div>' + '</div>' + '</div>';
		$table.find(".dataTables-pageNav").html(html);
		
		$table.find(".dataTables-pageNav .page-btn a").click(function(){
			var page = $(this).data('id');
			target.params.page = page;
			target.reload(target.params);
		});
		$table.find(".dataTables-pageNav .bs-select").change(function(){
			var pageSize = $(this).selectpicker('val');
			target.params.pagesize = pageSize;
			target.params.page = 1;
			target.reload(target.params);
		});
		$table.find(".dataTables-pageNav .bs-select").val(page.pageSize);
	}
	
	this.getRowHtml = function(row,index){
		var bodyHtml = [];

		bodyHtml.push('<tr role="row" class="gradeX odd">');
		
		for ( var j = 0; j < opts.columns.length; j++) {
			var col = opts.columns[j];
			var field = col.field != null ? col.field : "";
			var val = row[field] != null ? row[field]: "";
			if (col.checkbox) {
				bodyHtml.push('<td><label class="mt-checkbox mt-checkbox-single mt-checkbox-outline"> <input class="group-checkable-item" value="'+ index+ '" type="checkbox"> <span></span></label></td>');
			}else if (col.radio) {
				bodyHtml.push('<td><label class="mt-checkbox mt-checkbox-single mt-checkbox-outline"> <input class="group-checkable-item" value="'+ index+ '" type="radio" name="acmRadio" onclick="radioChangeEvent();"> <span></span></label></td>');
			}else{
				var className = col.className != null ? col.className: "";
				var style = col.style != null ? col.style: "";

				var title = col.title != null ? col.title: "";
				var displayStatus = col.displayStatus != null ? col.displayStatus: "";
				if(null!=displayStatus&&displayStatus.length>0){
					style+="display:"+displayStatus;
				}
				if((!val || val == "") && col.defval){
					val = col.defval;
				}
				if(col.format){
					val = col.format(val,row,index);
				}

				bodyHtml.push('<td');

				this.appendAttribute(bodyHtml, className, "class");
				this.appendAttribute(bodyHtml, style, "style");

				bodyHtml.push('>' + val + '</td>');
			}
		}
		bodyHtml.push('</tr>');

		return bodyHtml.join("");
	}

	this.appendAttribute = function (html, attributeValue, attributeName) {
		if(attributeValue) {
			html.push(' ' + attributeName + '="' + attributeValue + '"');
		}
	};

	this.getHeadHtml = function(){
		var headHtml = '<thead><tr role="row">';
		for ( var i = 0; i < opts.columns.length; i++) {
			var col = opts.columns[i];
			if (col.checkbox) {
				headHtml += '<th aria-label="" style="width: 41px;" colspan="1" rowspan="1" class="sorting_disabled">'
						+ '<label class="mt-checkbox mt-checkbox-single mt-checkbox-outline">'
						+ '<input class="group-checkable" value="1" type="checkbox">'
						+ '<span></span>' + '</label>' + '</th>'
			}else if (col.radio) {
				headHtml += '<th aria-label="" style="width: 41px;" colspan="1" rowspan="1" class="sorting_disabled">'
					+ '<label class="mt-checkbox mt-checkbox-single mt-checkbox-outline">'
					+ '<input class="group-checkable" value="1" type="radio" name="mRadio">'
					+ '<span></span>' + '</label>' + '</th>'
			}else {
				var className = col.className != null ? col.className : "";
				var title = col.title != null ? col.title : "";
				var field = col.field != null ? col.field : "";
				var sort = col.sort != null ? col.sort : "";
				var displayStatus = col.displayStatus != null ? col.displayStatus: "";
				if(sort){
					headHtml += '<th class="sorting ' + className + '" sort="'+sort+'" style="display:'+ displayStatus +'">' + title + '</th>';
				}else{
					headHtml += '<th class="' + className + '" style="display:'+ displayStatus +'">' + title + '</th>';
				}
				//sorting_desc
			}
		}
		headHtml += '</tr></thead><tbody></tbody>';
		return headHtml;
	}
	this.load = function(){
		var target = this;
		var $table = $(target.opts.id);
		App.blockUI({ target: $table, animate: true,overlayColor: '#dfdfdf'});
		//$table.find(".blockUI").css({"left":"35%","top":"40%"});
		$.ajax({
			type : 'POST',
			url : target.opts.url,
			data : target.params,
			dataType:"json",
			success : function(page) {
				if(page){

					$table = $(target.opts.id);

					target.page = page;

					if(target.page.hasOwnProperty('success') && !target.page.success){

						toastr["error"](target.page.message ? target.page.message : "获取数据失败", "温馨提示");

						App.unblockUI($table);

						return;
					}

					//格式化返回值
					if("function"==typeof(target.opts.ajaxResult)){
						target.page=target.opts.ajaxResult(target.page);
					}

					var data = target.page.rows;

					if(data && data.length > 0){
						var bodyHtml = '';
						for ( var i = 0; i < data.length; i++) {
							bodyHtml += target.getRowHtml(data[i],i);
						}
						$table.find("table tbody").html(bodyHtml);
					} else {
						var bodyHtml = '<tr role="row" class="gradeX odd"><td style="padding:79px;" colspan="99">暂无相关数据</td></tr>';
						$table.find("table tbody").html(bodyHtml);
					}

					target.initPageNav($table,target.page);

					$table.find('.bs-select').selectpicker('render');
					if (target.selectOne) {
						$table.find(".group-checkable").click(function() {
							target.checkAll(false);
						});
					} else {
						$table.find(".group-checkable").click(target.checkAll);
					}
					$table.find(".group-checkable-item").click(target.onSelected);
					if(opts.selectOne){
						$table.find("tr[role=row]").click(function() {
							$(this).find(".group-checkable-item").click();
						});
						$table.find(".mt-checkbox").click(function(event) {
							event.stopPropagation();
						});
					}
				}else{
					toastr["error"]("获取数据失败", "温馨提示");
				}
				App.unblockUI($table);
			},error:function(e){
				toastr["error"]("获取数据失败", "温馨提示");
				App.unblockUI($table);
			}
		});
	}
	
	this.reload = function(data){
		var target = this;
		if(target.params instanceof  Array){
			var obj = {};
			for(var item in target.params){
				if(target.params[item].name){
					obj[target.params[item].name] = target.params[item].value;
				}
			}
			target.params = obj;
		}
		if(data){
			if(data instanceof  Array){
				for(var item in data){
					if(data[item].name){
						target.params[data[item].name] = data[item].value;
					}
				}
			} else {
				for(var item in data){
					target.params[item] = data[item]
				}
			}
		}
		target.load();
	}
	
	this.init = function() {
		$table = $(target.opts.id);
		var header = target.getHeadHtml();
		$table.find("table").html("");
		$table.find("table").append(header);
		$table.find(".sorting").click(function(){
			var sort = $(this).attr("sort");
			var sorting = $(this).hasClass("sorting_desc");
			var order = "desc";
			$table.find(".sorting").removeClass("sorting_asc").removeClass("sorting_desc");
			if(sorting){
				order = "asc";
				$(this).removeClass("sorting_desc").addClass("sorting_asc");
			}else{
				$(this).removeClass("sorting_asc").addClass("sorting_desc");
			}
			target.params[target.opts.sortParam] = order;
			target.params[target.opts.sortNameParam] = sort;
			target.reload(target.params);
		});
		target.reload(target.params);
	}
}