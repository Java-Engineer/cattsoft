/**
*时间控件
$("#XX").datePicker({});
*/
(function($) { 
	$.fn.datePicker= function(opt,options) {
		if(typeof opt != 'object'){
			if(opt == 'loadData'){
				var opts = $(this).data(); //得到原始定义
				opts.datas=options; //要呈现的数据
				loadData(opts,this);
			}
		}else{
			loadData(opt, this);
		}
	};
	
	
	/**初始化*/
	function loadData(opts, obj){
		var inp = $(obj);
		if(inp.parent().hasClass("specie")){return;}
		var inpHtml = inp.prop("outerHTML").replace('class="Wdate"','class="deInput"').replace(/<input/i, '<input readonly style="width:100%;" ');
		var id=inp.attr('id');
		
		var click = inp.attr("onclick"); //如WdatePicker ( {dateFmt:'MM-dd',minDate:'#F{$dp.$D(\'DEMPLOYDATE\')}'})
		if(click){
			click = click.replace("{", "{el:'"+id+"',"); //把第一个{号替换加上一个名称就好
		}
		inp.data(opts);
		
		//绘制
		var html = [];
		html.push('<div class="specie">');
		html.push(inpHtml);		      
		html.push('<a>&nbsp;</a>');		      
		html.push('</div>');
		inp.after(html.join(''));
		
		inp.remove();
		
		$("#"+id).next().attr('onclick',click);
	}
})(jQuery);
