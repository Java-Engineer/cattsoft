var vueApp =  new Vue({
		//绑定元素
		el:"#app",
		//数据
		data :{
			account: '', //用户名
			isCollapse: false, //菜单展开收缩
			editableTabsValue: 'index', //当前tab页name
			editableTabs: [{ //tab数据列表
				id: 'index', //iframeId
				title: '首页', //标题
				name: 'index', //与选项卡 activeName 对应的标识符，表示选项卡别名
				src: 'template/welcom.html' //src路径
			}],
			menuOptions: [
				{
					id: '01',
					title: '基础组件',
					name: '01',
					src: '',
					iconClass: 'el-icon-menu',
					children: [
						{
							id: '0101',
							title: '盒子色块',
							name: '0101',
							src: 'template/base-color.html',
							children: []
						},
						{
							id: '0102',
							title: '图标',
							name: '0102',
							src: 'template/icon.html',
							children: []
						},
						{
							id: '0103',
							title: '按钮',
							name: '0103',
							src: 'template/button.html',
							children: []
						}
					]
				},
				{
					id: '02',
					title: '表单组件',
					name: '02',
					src: 'demo/form.html',
					iconClass: 'el-icon-date',
					children: [
						{
							id: '0201',
							title: '单选框',
							name: '0201',
							src: 'template/radio.html',
							children: []
						},
						{
							id: '0202',
							title: '多选框',
							name: '0202',
							src: 'template/rebox.html',
							children: []
						},
						{
							id: '0203',
							title: '输入框',
							name: '0203',
							src: 'template/ww.html',
							children: []
						},
						{
							id: '0203',
							title: '选择框',
							name: '0203',
							src: 'template/123.html',
							children: []
						}
					]
				},
				{
					id: '03',
					title: '数据展示',
					name: '03',
					src:"",
					iconClass: 'el-icon-tickets',
					children: [
						{
							id: '0301',
							title: '图标',
							name: '0301',
							src:"demo/xx.html",
							iconClass: 'el-icon-menu',
							children: []
						},
						{
							id: '0302',
							title: '按钮&标签',
							name: '0302',
							src:"demo/xx.html",
							iconClass: 'el-icon-menu',
							children: []
						},
						{
							id: '0303',
							title: '进度条&标记',
							name: '0303',
							src:"demo/progress.html",
							iconClass: 'el-icon-menu',
							children: []
						}
					]
				},{
					id: '04',
					title: '弹窗',
					name: '04',
					src:"",
					iconClass: 'el-icon-news',
					children: [
						// {
						// 	id: '0401',
						// 	title: '树形控件',
						// 	name: '0401',
						// 	src:"demo/element-Tree.html",
						// 	iconClass: 'el-icon-menu',
						// 	children: []
						// },
						{
							id: '0402',
							title: '弹窗控件',
							name: '0402',
							src:"demo/pop.html",
							iconClass: 'el-icon-menu',
							children: []
						},
						{
							id: '0403',
							title: '导出导入',
							name: '0403',
							src:"demo/importExport.html",
							iconClass: 'el-icon-menu',
							children: []
						}
					]
				},{
					id: '05',
					title: '自定义组件',
					name: '04',
					src:"",
					iconClass: 'el-icon-star-on',
					children: [
						// {
						// 	id: '0401',
						// 	title: '树形控件',
						// 	name: '0401',
						// 	src:"demo/element-Tree.html",
						// 	iconClass: 'el-icon-menu',
						// 	children: []
						// },
						{
							id: '0402',
							title: '弹窗控件',
							name: '0402',
							src:"demo/pop.html",
							iconClass: 'el-icon-menu',
							children: []
						},
						{
							id: '0403',
							title: '导出导入',
							name: '0403',
							src:"demo/importExport.html",
							iconClass: 'el-icon-menu',
							children: []
						}
					]
				}
				],
			iframeHei: document.body.clientHeight-43
		},
		methods: {
		 	/**
			 * 菜单展开收缩
			 */
			collapse: function() {
				this.isCollapse = !this.isCollapse;
				//this.setFootWid();
			},
			/**
			 * 增加tab标签页
			 */
			addTab(event, item) {
				let name = item.name;
				let tabs = this.editableTabs;
				let boo = false;
				tabs.forEach((tab, index) => {
					if (tab.name === name) {
						boo = true;
					}
				});

				if (!boo) {
					this.editableTabs.push({
						id: item.id,
						title: item.title,
						name: name,
						src: item.src
					});
				}
				this.editableTabsValue = name;
			},
			/**
			 * 移除tab标签页
			 */
			removeTab: function(targetName) {
				if (targetName === 'index') {
					return;
				}
				let tabs = this.editableTabs;
				let activeName = this.editableTabsValue;
				if (activeName === targetName) {
					tabs.forEach((tab, index) => {
						if (tab.name === targetName) {
							let nextTab = tabs[index + 1] || tabs[index - 1];
							if (nextTab) {
								activeName = nextTab.name;
							}
						}
					});
				}
				this.editableTabsValue = activeName;
				this.editableTabs = tabs.filter(tab => tab.name !== targetName);
			},
			/**
			 * 上一标签页
			 */
			prevTab: function() {
				let tabs = this.editableTabs;
				let activeName = this.editableTabsValue;
				tabs.forEach((tab, index) => {
					if (tab.name === this.editableTabsValue) {
						let prevTab = tabs[index - 1];
						if (prevTab) {
							activeName = prevTab.name;
						}
					}
				});
				this.editableTabsValue = activeName;
			},
			/**
			 * 下一标签页
			 */
			nextTab: function() {
				let tabs = this.editableTabs;
				let activeName = this.editableTabsValue;
				tabs.forEach((tab, index) => {
					if (tab.name === this.editableTabsValue) {
						let nextTab = tabs[index + 1];
						if (nextTab) {
							activeName = nextTab.name;
						}
					}
				});
				this.editableTabsValue = activeName;
			},
			/**
			 * 刷新
			 */
			refresh: function(targetName) {
				if (targetName === 'index') {
					window.location.reload();
				}
				let tabs = this.editableTabs;
				tabs.forEach((tab, index) => {
					if (tab.name === targetName) {
						document.getElementById(tab.id).contentWindow.location.reload(true);
					}
				})
			},
			/**
			 * 返回上一页
			 */
			reply: function(targetName) {
				if (targetName === 'index') {
					return;
				}
				let tabs = this.editableTabs;
				tabs.forEach((tab, index) => {
					if (tab.name === targetName) {
						if (document.getElementById(tab.id).contentWindow.history.length > 0) {
							document.getElementById(tab.id).contentWindow.history.back();
						}
					}
				})
			},
			/**
			 * 关闭当前选项卡
			 */
			closeCurrent: function() {
				this.removeTab(this.editableTabsValue);
			},
			/**
			 * 关闭所有选项卡
			 */
			closeAll: function() {
				let tabs = this.editableTabs;
				this.editableTabsValue = 'index';
				this.editableTabs = tabs.filter(tab => tab.name === 'index');
			},
			/**
			 * 关闭其他选项卡
			 */
			closeOther: function() {
				let tabs = this.editableTabs;
				this.editableTabs = tabs.filter(tab => tab.name === 'index' || tab.name === this.editableTabsValue);
			},
			/**
			 * 全屏
			 */
			fullScreen: function(e) {
				if (e.currentTarget.className.indexOf('unscreen') > -1) {
					this.exitFullscreen(e.currentTarget);
				} else {
					this.requestFullScreen(e.currentTarget);
				}
			},
			/**
			 * 进入全屏
			 */
			requestFullScreen: function(e) {
				let elem = document.documentElement;
				if (elem.webkitRequestFullScreen) {
					elem.webkitRequestFullScreen();
				} else if (elem.mozRequestFullScreen) {
					elem.mozRequestFullScreen();
				} else if (elem.requestFullScreen) {
					elem.requestFullscreen();
				} else {
					//浏览器不支持全屏API或已被禁用
				}
				e.innerHTML = '<i class="fa fa-compress"></i>';
				e.classList.add('unscreen');
			},
			/**
			 * 退出全屏
			 */
			exitFullscreen: function(e) {
				let de = document;
				if (de.exitFullscreen) {
					de.exitFullscreen();
				} else if (de.mozCancelFullScreen) {
					de.mozCancelFullScreen();
				} else if (de.webkitCancelFullScreen) {
					de.webkitCancelFullScreen();
				}
				e.innerHTML = '<i class="fa fa-arrows"></i>';
				e.classList.remove('unscreen');
			},
			/**
			 * 安全退出
			 */
			logout: function() {
				let _this = this;
				_this.$axios({
					method: 'get',
					url: 'openRest/oauth2/logout',
					data: '',
					success: (resp) => {
						let {
							code,
							message,
							data
						} = resp.data;
						if (code !== 200) {
							_this.$message.error(message);
						} else {
							_this.$message.success(message);
							localStorage.removeItem('access_token');
							localStorage.removeItem('refresh_token');
							localStorage.removeItem('account');
							setTimeout(function() {
								window.location.href = './login.html';
							}, 200)
						}
					},
					error: (error) => {
						_this.$message.error(error);
					}
				})
			},
			/**
			 * 自适应
			 */
			setWH: function() {
				let _this = this;
				window.onresize = () => {
					return (() => {
						_this.iframeHei = window.parent.document.body.clientHeight-43;
					})()
			    }
			}
		},
		computed: {
			/**
			 * 计算iframe高度
			 */
			getIframeHei: function(){
				return this.iframeHei;
			}
		},
		mounted() {
			this.setWH();
		}
	});