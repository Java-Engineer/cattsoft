/** 下拉选控件
 初始化：
 $("#XX").select(
 {
			isMulti:true, //true为多选，false为单选, 默认false
			showTip:true, //下拉选项是否显示title提示，文字内容太长时建议显示
			datas:[{id:"",text:""}], //如果是用select重构，他会自动取optiont选项, 但优先以此属性给的值为准
			id:datas数据中隐式值字段名, 默认取"id"字段
			text:datas数据中显示文本字段名,默认取"text"字段
			onChange:function, //所选值发生变化事件
			isShowSelectBtn://是否显示下拉按钮 1是，0否，默认1
			placeholder: //自定义默认提示语，默认“请选择”
			clear://开放清空按钮，0不开放，1开放，默认1
			onClean:function, //点击"X"清空按钮事件(非必须)
			width://下拉div的宽度设置，如100，只有在此值大于文本框宽度时才生效，默认以文本框宽度为准
			height://下拉div的最大高度设置，如200，默认170
			disabled://只读，禁操作
			search:true//实时搜索，默认关闭
		}
 );

 方法调用：
 $("#XX").select("setValue", {id:"1,2",text:"A,B"}); //设置值
 var v = $("#XX").select("getValue"); //获取值
 var opts = $("#XX").select("options"); //获取属性定义
 $("#XX").select("setItems",[{id:1,text:"A"}, ... ]); //设置值
 */
