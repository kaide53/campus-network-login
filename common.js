$.extend($,{
    checkLicense:function(){
        if(window.license_message){
            alert(window.license_message);
        }
    },
    closePage:function(event){
        if(window.parent !=window){
            if(event) {
                event.preventDefault();
                event.stopPropagation();
            }
            window.parent.postMessage({action:'close'},'*')
        }else{

        }
    },
    keyboard: {
        instance:null,
        selectedInput:null,
        defaultTheme: "hg-theme-default",
        toggleKeyboard:function(target){
            if(!this.instance) this.initKeyboard();
            if($.keyboard.instance.getOptions().theme.indexOf('show-keyboard')>0){
                this.hideKeyboard();
            }else{
                this.showKeyboard(target);
            }
        },
        showKeyboard:function(target) {
            let _this = this
            if(!this.instance) this.initKeyboard();

            document.querySelectorAll("input.keyboard-input").forEach(function(input) {
                input.addEventListener("focus", _this.onInputFocus);
                // Optional: Use if you want to track input changes
                // made without simple-keyboard
                input.addEventListener("input", _this.onInputChange);
            });

            this.instance.setOptions({
                theme: this.defaultTheme+' show-keyboard'
            });
            let heightHolder = document.createElement('div');
            heightHolder.id = 'keyboard-height-holder';
            heightHolder.style.height = '300px'
            document.body.append(heightHolder);
            if(target && $('input[name='+target+']')){
                $('input[name='+target+']').focus()
            }
        },
         onInputFocus:function(event) {
            if(event.target && (event.target.id || event.target.name)){
                $.keyboard.selectedInput = event.target;
                $.keyboard.instance.setOptions({
                    inputName:event.target.id?event.target.id:event.target.name
                });
            }
        },
        hideKeyboard:function() {
            if(!this.instance) this.initKeyboard();
            this.instance.setOptions({
                theme: this.defaultTheme
            });
            let _this = this
            document.querySelectorAll("input.keyboard-input").forEach(function(input) {
                input.removeEventListener("focus", _this.onInputFocus);
                // Optional: Use if you want to track input changes
                // made without simple-keyboard
                input.removeEventListener("input", _this.onInputChange);
            });
            document.body.removeChild(document.getElementById('keyboard-height-holder'))
        },
        onChange:function(input) {

            console.log("Input changed", input);
            if(!this.selectedInput) return;
            this.selectedInput.value = input;
            let evt = document.createEvent('HTMLEvents');
            evt.initEvent('input',true,true)
            this.selectedInput.dispatchEvent(evt)
            this.selectedInput.value = input;
        },
         onInputChange:function(event) {
            $.keyboard.instance.setInput(event.target.value, event.target.name);
        },
        onKeyPress:function(button) {
            console.log("Button pressed", button);

            /**
             * Shift functionality
             */
            if (button === "{lock}" || button === "{shift}") this.handleShiftButton();
        },
         handleShiftButton:function() {
            let currentLayout = this.instance.options.layoutName;
            let shiftToggle = currentLayout === "default" ? "shift" : "default";

            this.instance.setOptions({
                layoutName: shiftToggle
            });
        },
        initKeyboard:function(){
            let _this = this;
            if(this.instance) return;
            let container = document.createElement('div')
            container.className = 'simple-keyboard'
            document.body.append(container);
            this.instance = new SimpleKeyboard.default({
                theme: this.defaultTheme,
                onChange:function(input){_this.onChange(input)},
                onKeyPress:function(button){_this.onKeyPress(button)}
            });
        },

    },
    zytec:{
        confirm:function(title,message,url){
            $.confirm({
                title: title,
                text: message,
                onOK: function () {
                    window.open(url,'_blank');
                },
                onCancel: function () {
                }
            });
        },
        init_tailwind:function(){
            if(window.tailwind){
                tailwind.config = {
                    corePlugins: {
                        preflight: false,
                    }
                }
            }
        },
        bind_submit:function(){
            $('button.submit').one('click',function(event){
                $(event.target).addClass('weui-btn_loading').attr('disabled',true);
                $(event.target).parents('form').submit();
                return false;
            });
        },
        bind_qtip:function(){
            $('[data-tooltip]').qtip({
                style: {
                    classes: 'qtip-shadow qtip-tipsy'
                },
                content:{
                    text:function(event, api) {
                        // Retrieve content from custom attribute of the $('.selector') elements.
                        return $(this).data('tooltip');
                    }

                },
                position: {
                    target: 'mouse',
                    adjust: {
                        mouse: true,
                        scroll:false,
                    }
                }
            })
        },
        init:function(){
            $.checkLicense();
            if(window.navigator.userAgent.indexOf('jwc-self-service')>-1){
                $.keyboard.showKeyboard()
            }
            $.zytec.init_tailwind();
            $(window).keydown(function (e) {
                if (e.which == 13) {
                    return false;
                }
            })
            $.zytec.bind_submit();
            $.zytec.bind_qtip();
        },
        onVerifyImageLoad:function(event,target){
            if(target.src.startsWith('data:')){
                setTimeout(function(){
                    target.src = target.dataset.src
                },300)

            }
        }
    }
    }
);


$(function(){
    $.zytec.init();
})
