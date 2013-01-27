var ManifoldWindowManager = function(args) {
	var self = this;
	this.container = {};
	this.windows = {};

	/* Defer all public methods until the class is done loading. */
	this.ready = $.Deferred();
	this.loading = $.Deferred();


	this.stylesheet = false;
	this._styles = {};

	/* Do we really need to re-implement extend? */
	this.extend = function(args) {
		$.extend(this, args);
	}

	/* Initialize the manager */
	this.init = function(args) {
		this.extend(args);
		this.initStyles();

		this.loading.done(function() {
			self.setDefaults();

			self.ready.resolve();
		});
	}

	this.setDefaults = function() {
		$('body,html').css(this._styles['.fullsize']);

		self.container = $('<div id="wm_container"></div>');
		self.container.css(self._styles['.fullsize']);
		self.container.css(self._styles['.default']);
		$('body').prepend(self.container);
	}

	/* Load in our helper styles */
	this.initStyles = function() {
		if(!this.stylesheet) {
			$('head').append('<link title="manifoldjs" rel="stylesheet" href="manifold.css"/>');
			this.stylesheet = 'link[title="manifoldjs"]';
		}
		$(this.stylesheet).load(function() {
			/* Read the styles we've gotten */
			self._styles = self.readStyles('manifoldjs');
			/* Resolve Loading */
			self.loading.resolve();
		});
	}

	/* Auxilary function to get baseline style data. */
	/* Reads raw css from the stylesheet and builds a hash
	   of style rules from it. */
	/* This is a little janky. But we do *not* want to rely
	   on CSS classes to make things work here, that would
	   defeat the whole purpose. */
	this.readStyles = function(title) { /* Takes the title of the stylesheet */
		var stylesheet;
		var classes = {};

		var rule_group_matcher = /\{\s*(.*?)\s*\}/;
		var rule_matcher = /^\s*([^:]+?)\s*:\s*(.*?)\s*;?\s*$/;

		for(i = 0; i < document.styleSheets.length; i++) {
			elm = document.styleSheets.item(i);
			if(elm.title == title) {
				stylesheet = elm;
				break;
			}
		}

		if(stylesheet) {
			var temp_classes = stylesheet.rules || stylesheet.cssRules;

			for(var i=0;i<temp_classes.length;i++) {
				var className = temp_classes[i].selectorText;
				classes[className] = {};

				var rule = temp_classes[i].cssText || classes[x].style.cssText;
				rule = rule.match(rule_group_matcher)[1];

				var rules = rule.split(';');
				for(j in rules) {
					matched_rules = rules[j].match(rule_matcher);
					if(matched_rules) {
						classes[className][matched_rules[1]] = matched_rules[2];
					}
				}
			}
		}

		return classes;
	}

	this.addWindow = function(name, attrs) {
		var mwindow = new ManifoldWindow(self, name, attrs);
		self.windows[name] = mwindow;

		$.when(this.ready, mwindow.ready).done(function() {
			self.container.append(mwindow.view);
		});

		return mwindow;
	}

	/* Start the manager */
	this.init(args);
}

var ManifoldWindow = function(wm, name, attrs) {
	var self = this;

	this.wm = wm;
	this.view = {};

	this.ready = $.Deferred();

	this.init = function(name, attrs) {
		this.view = $('<section></section>');

		this.view.attr('id', name);

		this.wm.ready.done(function() {
			self._styles = self.wm._styles;

			self.doStyles(attrs);
		});

		return this.view;
	}

	this.doStyles = function(attrs) {
		this.view.css(this._styles['.default']);

		if(attrs['attach-top']) {
			if(attrs['attach-top'] === true) {
				this.view.css(this._styles['.attach-top']);
			}
			else {
				/* Fix me */
				var top = this.wm.windows[attrs['attach-top']].window.outerHeight(true) +
					parseInt(this.wm.windows[attrs['attach-top']].window.top());
				this.view.css('top', top+'px');
			}

		}
		if(attrs['attach-bottom']) {
			if(attrs['attach-bottom'] === true) {
				this.view.css(this._styles['.attach-bottom']);
			}
			else {
				/* Fix me */
				var bottom = this.wm.windows[attrs['attach-bottom']].window.outerHeight(true) +
					parseInt(this.wm.windows[attrs['attach-bottom']].window.bottom());
				this.view.css('bottom', bottom+'px');
			}

		}
		if(attrs['attach-left']) {
			if(attrs['attach-left'] === true) {
				this.view.css(this._styles['.attach-left']);
			}
			else {
				/* Fix me */
				var left = this.wm.windows[attrs['attach-left']].window.outerWidth(true) +
					parseInt(this.wm.windows[attrs['attach-left']].window.css('left'));
				this.view.css('left', left+'px');
			}
		}
		if(attrs['attach-right']) {
			if(attrs['attach-right'] === true) {
				this.view.css(this._styles['.attach-right']);
			}
			else {
				/* Fix me */
				var right = this.wm.windows[attrs['attach-right']].window.outerWidth(true) +
					parseInt(this.wm.windows[attrs['attach-right']].window.css('right'));
				this.view.css('right', right+'px');
			}
		}

		if(attrs['width']) {
			this.view.css('width', attrs['width']);
		}
		if(attrs['height']) {
			this.view.css('height', attrs['height']);
		}

		if(attrs['scrollbox']) {
			this.view.css('overflow', 'auto');
		}

		this.ready.resolve();
	}

	this.append = function(content) {
		this.view.append(content);
	}

	this.init(name, attrs);

	return this;
}