(function($) {
	var optionData;

	$.fn.select= function(opt,options) {
		if(typeof opt != 'object'){
			if(opt == 'loadData'){//相当于重绘
				var opts = $(this).data(); //得到原始定义
				opts.datas=options; //要呈现的数据
				loadData(opts,this);
			}else if(opt=='setValue'){//设置选中值, 如 {}
				setValue(this,options);
			}else if(opt=='getValue'){
				return getValue(this);//获取选中值
			}else if(opt=="options"){
				return $(this).data();
			}else if(opt=='setItems'){//设置下拉选项
				var opts = $(this).data(); //得到原始定义
				opts.datas=options;  //更新数据
				setItems(this, options);
			}
		}else{
			loadData(opt, this);//初始化
		}
	};


	/**初始化
	 单选时，用一个select承载值, select的值发生变化时，div也要变化(每秒同步一次)
	 多选时用一个input承载实际值
	 */
	function loadData(opts, obj){
		var inp = $(obj);
		var id = inp.attr("id");
		var txtId = id+"_text";
		var isSelect = inp.is("select") && !opts.isMulti;
		var opts = initOptions(inp, opts);
		if(inp.is("select") && opts.isMulti){ //如果是个select框，但又要求多选，把多选框重置为一个隐藏域
			inp.after('<input type="hidden" id="'+id+'" '+(opts.disabled)+'>');
			inp.remove();
			inp=$("#"+id);
		}
		inp.data(opts);

		if($("#"+txtId).length>0){$("#"+txtId).remove();}

		if(inp.next().hasClass("multipleChoice")){//不被重复生成
			inp.next().remove();
		}

		//绘制
		var html = [];
		html.push('<div id="" class="multipleChoice" '+(opts.search?'title="可输入字符过滤选项"':'')+'  >');
		var endStr = opts.search?'" />':'" readonly/>';
		html.push('<input id="'+txtId+'" class="deInput deInput1" style="width:100%" value="'+opts.placeholder);
		html.push(endStr);
		if(opts.isShowSelectBtn!=0){
			html.push('<div class="inputClear" style="display:none;"></div>');
			html.push('<a class="multipleA"></a>');
		}else{
			html.push('<div class="inputClear inputClear2" style="display:none;"></div>');
		}
		html.push('<div class="multipleXiala" style="z-index:10000;">');
		html.push('<div class="resultDiv">');
		html.push('<ul class="result formStyle"></ul>');
		html.push('</div>');
		html.push('</div>');
		html.push('</div>');

		inp.hide();
		inp.after(html.join(''));

		//setLiItems(inp, opts.datas);
		setItems(inp, opts.datas, false);

		//下拉DIV的最大高度
		var div = inp.next();

		var h = opts.height||170;
		div.find(".result").css("max-height",h);
		//下拉DIV的显示与隐藏
		div.find(".deInput,.multipleA").mouseover(function(){
			if(inp.attr("disabled")){return false;}
			var tempObj = $(this);
			var mx = tempObj.parent().find(".multipleXiala");
			$(mx).attr("isMouseOver","1");
			tempObj.parent().css({zIndex:10000});
			//设置下拉框div在页面的位置  fq add
			setXiaLaPisiton(mx, h);

			setTimeout(function(){//延时400毫秒,尽量减少光标误滑过导致的显示
				if($(mx).attr("isMouseOver")=="1"){
					mx.slideDown('fast');
				}
			},400);
		});
		div.mouseleave(function(){
			var mx = $(this).find(".multipleXiala");
			$(mx).attr("isMouseOver","0");
			mx.slideUp('fast');
			$(this).css('zIndex','inherit');
		});
		div.find('.xw_multXialaBtn').click(function(){
			$(this).find(".multipleXiala").slideUp('fast');
		});

		//当传入clear==0时 ，屏蔽掉清空按钮，默认值或其它值开放清空按钮
		if(opts.clear!=0){
			div.hover(function(){if(inp.val()){div.find(".inputClear").show();}}, function(){div.find(".inputClear").hide();});
		}
		//当传入search==true时,输入文本下拉选实时更新
		if(opts.search){
			div.find('.deInput').bind("keyup",function(){
				if(inp.attr("disabled")){return false;}

				var str = div.find('.deInput').val();
				/*元素重新设置之后使用新的数据*/
				var checkedSelect = $(obj).is("select");
				var sourceData = null;
				sourceData = checkedSelect?getOptionsData($(obj)):$(obj).data().datas;
				sourceData = opts.isMulti?inp.data().datas:sourceData;
				var newData = filterData(sourceData,str,opts);

				if(newData.length>0){
					setLiItems(inp,newData);
				}else{
					$(".multipleXiala").slideUp('fast');
					return;
				}
				var mx = $(this).parent().find(".multipleXiala");
				mx.slideDown('fast');
				$(this).parent().css({zIndex:10000});
			}).bind("focus",function(){
				var v = $(this).val();
				$(this).val(v==opts.placeholder?"":v);
			}).bind("blur",function(){
				var v = $(this).val();
				$(this).val(v==""?opts.placeholder:v);
			});
		}
		div.find(".inputClear").bind("click",function(){//清空
			if(inp.attr("disabled")){return false;}
			setValue(inp, {id:"",text:""});
			/**肖忠亮  click 回调函数  2017-8-31*/
			if(typeof(opts.onClean) == 'function' ){
				opts.onClean();
			}
		});

		copySelect(obj,isSelect,opts.search);
	}

	/**过滤数据*/
	function filterData(sourceData,targetStr,opts){
		var length = targetStr.length;
		if(length>0){
			var dataLength = sourceData.length;
			var newData = [];
			var text = opts.text?opts.text:"text";
			for(var i=0;i<dataLength;i++){
				var sourceStr = sourceData[i][text];
				if(sourceStr.indexOf(targetStr)>=0){
					newData.push(sourceData[i]);
				}
			}
			return newData;
		}else{
			return sourceData;
		}
	}

	/**获取非select的数据*/
	function getOptionsForOther(obj){
		var eles = obj.next().find("li");
		var length = eles.length;
		var datas = [];
		for(var i=0; i<length; i++) {
			var id = $(eles[i]).attr("val");
			var text = $(eles[i]).attr("text");
			if(!id){continue;}
			datas.push({id:id, text: text});
		}
		return datas;
	}

	/**如果原始对象是个下拉框，则进行数据实时同步，因为原始对象可能被js重新独立设值与下拉选项*/
	function copySelect(obj, isSelect,search){
		if(isSelect){
			window.setInterval(function(){
				var opts = obj.data();
				//如果有事件定义
				var evts = $(obj).data('events')? $(obj).data('events')["change"] : null;
				evts = evts? evts : $._data($(obj)[0],"events");
				if( ((evts && evts.length>0) || (evts && evts.change) ) && !opts.onChange){
					opts.onChange = function(){
						obj.trigger("change"); //让原对象的事件trigger触发 //var m = obj.data('events')["change"][0].handler;//事件函数
					};
				}

				//重新同步下拉选项（如果选项有发生变化才重新同步，不能从选项的数量上比较，而要以全量选项值为比较）
				var newItems = getOptionsData(obj);
				var oldItems = opts.datas;
				var boo = compare(newItems, oldItems);
				if(boo){//如果不同
					opts.datas=newItems;
					setItems(obj, newItems, true);
				}
				obj.data(opts);
				if(!search){
					var rs = {id:obj.val()};
					setValue(obj, rs, rs); //更新最新选中值
				}
			}, 1000);
		}
	}

	/**重置下拉可选项li*/
	function setLiItems(obj, datas){
		var inp = $(obj);
		var div = inp.next();
		var opts = inp.data();

		var boo = opts.isMulti;
		var html = [];
		if(boo){ //多选时，加一个全选
			html.push('<li isCheckAllbtn="1"><input type="checkbox" name="chbox" ><span>全选</span></li>');
		}

		//默认值字段为“id”，显示字段为“text”，也可以传自定义的，add by 聂志恒 2015-12-26
		var id=opts.id?opts.id:"id";
		var text=opts.text?opts.text:"text";
		for(var i=0; i<datas.length; i++){
			html.push( '<li val="'+datas[i][id]+'" text="'+datas[i][text]+'" '+(opts.showTip ? ('title="'+datas[i][text]+'"'):'')+'>'+
				( boo? '<input type="checkbox" name="chbox">' : '' ) +'<span class="text">'+datas[i][text]+'</span></li>' );
		}
		div.find('ul').html(html.join(''));
		/**肖忠亮  绑定对象 2017-8-31*/
		div.find('ul li').each(function(t){
			var $li = $(this);
			for(var i = 0; i < datas.length ; i++){
				if($li.attr("val") == datas[i].id){
					$li.data("data",datas[i]);
				}
			}
		});
		//重绘复选框样式
		div.find(":checkbox").jqTransCheckBox();

		var mx = div.find(".multipleXiala");
		var w1= $(div).outerWidth();
		var w2= opts.width||0;
		var w = w2>w1? w2:w1;
		mx.css("width", w);

		mx.find(".text").width(mx.width()-55+(boo?0:30));

		getCheckBoxObjs(div).unbind("click");//去掉样式框自身的事件，完全以li的点击事件为准
		//给项绑定事件
		div.find("li").bind("click",function(){
			var rs1 = getValue(inp);

			var obj = $(this);
			if(obj.is("li")){ //点击li触发生效复选框改变选中状态
				if(!whenCheckAllClick(inp, boo, obj)){
					setCheck(obj, !obj.find(":checkbox").attr("checked"));
				}
			}
			setIsSelected(inp, obj); //标识当前选中行
			var rs2 = getValue(inp); //取到当前值
			setValue(inp, rs2, rs1); //联动文本框的显示值，并进行勾选状态重置		

			if(!opts.isMulti){//单选时，选中某项就马上收起下拉选项
				div.find(".multipleXiala").hide();
			}

		});
	}

	//重置下拉可选项
	function setItems(obj, datas, isSynfromSelect){
		var inp = $(obj);
		var opts = inp.data();
		var rs1 = null;
		if(!opts.isMulti && inp.is("select") && !isSynfromSelect){//单选，且原始对象为select
			var html = ["<option value=''></option>"];
			var id = opts.id?opts.id:"id";
			var text = opts.text? opts.text:"text";
			for(var i=0; i<datas.length; i++){
				html.push("<option value='"+datas[i][id]+"'>"+datas[i][text]+"</option>");
			}
			inp.find("option").remove();
			inp.append(html.join(''));
		}else{
			rs1={id:inp.val()};
		}
		setLiItems(obj, datas);
		setValue(obj, rs1);
	}

	//设置值
	function setValue(obj, rs1, rs2){
		var inp = $(obj);
		var opts = inp.data();

		if(!rs2){rs2 = getValue(obj);}

		//如果search为true下拉选有可能重置设置,无法选中样式,需要重构下拉选
		//if(opts.search){
		//console.log(opts.datas);
		setLiItems(inp,opts.datas);
		// }
		//设置样式
		setCheckStyle(obj, rs1);

		//设置值
		rs1 = getValue(obj); //因为给的rs参数里可能没有"text"属性,所以重取一次值就会包含文本
		inp.val(rs1.id);
		var textInp = inp.next().find(".deInput");
		textInp.val(rs1.text?rs1.text: opts.placeholder);
		if(textInp.val()==opts.placeholder){textInp.addClass("deInput1");}else{textInp.removeClass("deInput1");}

		if(opts.onChange && rs1.id!=rs2.id){ //事件绑定
			opts.onChange.call(this, rs1);
		}
	}

	//取值
	function getValue(obj){
		var opt = $(obj).data();
		var id='',text='';
		if(opt.isMulti){
			$(obj).next().find(".jqTransformChecked").each(function(){
				var li = $(this).parent().parent();
				var val = li.attr('val');
				var txt = li.attr('text');
				if(val){
					id+=val+",";
					text+=txt+",";
				}
			});
		}else{
			var li = $(obj).next().find(".isSelected");
			var val = li.attr('val');
			var txt = li.attr('text');
			if(val){
				id+=val+",";
				text+=txt+",";
			}
		}

		if(id){
			id=id.substring(0,id.length-1);
			text=text.substring(0,text.length-1);
		}

		return {id:id,text:text};
	}

	//设置选中样式
	function setCheckStyle(obj,rs){
		var opt = $(obj).data();
		var ul = $(obj).next().find("ul");
		var liCnt = ul.find("li").length-1;

		var id = rs?rs.id:"";
		if(opt.isMulti){
			if(!id){
				setCheck(ul, false);
			}else if(id.split(",").length==liCnt){
				setCheck(ul, true);
			}else{
				var ids = id.split(",");
				for(var i=0; i<ids.length; i++){
					setCheck(ul.find("li[val='"+ids[i]+"']"), true);
				}
				setCheck(ul.children().first(), false);
			}
		}else{
			ul.find("li").removeClass("isSelected");
			ul.find("li[val='"+id+"']").addClass('isSelected');
		}
	}

	//打选中标识
	function setIsSelected(obj, item){
		$(obj).next().find("li").removeClass("isSelected");

		var li = $(item).is("li") ? item : $(item).parent().parent();
		$(li).addClass('isSelected');
	}

	//全选 
	function whenCheckAllClick(obj, isMulti ,currentObj){
		var li = currentObj.is('li') ? currentObj : currentObj.parent().parent();
		if(!isMulti || !li.attr('isCheckAllbtn') ){
			return false;
		}

		var lis = li.parent().children();
		var boo = li.find(":checkbox").attr("checked");
		setCheck(lis, !boo);
		return true;
	}

	//得到某对象下的样式复选框
	function getCheckBoxObjs(obj){
		return obj.find(".jqTransformCheckbox");
	}

	//设置勾选状态
	function setCheck(o, isCheck){
		var obj = $(o);
		obj.find(":checkbox").attr("checked", isCheck);
		obj.find(":checkbox").trigger("change");
	}

	//初始化options
	function initOptions(obj, opts){
		var placeholder = "请选择";
		if(!opts.placeholder){opts.placeholder=placeholder;}
		if(!opts.datas || opts.datas.length==0){
			opts.datas = getOptionsData(obj);

			var options = obj.find("option");
			if(options&&options.length>0&& !options.eq(0).val()){
				var text = options.eq(0).text();
				opts.placeholder = (text ? text : placeholder);
			}
		}
		opts.disabled = $(obj).attr("disabled");
		return opts;
	}

	//获取一个下拉选对象的选项数据
	function getOptionsData(obj){
		var datas = [];
		var options = obj.find("option");
		for(var i=0; i<options.length; i++) {
			var id = options.eq(i).val();
			var text = options.eq(i).text();
			if(!id){continue;}
			datas.push({id:id, text: text});
		}
		return datas;
	}

	//比较2个数据对象
	function compare(datas1, datas2){
		if(datas1.length != datas2.length){return true;}
		var id1='',id2='';
		for(var i=0;i<datas1.length;i++){

			id1+=datas1[i].id+",";
			id2+=datas2[i].id+",";
		}
		return id1!=id2;
	}

	/**设置下拉框div在页面的位置  fq add**/
	function setXiaLaPisiton($xl, h){
		var winH = $(window).height();
		var selH = $xl.offset().top;
		if((winH - selH) < h){
			var maxH = $xl.find("ul").css("max-height").replace("px","")/1; //去掉px并转成整型
			var $li = $xl.find("li");
			var ulH = $li.length * $li.height();
			ulH = ulH > maxH ? maxH : ulH;
			$xl.css("top",-(ulH + 12)+"px");  //12是下拉框高度的一半
		}
	}

})(jQuery);
