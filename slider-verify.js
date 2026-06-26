(function () {
    'use strict';

    var extend = function () {
        var length = arguments.length;
        var target = arguments[0] || {};
        if (typeof target != "object" && typeof target != "function") {
            target = {};
        }
        if (length == 1) {
            target = this;
            i--;
        }
        for (var i = 1; i < length; i++) {
            var source = arguments[i];
            for (var key in source) {
                // 使用for in会遍历数组所有的可枚举属性，包括原型。
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    var isFunction = function isFunction(obj) {
        return typeof obj === "function" && typeof obj.nodeType !== "number";
    };

    var SliderVerify = function (element, options) {
        this.$element = element;
        this.options = extend({}, SliderVerify.DEFAULTS, options);
        this.$element.style.position = 'relative';
        this.$element.style.width = this.options.width + 'px';
        this.$element.style.margin = '0 auto';
        this.$element.className = 'slider-verify'
        this.init();
    };

    SliderVerify.VERSION = '1.0';
    SliderVerify.Author = 'xecrom@qq.com';
    SliderVerify.DEFAULTS = {
        get_api:null,
        width: 280,     // 宽度
        height: 155,    // 高度
        sliderL: 80,    // 滑块边长
        offset: 5,      // 容错偏差
        loadingText: '正在加载中...',
        failedText: '再试一次',
        barText: '请拖动左侧滑块至正确缺口',
        repeatIcon: 'fa fa-repeat',
        maxLoadCount: 3,
        localImages: function () {
            return 'images/Pic' + Math.round(Math.random() * 4) + '.jpg';
        },
        verify:null,
    };

    function Plugin(option) {
        var $this = document.getElementById(option.id);
        if($this){
        var options = typeof option === 'object' && option;
        if(!options.get_api){
            console.log('请配置滑动验证码后台地址get_api');
        }else{
            return new SliderVerify($this, options);
        }
        }
    }

    window.sliderVerify = Plugin;
    window.sliderVerify.Constructor = SliderVerify;

    var _proto = SliderVerify.prototype;
    _proto.init = function () {
        this.initDOM();
        this.loadData();
        this.bindEvents();
    };

    _proto.decrypt =  function(str,token) {
        var key = CryptoJS.enc.Utf8.parse(token.substr(0,16));
        var iv = CryptoJS.enc.Utf8.parse(token.substr(0,16));
        var decrypted = CryptoJS.AES.decrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted;
    },

    _proto.initDOM = function () {
        var createElement = function (tagName, className) {
            var elment = document.createElement(tagName);
            elment.className = className;
            return elment;
        };

        var createCanvas = function (width, height) {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            return canvas;
        };

        var bg = createCanvas(this.options.width, this.options.height);
        var block = createCanvas(this.options.sliderL, this.options.height);
        var imageContainer = createElement('div','imageContainer');
        var loadingContainer = createElement('div','loadingContainer');
        loadingContainer.style.width = this.options.width;
        loadingContainer.style.height = this.options.height;
        var loadingIcon = createElement('div','iconfont iconjiazaizhong loadingIcon');
        var loadingText = createElement('div','loading-text');
        loadingText.textContent = '加载中...';
        loadingIcon.appendChild(loadingText);
        loadingContainer.appendChild(loadingIcon);
        var sliderContainer = createElement('div', 'sliderContainer');
        var refreshIcon = createElement('i', 'refreshIcon ' + this.options.repeatIcon);
        var sliderMask = createElement('div', 'sliderMask');
        var sliderbg = createElement('div', 'sliderbg');
        var slider = createElement('div', 'slider');
        var sliderIcon = createElement('i', ' sliderIcon');
        var text = createElement('span', 'sliderText');

        block.className = 'block';
        text.innerHTML = this.options.barText;

        var el = this.$element;
        imageContainer.appendChild(bg);
        imageContainer.appendChild(block);
        imageContainer.appendChild(refreshIcon);
        imageContainer.appendChild(loadingContainer);
        el.appendChild(imageContainer);
        slider.appendChild(sliderIcon);
        sliderMask.appendChild(slider);
        sliderContainer.appendChild(sliderbg);
        sliderContainer.appendChild(sliderMask);
        sliderContainer.appendChild(text);
        el.appendChild(sliderContainer);

        var _tmp = {
            x:0,
            bg: bg,
            block: block,
            loadingContainer:loadingContainer,
            sliderContainer: sliderContainer,
            refreshIcon: refreshIcon,
            slider: slider,
            sliderMask: sliderMask,
            sliderIcon: sliderIcon,
            text: text,
            bgCtx: bg.getContext('2d'),
            blockCtx: block.getContext('2d')
        };

        if (isFunction(Object.assign)) {
            Object.assign(this, _tmp);
        }
        else {
            extend(this, _tmp);
        }
    };

    _proto.loadData = function () {
        var that = this;
        that.text.textContent = this.options.loadingText;
        that.text.setAttribute('data-text', this.options.barText);
        that.loadingContainer.style.display = 'block';
        $.post(that.options.get_api,{width:this.options.width,height:this.options.height,block_size:this.options.sliderL},function(res){
            if(res && res.data && res.data.bg && res.data.block){
                that.x = that.decrypt(res.data.d,res.data.token).toString(CryptoJS.enc.Utf8)
                that.token= res.data.token;
                that.options.offset = res.data.offset;
                var bg = new Image();
                bg.crossOrigin = "Anonymous";
                bg.onload = function(){

                    that.bgCtx.clearRect(0,0,that.bg.width,that.bg.height)
                    that.bgCtx.drawImage(bg,0,0);
                }
                bg.src = res.data.bg;

                var block = new Image();
                block.crossOrigin = "Anonymous";
                block.onload = function(){
                    that.blockCtx.clearRect(0,0,that.block.width,that.block.height)


                    that.blockCtx.save()
                    // 设置阴影颜色
                    that.blockCtx.shadowColor = 'white';
// 偏移量X
                    that.blockCtx.shadowOffsetX = 0;
// 偏移量Y
                    that.blockCtx.shadowOffsetY = 0;
// 模糊度
                    that.blockCtx.shadowBlur = 5;
                    that.blockCtx.drawImage(block,0,0);
                }
                block.src = res.data.block;
                that.loadingContainer.style.display = 'none';
            }
            that.text.textContent = that.text.getAttribute('data-text');

        },'json')

    };

    _proto.clean = function () {
        var that = this;
        that.bgCtx.clearRect(0,0,that.bg.width,that.bg.height)
        that.blockCtx.clearRect(0,0,that.block.width,that.block.height)
    };

    _proto.bindEvents = function () {
        var that = this;
        this.$element.addEventListener('selectstart', function (e) {
            return false;
        });

        this.refreshIcon.addEventListener('click', function () {
            that.text.textContent = that.options.barText;
            that.reset();
            if (isFunction(that.options.onRefresh)) that.options.onRefresh.call(that.$element);
        });

        var originX, originY, trail = [],
            isMouseDown = false;

        var handleDragStart = function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (that.text.classList.contains('text-danger')) return false;
            originX = e.clientX || e.touches[0].clientX;
            originY = e.clientY || e.touches[0].clientY;

            isMouseDown = true;
            return false;
        };

        var handleDragMove = function (e) {

            if (!isMouseDown) return false;
            e.preventDefault();
            e.stopPropagation();
            var eventX = e.clientX || e.touches[0].clientX;
            var eventY = e.clientY || e.touches[0].clientY;
            var moveX = eventX - originX;
            var moveY = eventY - originY;
            if (moveX < 0 || moveX + 40 > that.options.width) return false;
            that.slider.style.left = (moveX - 1) + 'px';
            var blockLeft =  (that.options.width - that.options.sliderL) / (that.options.width - that.options.sliderL) * moveX;
            that.block.style.left = blockLeft + 'px';

            that.sliderContainer.classList.add('sliderContainer_active');
            that.sliderMask.style.width = (moveX + 4) + 'px';
            trail.push(Math.round(moveY));
        };

        var handleDragEnd = function (e) {

            if (!isMouseDown) return false;
            isMouseDown = false;
            var eventX = e.clientX || e.changedTouches[0].clientX;
            if (eventX === originX) return false;

            that.sliderContainer.classList.remove('sliderContainer_active');
            that.trail = trail;
            var data = that.verify();
            if (data.spliced && data.verified) {
                that.sliderContainer.classList.add('sliderContainer_success');
                if (isFunction(that.options.onSuccess)) that.options.onSuccess.call(that);
            } else {
                that.sliderContainer.classList.add('sliderContainer_fail');
                if (isFunction(that.options.onFail)) that.options.onFail.call(that);
                setTimeout(function () {
                    that.text.innerHTML = that.options.failedText;
                    that.reset();
                }, 1000);
            }
        };

        this.slider.addEventListener('mousedown', handleDragStart);
        this.slider.addEventListener('touchstart', handleDragStart,{ passive: false });
        this.slider.addEventListener('selectstart', function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);

        document.addEventListener('mousedown', function () { return false; });
        document.addEventListener('touchstart', function () { return false; },{ passive: false });
        document.addEventListener('swipe', function () { return false; });
    };

    _proto.verify = function () {
        var arr = this.trail; // 拖动时y轴的移动距离
        var left = parseInt(this.block.style.left);
        var verified = false;
        if (isFunction(this.options.verify)){
            verified = this.options.verify.call(arr,this);
        }
        else {
            var sum = function (x, y) { return x + y; };
            var square = function (x) { return x * x; };
            var average = arr.reduce(sum) / arr.length;
            var deviations = arr.map(function (x) { return x - average; });
            var stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length);
            verified = stddev !== 0;
        }
        return {
            spliced: Math.abs(left - this.x) < this.options.offset,
            verified: verified
        };
    };

    _proto.reset = function () {
        this.sliderContainer.classList.remove('sliderContainer_fail');
        this.sliderContainer.classList.remove('sliderContainer_success');
        this.slider.style.left = 0;
        this.block.style.left = 0;
        this.sliderMask.style.width = 0;
        this.clean();
        this.text.setAttribute('data-text', this.text.textContent);
        this.text.textContent = this.options.loadingText;
        this.loadData();
    };
})();
