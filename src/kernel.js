+function($) {

	//+ function($, exports) {
	'use strict';
	var IWEB_VERSION = "1.0.0"
	var IWEB_THEME = "i_theme"
	var IWEB_LOCALE = "i_locale"
	var IWEB_LANGUAGES = "i_languages"
	var IWEB_USERCODE = "usercode"
	var LOG_Level = "ill"
	var systemTimeZoneOffset = -480; //TODO 目前默认即取东八区 -60*8 = -480
	var IWEB_CONTEXT_PATH = "contextpath"
	var iweb = {
		version: IWEB_VERSION
	};

	if (!window.getCookie) {
		window.getCookie = function(sName) {
			var sRE = "(?:; )?" + sName + "=([^;]*);?";
			var oRE = new RegExp(sRE);

			if (oRE.test(document.cookie)) {
				return decodeURIComponent(RegExp["$1"]);
			} else
				return null;
		};
	}

	/**
	 * 创建一个带壳的对象,防止外部修改
	 * @param {Object} proto
	 */
	window.createShellObject = function(proto) {
		var exf = function() {}
		exf.prototype = proto;
		return new exf();
	};


	// 导出到window对象中

	//core context
	(function() {
		// 从Cookie中获取初始化信息
		var environment = {}

		/**
		 * client attributes
		 */
		var clientAttributes = {};

		var sessionAttributes = {};

		var maskerMeta = {
			'float': {
				precision: 2
			},
			'datetime': {
				format: 'yyyy-MM-dd hh:mm:ss',
				metaType: 'DateTimeFormatMeta',
				speratorSymbol: '-'
			},
			'time':{
				format:'hh:mm:ss'
			},
			'date':{
				format:'yyyy-MM-dd'
			},
			'currency':{
				precision: 2,
				curSymbol: '￥'
			}
		}

		var fn = {}

		/**
		 * 获取环境信息
		 * @return {environment}
		 */
		fn.getEnvironment = function() {
			return createShellObject(environment);
		}

		/**
		 * 获取客户端参数对象
		 * @return {clientAttributes}
		 */
		fn.getClientAttributes = function() {
			var exf = function() {}
			return createShellObject(clientAttributes);
		}


		fn.setContextPath = function(contextPath) {
			return environment[IWEB_CONTEXT_PATH] = contextPath
		}
		fn.getContextPath = function(contextPath) {
				return environment[IWEB_CONTEXT_PATH]
			}
			/**
			 * 设置客户端参数对象
			 * @param {Object} k 对象名称
			 * @param {Object} v 对象值(建议使用简单类型)
			 */
		fn.setClientAttribute = function(k, v) {
				clientAttributes[k] = v;
			}
			/**
			 * 获取会话级参数对象
			 * @return {clientAttributes}
			 */
		fn.getSessionAttributes = function() {
			var exf = function() {}
			return createShellObject(sessionAttributes);
		}

		/**
		 * 设置会话级参数对象
		 * @param {Object} k 对象名称
		 * @param {Object} v 对象值(建议使用简单类型)
		 */
		fn.setSessionAttribute = function(k, v) {
			sessionAttributes[k] = v;
			setCookie("ISES_" + k, v);
		}

		/**
		 * 移除客户端参数
		 * @param {Object} k 对象名称
		 */
		fn.removeClientAttribute = function(k) {
			clientAttributes[k] = null;
			execIgnoreError(function() {
				delete clientAttributes[k];
			})
		}

		/**
		 * 获取根组件
		 */
		fn.getRootComponent = function() {
			return this.rootComponet;
		}

		/**
		 * 设置根组件
		 * @param {Object} component
		 */
		fn.setRootComponent = function(component) {
			this.rootComponet = component
		}

		/**
		 * 获取主题名称
		 */
		fn.getTheme = function() {
			return this.getEnvironment().theme
		}

		/**
		 * 获取地区信息编码
		 */
		fn.getLocale = function() {
			return this.getEnvironment().locale
		}
		
		/**
		 * 获取多语信息
		 */
		fn.getLanguages = function(){
			return this.getEnvironment().languages
		}
		/**
		 * 收集环境信息(包括客户端参数)
		 * @return {Object}
		 */
		fn.collectEnvironment = function() {
			var _env = this.getEnvironment();
			var _ses = this.getSessionAttributes();

			for (var i in clientAttributes) {
				_ses[i] = clientAttributes[i];
			}
			_env.clientAttributes = _ses;
			return _env
		}

		fn.changeTheme = function(theme) {
			environment.theme = theme;
			setCookie(IWEB_THEME, theme)
			$(document).trigger("themeChange");
		}
		fn.changeLocale = function(locale) {
				environment.locale = locale;
				setCookie(IWEB_LOCALE, locale)
				$(document).trigger("localeChange");
		}
			/**
			 * 设置数据格式信息
			 * @param {String} type
			 * @param {Object} meta
			 */
		fn.setMaskerMeta = function(type, meta) {
			if (!maskerMeta[type])
				maskerMeta[type] = meta
			else{
				if (typeof meta != 'object')
					maskerMeta[type] = meta
				else			
					for (var key in meta){
						maskerMeta[type][key] = meta[key]
					}
			}
		}
		fn.getMaskerMeta = function(type) {
			return maskerMeta[type]
		}

		/**
		 * 注册系统时间偏移量
		 * @param {Object} offset
		 */
		fn.registerSystemTimeZoneOffset = function(offset) {
			systemTimeZoneOffset = offset;
		}

		/**
		 * 获取系统时间偏移量
		 */
		fn.getSystemTimeZoneOffset = function() {
			return systemTimeZoneOffset;
		};
		var device = {
			Android: function() {
				return /Android/i.test(navigator.userAgent);
			},
			BlackBerry: function() {
				return /BlackBerry/i.test(navigator.userAgent);
			},
			iOS: function() {
				return /iPhone|iPad|iPod/i.test(navigator.userAgent);
			},
			Windows: function() {
				return /IEMobile/i.test(navigator.userAgent);
			},
			any: function() {
				return (this.Android() || this.BlackBerry() || this.iOS() || this.Windows());
			},
			pc: function() {
				return !this.any();
			},
			Screen: {
				size: noop,
				direction: noop

			}
		}
		fn.getDevice = function() {
			return device;
		}


		environment.theme = getCookie(IWEB_THEME)
		environment.locale = getCookie(IWEB_LOCALE)
		environment.languages = getCookie(IWEB_LANGUAGES) ? getCookie(IWEB_LANGUAGES).split(',') : ["ZH"]
		environment.timezoneOffset = (new Date()).getTimezoneOffset()
		environment.usercode = getCookie(IWEB_USERCODE)
			//init session attribute
		document.cookie.replace(/ISES_(\w*)=([^;]*);?/ig, function(a, b, c) {
			sessionAttributes[b] = c;
		})

		var Core = function() {}
		Core.prototype = fn;

		iweb.Core = new Core();

	})();




	//console logger
	(function() {
		var consoleLog;
		var level = getCookie(IWEB_USERCODE)
		if (typeof Log4js != "undefined") {
			consoleLog = new Log4js.Logger("iweb");
			consoleLog.setLevel(Log4js.Level.ERROR);
			var consoleAppender = new Log4js.ConsoleAppender(consoleLog, true);
			consoleLog.addAppender(consoleAppender);
		} else {
			consoleLog = {
				LEVEL_MAP: {
					"OFF": Number.MAX_VALUE,
					"ERROR": 40000,
					"WARN": 30000,
					"INFO": 20000,
					"DEBUG": 10000,
					"TRACE": 5000,
					"ALL": 1
				},
				level: 40000,
				setLevel: function(level) {
					if (level) {
						var l = this.LEVEL_MAP[level.toUpperCase()]
						if (l) {
							this.level = l;
						}
					}

				},
				isDebugEnabled: function() {
					return (this.LEVEL_MAP.DEBUG >= this.level && console)
				},
				isTraceEnabled: function() {
					return (this.LEVEL_MAP.TRACE >= this.level && console)
				},
				isInfoEnabled: function() {
					return (this.LEVEL_MAP.INFO >= this.level && console)
				},
				isWarnEnabled: function() {
					return (this.LEVEL_MAP.WARN >= this.level && console)
				},
				isErrorEnabled: function() {
					return (this.LEVEL_MAP.ERROR >= this.level && console)
				},
				debug: function() {
					if (this.isDebugEnabled()) {
						console.debug.call(console, arguments)
					}
				},
				warn: function() {
					if (this.isWarnEnabled()) {
						console.debug.call(console, arguments)
					}
				},
				info: function() {
					if (this.isInfoEnabled()) {
						console.debug.call(console, arguments)
					}
				},
				trace: function() {
					if (this.isTraceEnabled()) {
						console.debug.call(console, arguments)
					}
				},
				error: function() {
					if (this.isErrorEnabled()) {
						console.debug.call(console, arguments)
					}
				}
			}
		}
		consoleLog.setLevel(level);
		iweb.log = consoleLog;
		iweb.debugMode = false;
	})();

	window.iweb = iweb;

	var noop = function() {}

}($);