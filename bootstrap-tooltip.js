/* ===========================================================
 * bootstrap-tooltip.js v2.3.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

  "use strict"; // jshint ;_;

  /* TOOLTIP PUBLIC CLASS DEFINITION
   * =============================== */

  var tipId = 0;

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options);
  };

  var position_opposites = {
    'top': 'bottom',
    'bottom': 'top',
    'left':'right',
    'right': 'left'
  };

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn;
      var eventOut;
      var triggers;
      var trigger;
      var i;

      this.type = type;
      this.$element = $(element);
      this.options = this.getOptions(options);

      if (typeof this.options.placement != 'function'
        && !position_opposites.hasOwnProperty(this.options.placement)) {
        throw new Error("Invalid position value: " + position + "'");
      }

      this.id = ++tipId;
      this.enabled = true;
      this.shown = false;

      triggers = this.options.trigger.split(' ');

      for (i = triggers.length; i--;) {
        trigger = triggers[i];
        if (trigger === 'click') {
          this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
        } else if (trigger !== 'manual') {
          eventIn = trigger === 'hover' ? 'mouseenter' : 'focus';
          eventOut = trigger === 'hover' ? 'mouseleave' : 'blur';
          this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
          this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
        }
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, {trigger: 'manual', selector: ''})) :
        this.fixTitle();
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options);

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        };
      }

      return options;
    }

  , enter: function (e) {
      var defaults = $.fn[this.type].defaults
        , options = {}
        , self;

      this._options && $.each(this._options, function (key, value) {
        if (defaults[key] !== value) {
          options[key] = value;
        }
      });

      self = $(e.currentTarget)[this.type](options).data(this.type);

      if (!self.options.delay || !self.options.delay.show) {
        return self.show();
      }

      clearTimeout(this.timeout);
      self.hoverState = 'in';
      this.timeout = setTimeout(function () {
        if (self.hoverState === 'in') {
          self.show();
        }
      }, self.options.delay.show);
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type);

      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      if (!self.options.delay || !self.options.delay.hide) {
        return self.hide();
      }

      self.hoverState = 'out';
      this.timeout = setTimeout(function () {
        if (self.hoverState === 'out') {
          self.hide();
        }
      }, self.options.delay.hide);
    }

  , reposition: function () {
      this.applyPosition(this.getPlacementFunction().call(this, this.tip()[0], this.$element[0]));
    }

  , show: function () {
      if (!this.enabled || !this.hasContent()) {
        return;
      }

      if (this.shown) {
        this.reposition();
        return;
      }

      var e = $.Event('show');
      this.$element.trigger(e);
      if (e.isDefaultPrevented()) {
        return;
      }

      this.setContent();

      var $tip = this.tip();

      if (this.options.animation) {
        $tip.addClass('fade');
      }

      $tip
        .detach()
        .css({top: 0, left: 0, display: 'block', height: '', width: ''});

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);

      var placement = this.getPlacementFunction().call(this, $tip[0], this.$element[0]);

      $tip.addClass('in');

      this.applyPosition(placement);

      // fix size for disable further shape changing (word wrap)
      var tipRect = this.getElementRect($tip);
      $tip.outerHeight(tipRect.height.toFixed(2));
      $tip.outerWidth(tipRect.width.toFixed(2));

      $(window).on('scroll.' + this.type + this.id + ' resize.' + this.type + this.id, $.proxy(this.reposition, this));
      this.shown = true;

      this.$element.trigger('shown');
    }

  , getPlacementFunction: function() {
      if (typeof this.options.placement === 'function') {
        return this.options.placement;
      } else {
        return this[this.options.placement + 'Placement'];
      }
    }

  , topPlacement: function(tip, element) {
      var elPos = this.getElementRect(element);
      var tipHeight = tip.offsetHeight;

      if (elPos.top < tipHeight) {
        return 'bottom';
      }

      return 'top';
    }

  , bottomPlacement: function(tip, element) {
      var elPos = this.getElementRect(element);
      var tipHeight = tip.offsetHeight;

      if ($(window).height() - elPos.top - elPos.height < tipHeight) {
        return 'top';
      }

      return 'bottom';
    }

  , leftPlacement: function(tip, element) {
      var elPos = this.getElementRect(element);
      var tipWidth = tip.offsetWidth;

      if (elPos.left < tipWidth) {
        return 'right';
      }

      return 'left';
    }

  , rightPlacement: function(tip, element) {
      var elPos = this.getElementRect(element);
      var tipWidth = tip.offsetWidth;

      if ($(window).width() - elPos.left - elPos.width < tipWidth) {
        return 'left';
      }

      return 'right';
    }

  , applyPosition: function (placement) {

      var $tip = this.tip();
      var $window = $(window);

      $tip.removeClass('top left right bottom');

      var tipRect = this.getElementRect($tip);
      var pos = this.getElementRect(this.$element);
      var offset;

      switch (placement) {
        case 'bottom':
          offset = {
            top: pos.bottom + $window.scrollTop(),
            left: pos.left + pos.width / 2 - tipRect.width / 2 + $window.scrollLeft()
          };
          break;
        case 'top':
          offset = {
            top: pos.top - tipRect.height + $window.scrollTop(),
            left: pos.left + pos.width / 2 - tipRect.width / 2 + $window.scrollLeft()
          };
          break;
        case 'left':
          offset = {
            top: pos.top + pos.height / 2 - tipRect.height / 2 + $window.scrollTop(),
            left: pos.left - tipRect.width + $window.scrollLeft()
          };
          break;
        case 'right':
          offset = {
            top: pos.top + pos.height / 2 - tipRect.height / 2 + $window.scrollTop(),
            left: pos.right + $window.scrollLeft()
          };
          break;
      }

      // oldSizes needed because browser can change size of element,
      // for example - apply word wraps
      var oldSizes = tipRect;
      $tip.offset(offset);
      $tip.addClass(placement);
      tipRect = this.getElementRect(this.tip());

      var arrow_position;
      var replace_offset = false;
      var delta = 0;

      if (placement === 'top' && tipRect.height !== oldSizes.height) {
        offset.top = offset.top + oldSizes.height - tipRect.height;
        offset.left = offset.left + (oldSizes.width - tipRect.width) / 2;
        replace_offset = true;
      }

      if (placement === 'left' && tipRect.width !== oldSizes.width) {
        offset.left = offset.left + oldSizes.width - tipRect.width;
        replace_offset = true;
      }

      if (placement === 'bottom' || placement === 'top') {
        arrow_position = 'left';

        if (offset.left < $window.scrollLeft()) {
          if (pos.right < 0) {
            if (offset.left < 0) {
              delta = -offset.left;
            }
          } else {
            delta = $window.scrollLeft() - offset.left;
          }

          offset.left = offset.left + delta;
          replace_offset = true;
        }

        if (offset.left + tipRect.width > $window.width() + $window.scrollLeft()) {
          arrow_position = 'right';

          if (pos.left > $window.width()) {
            if (offset.left + tipRect.width > $(document).width()) {
              delta = tipRect.width + offset.left - $(document).width();
            }
          } else {
            delta = tipRect.width + offset.left - ($window.width() + $window.scrollLeft());
          }

          offset.left = offset.left - delta;
          replace_offset = true;
        }

        this.moveArrow(
          tipRect.width,
          (tipRect.width - oldSizes.width) / 2 + (oldSizes.width / 2) - delta,
          arrow_position
        );
      }

      if (placement === 'left' || placement === 'right') {
        arrow_position = 'top';

        if (offset.top < $window.scrollTop()) {
          if (pos.bottom < 0) {
            if (offset.top < 0) {
              delta = -offset.top;
            }
          } else {
            delta = $window.scrollTop() - offset.top;
          }

          offset.top = offset.top + delta;
          replace_offset = true;
        }

        if (offset.top + tipRect.height > $window.height() + $window.scrollTop()) {
          arrow_position = 'bottom';

          if (pos.top > $window.height()) {
            if (offset.top + tipRect.height > $(document).height()) {
              delta = tipRect.height + offset.top - $(document).height();
            }
          } else {
            delta = tipRect.height + offset.top - $window.height() - $window.scrollTop();
          }

          offset.top = offset.top - delta;
          replace_offset = true;
        }

        this.moveArrow(
          tipRect.height,
          (oldSizes.height - tipRect.height) / 2 + (tipRect.height / 2) - delta,
          arrow_position
        );
      }

      if (replace_offset) {
        $tip.offset(offset);
      }
    }

  , moveArrow: function(parentDimension, offset, position) {
      if (offset < 0) {
        offset = 0;
      }

      var arrow = this.arrow();
      arrow.removeClass('top-edge bottom-edge left-edge right-edge');

      if (offset < parseInt(this.inner().css('border-radius')) * 2) {
        arrow.addClass(position + '-edge');
      }

      arrow.css({
        top: '',
        left: '',
        right: '',
        bottom: ''
      });
      arrow.css(position_opposites[position], 'auto');
      arrow.css(position, offset);
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle();

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
      $tip.removeClass('fade in top bottom left right');
    }

  , hide: function () {
      if (!this.shown) {
        return;
      }

      var $tip = this.tip();
      var e = $.Event('hide');

      this.$element.trigger(e);
      if (e.isDefaultPrevented()) {
        return;
      }

      $tip.removeClass('in');

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach();
        }, 500);

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout);
          $tip.detach();
        });
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach();

      $(window).off('.' + this.type + this.id, this.reposition);

      this.shown = false;
      this.$element.trigger('hidden');

      return this;
    }

  , fixTitle: function () {
      var $e = this.$element;
      if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
      }
    }

  , hasContent: function () {
      return this.getTitle();
    }

  , getElementRect: function (elem) {
      if (elem instanceof jQuery) {
        elem = $(elem)[0];
      }
      var rect = elem.getBoundingClientRect();

      if (rect.top === 0 && rect.bottom === 0 && rect.left === 0 && rect.right === 0) {
        rect = elem.getBoundingClientRect(); // again, fix for ie bug
      }

      if ('width' in rect && 'height' in rect) {
        return rect;
      } else {
        return $.extend({}, rect, {
          width: elem.offsetWidth,
          height: elem.offsetHeight
        });
      }
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options;

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);

      return title;
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template);
    }

  , arrow: function () {
      return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow");
    }

  , inner: function () {
      return this.$inner = this.$inner || this.tip().find('.tooltip-inner');
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide();
        this.$element = null;
        this.options = null;
      }
    }

  , enable: function () {
      this.enabled = true;
    }

  , disable: function () {
      this.enabled = false;
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled;
    }

  , toggle: function (e) {
      var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this;
      if (self.shown) {
        self.hide();
      } else {
        self.show();
      }
    }

    , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type);
    }

  };


  /* TOOLTIP PLUGIN DEFINITION
   * ========================= */

  var old = $.fn.tooltip;

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('tooltip');
      var options = typeof option == 'object' && option;
      if (!data) {
        $this.data('tooltip', (data = new Tooltip(this, options)));
      }
      if (typeof option == 'string') {
        data[option]();
      }
    });
  };

  $.fn.tooltip.Constructor = Tooltip;

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  };


  /* TOOLTIP NO CONFLICT
   * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };

}(window.jQuery);

/* ===========================================================
 * bootstrap-popover.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


  /* POPOVER PUBLIC CLASS DEFINITION
   * =============================== */

  var Popover = function (element, options) {
    this.init('popover', element, options);
  };


  /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

    constructor: Popover

  , setContent: function () {
      var $tip = this.tip();
      var title = this.getTitle();
      var content = this.getContent();

      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
      $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content);

      $tip.removeClass('fade top bottom left right in');
    }

  , hasContent: function () {
      return this.getTitle() || this.getContent();
    }

  , getContent: function () {
      var content;
      var $e = this.$element;
      var o = this.options;

      content = (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)
        || $e.attr('data-content');

      return content;
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template);
      }
      return this.$tip;
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type);
    }

  });


  /* POPOVER PLUGIN DEFINITION
   * ======================= */

  var old = $.fn.popover;

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option;
      if (!data) $this.data('popover', (data = new Popover(this, options)));
      if (typeof option == 'string') data[option]();
    });
  };

  $.fn.popover.Constructor = Popover;

  $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  });


  /* POPOVER NO CONFLICT
   * =================== */

  $.fn.popover.noConflict = function () {
    $.fn.popover = old;
    return this;
  };

}(window.jQuery);
