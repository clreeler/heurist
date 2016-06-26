if (!top.HEURIST4){
    top.HEURIST4 = {};
}

/*
showMsgErrJson - check if response is json 
showMsgErr     -    loads into id=dialog-error-messages
showMsgDlgUrl  - loads content url (not frame!) into dialog (getMsgDlg) and show it (showMsgDlg)

getMsgDlg      - creates and returns div (id=dialog-common-messages) that is base element for jquery ui dialog
getPopupDlg    - creates and returns div (id=dialog-popup) similar to  dialog-common-messages - but without width limit

showMsgDlg     - MAIN 
showMsgWorkInProgress - shows standard work in progress message
showPrompt    - show simple input value dialog with given prompt message
    
showMsgFlash - show buttonless dialog with given timeout
checkLength  - fill given element with error message and highlight it
checkLength2 - get message if input value beyound given ranges

showDialog - creates div with frame, loads url content into it and shows it as popup dialog, on close this div will be removed
showElementAsDialog

createAlertDiv - return error-state html with alert icon 

*/
if (! top.HEURIST4.msg) top.HEURIST4.msg = {

    showMsgErrJson: function(response){
        if(typeof response === "string"){
            showMsgErr(null);
        }else{
            showMsgErr('Cannot parse server response: '+response.substr(0,255)+'...');
        }
    },

    showMsgErr: function(response, needlogin){
        var msg = "";
        if(typeof response === "string"){
            msg = response;
        }else{
            if(top.HEURIST4.util.isnull(response) || top.HEURIST4.util.isempty(response.message)){
                msg = 'Error_Empty_Message';
            }else{
                msg = response.message;
            }
            msg = top.HR(msg);

            if(response.sysmsg && response.status!=top.HAPI4.ResponseStatus.REQUEST_DENIED){
                //sysmsg for REQUEST_DENIED is current user id - it allows to check if session is expired
                
                if(typeof response.sysmsg['join'] === "function"){
                    msg = msg + '<br>System error: ' +response.sysmsg.join('<br>');
                }else{
                    msg = msg + '<br>System error: ' + response.sysmsg;
                }

            }
            if(response.status==top.HAPI4.ResponseStatus.SYSTEM_FATAL
            || response.status==top.HAPI4.ResponseStatus.SYSTEM_FATALSYSTEM_CONFIG){

                msg = msg + "<br><br>May result from a network outage, or because the system is not properly configured. "
                +"If the problem persists, please report to your system administrator";

            }else if(response.status==top.HAPI4.ResponseStatus.INVALID_REQUEST){

                msg = msg + "<br><br>The number and/or set of request parameters is not valid. Please email the Heurist development team ( info at HeuristNetwork dot org)";

            }else if(response.status==top.HAPI4.ResponseStatus.REQUEST_DENIED){

                if(needlogin && response.sysmsg==0){
                    msg = msg + '<br><br>It appears you are not logged in or your session has been experied. You have to re-login';
                }else{
                    msg = msg + "<br><br>This action is not allowed for your current permissions";    
                } 
                
            }else if(response.status==top.HAPI4.ResponseStatus.DB_ERROR){
                msg = msg + "<br><br>Please consult your system administrator. Error may be due to an incomplete "
                        +"database eg. missing stored procedures, functions, triggers, or there may be an "
                        +"error in our code (in which case we need to know so we can fix it";
            }
        }
        if(top.HEURIST4.util.isempty(msg)){
                msg = 'Error_Empty_Message';
        }

        var buttons = {};
        buttons[top.HR('OK')]  = function() {
                    var $dlg = top.HEURIST4.msg.getMsgDlg();            
                    $dlg.dialog( "close" );
                    if(response.status==top.HAPI4.ResponseStatus.REQUEST_DENIED && needlogin){
                            //top.HAPI4.setCurrentUser(null);
                            //$(top.document).trigger(top.HAPI4.Event.LOGOUT);
                    }
                }; 
        top.HEURIST4.msg.showMsgDlg(msg, buttons, "Error");
        
    },

    //
    // loads content url into dialog (getMsgDlg) and show it (showMsgDlg)
    //
    showMsgDlgUrl: function(url, buttons, title){

        if(url){
            var $dlg = top.HEURIST4.msg.getMsgDlg();
            $dlg.load(url, function(){
                top.HEURIST4.msg.showMsgDlg(null, buttons, title);
            });
        }
    },
    
    //
    //  shows standard work in progress message (not used)
    //
    showMsgWorkInProgress: function( isdlg, message ){

        if(top.HEURIST4.util.isempty(message)){
            message = "this feature";
        }

        message = "Beta version: we are still working on "
              + message
              + "<br/><br/>Please email Heurist support (info at HeuristNetwork dot org)"
              + "<br/>if you need this feature and we will provide workarounds and/or fast-track your needs.";

        if(isdlg){
            top.HEURIST4.msg.showMsgDlg(message, null, "Work in Progress");    
        }else{
            top.HEURIST4.msg.showMsgFlash(message, 4000, "Work in Progress");
        }
        
    },

    //
    // show simple input value dialog with given message
    //
    showPrompt: function(message, callbackFunc){
        
        if(message.indexOf('dlg-prompt-value')<0){
            message = message+'<input id="dlg-prompt-value" class="text ui-corner-all" '
                + ' style="max-width: 250px; min-width: 10em; width: 250px; margin-left:0.2em"/>';    
        }
        
        top.HEURIST4.msg.showMsgDlg( message,
        function(){
            if($.isFunction(callbackFunc)){
                var $dlg = top.HEURIST4.msg.getMsgDlg();            
                callbackFunc.call(this, $dlg.find('#dlg-prompt-value').val());
            }
        },
        'Specify value');
        
    },
    
    //
    // creates and returns div (id=dialog-common-messages) that is base element for jquery ui dialog
    //
    getMsgDlg: function(){
        var $dlg = $( "#dialog-common-messages" );
        if($dlg.length==0){
            $dlg = $('<div>',{id:'dialog-common-messages'}).css({'min-wdith':'380px','max-width':'640px'}).appendTo('body');
        }
        return $dlg.removeClass('ui-heurist-border');
    },

    getMsgFlashDlg: function(){
        var $dlg = $( "#dialog-flash-messages" );
        if($dlg.length==0){
            $dlg = $('<div>',{id:'dialog-flash-messages'}).css({'min-wdith':'380px','max-width':'640px'}).appendTo('body');
        }
        return $dlg.removeClass('ui-heurist-border');
    },
    
    //
    // creates and returns div (id=dialog-popup) similar to  dialog-common-messages - but without width limit
    //
    getPopupDlg: function(){
        var $dlg = $( "#dialog-popup" );
        if($dlg.length==0){
            $dlg = $('<div>',{id:'dialog-popup'}).css('padding','2em').css({'min-wdith':'380px'}).appendTo('body'); //,'max-width':'640px'
            $dlg.removeClass('ui-heurist-border');
        }
        return $dlg;
    },

    //
    // MAIN method
    // buttons - callback function or objects of buttons for dialog option
    // title - either string for title, or object {title:, yes: ,no, cancel, }
    //
    showMsgDlg: function(message, buttons, labels, position_to_element, isPopupDlg){

        if(!$.isFunction(top.HR)){
            alert(message);
            return;
        }

        var $dlg = top.HEURIST4.msg.getMsgDlg();
        var isPopup = false; //bigger and resizable

        if(message!=null){
            
            var isobj = (typeof message ===  "object");

            if(!isobj){
                isPopupDlg = isPopupDlg || (message.indexOf('#')===0 && $(message).length>0);
            }

            if(isPopupDlg){

                $dlg = top.HEURIST4.msg.getPopupDlg();
                if(isobj){
                    $dlg.append(message);
                }else if(message.indexOf('#')===0 && $(message).length>0){
                    $dlg.html($(message).html());
                }else{
                    $dlg.html(message);
                }

                isPopup = true;

            }else{
                $dlg.empty();
                isPopup = false;
                if(isobj){
                    $dlg.append(message);
                }else{
                    $dlg.append('<span>'+top.HR(message)+'</span>');
                }
            }
        }

        var title = 'Heurist',
            lblYes = top.HR('Yes'),
            lblNo =  top.HR('No'),
            lblOk = top.HR('OK'),
            lblCancel = top.HR('Cancel');
        
        if($.isPlainObject(labels)){
            if(labels.title)  title = labels.title;
            if(labels.yes)    lblYes = labels.yes;
            if(labels.no)     lblNo = labels.no;
            if(labels.ok)     lblOk = labels.ok;
            if(labels.cancel) lblCancel = labels.cancel;
        }
        
        if ($.isFunction(buttons)){ //}typeof buttons === "function"){

            callback = buttons;

            buttons = {};
            buttons[lblYes] = function() {
                callback.call();
                $dlg.dialog( "close" );
            };
            buttons[lblNo] = function() {
                $dlg.dialog( "close" );
            };
        }else if(!buttons){    //buttons are not defined - the only one OK button

            buttons = {};
            buttons[lblOk] = function() {
                $dlg.dialog( "close" );
            };

        }

        var options =  {
            title: top.HR(title),
            resizable: false,
            //height:140,
            width: 'auto',
            modal: true,
            closeOnEscape: true,
            buttons: buttons
        };
        if(isPopup){

            options.open = function(event, ui){
                $dlg.scrollTop(0);
            };

            options.height = 515;
            options.width = 705;
            options.resizable = true;
            options.resizeStop = function( event, ui ) {
                    $dlg.css({overflow: 'none !important','width':'100%', 'height':$dlg.parent().height()
                            - $dlg.parent().find('.ui-dialog-titlebar').height() - $dlg.parent().find('.ui-dialog-buttonpane').height() - 20 });
                };
        }

        if(position_to_element){
           options.position = { my: "left top", at: "left bottom", of: $(position_to_element) };
        }

        $dlg.dialog(options);
        //$dlg.dialog('option','buttons',buttons);

        return $dlg;
        //$dlg.parent().find('.ui-dialog-buttonpane').removeClass('ui-dialog-buttonpane');
        //$dlg.parent().find('.ui-dialog-buttonpane').css({'background-color':''});
        //$dlg.parent().find('.ui-dialog-buttonpane').css({'background':'red none repeat scroll 0 0 !important','background-color':'transparent !important'});
        //'#8ea9b9 none repeat scroll 0 0 !important'     none !important','background-color':'none !important
    },

    //
    // show buttonless dialog with given timeout
    //
    showMsgFlash: function(message, timeout, title, position_to_element){

        if(!$.isFunction(top.HR)){
            alert(message);
            return;
        }

        $dlg = top.HEURIST4.msg.getMsgFlashDlg();

        $dlg.addClass('ui-heurist-border');

        var content;
        if(message!=null){
            $dlg.empty();
            content = $('<span>'+top.HR(message)+'</span>');
            $dlg.append(content);
        }else{
            return;
        }
        
        var hideTitle = (title==null);

        if(!title) title = top.HR(''); // was an unhelpful and inelegant "Info"
                                                          
        var options =  {
            title: top.HR(title),
            resizable: false,
            width: 'auto',
            modal: false,
            buttons: {}
        };


        if(position_to_element){
           if($.isPlainObject(position_to_element)){
                options.position = position_to_element;
           }else{
                options.position = { my: "left top", at: "left bottom", of: $(position_to_element) };    
           } 
        }else{
            options.position = { my: "center center", at: "center center", of: $(document) };    
        }

        $dlg.dialog(options);
        content.position({ my: "center center", at: "center center", of: $dlg });
        
        //var hh = hideTitle?0:$dlg.parent().find('.ui-dialog-titlebar').height() + $dlg.height() + 20; 
        
        $dlg.dialog("option", "buttons", null);      
        
        if(hideTitle)
            $dlg.parent().find('.ui-dialog-titlebar').hide();

        if (!(timeout>200)) {
            timeout = 1000;
        }

        setTimeout(function(){
            $dlg.dialog('close');
            $dlg.parent().find('.ui-dialog-titlebar').show();
        }, timeout);

    },

    //@todo - redirect to error page
    redirectToError: function(message){
        top.HEURIST4.msg.showMsgDlg(message, null, 'Error');
    },

    //
    // fill given element with error message and highlight it
    //
    checkLength: function( input, title, message, min, max ) {
        var message_text = top.HEURIST4.msg.checkLength2( input, title, min, max );
        if(message_text!=''){
                                          
                                          //'<div class="ui-state-error" style="padding:10px">XXXX'+        +'</div>'
            top.HEURIST4.msg.showMsgFlash('<span class="ui-state-error" style="padding:10px">'+message_text+'</span>', 3000);
            
            /*
            if(message){
                message.text(message_text);
                message.addClass( "ui-state-error" );
                setTimeout(function() {
                    message.removeClass( "ui-state-error", 1500 );
                    }, 3500 );
            } */

            return false;
        }else{
            return true;
        }

    },

    //
    // get message if input value beyound given ranges
    //
    checkLength2: function( input, title, min, max ) {

        var len = input.val().length;
        if ( (max>0 &&  len > max) || len < min ) {
            input.addClass( "ui-state-error" );
            if(max>0 && min>1){
                message_text = top.HR(title)+" "+top.HR("length must be between ") +
                min + " "+top.HR("and")+" " + max + ". ";
                if(len<min){
                    //message_text = message_text + (min-len) + top.HR(" characters left");
                }else{
                    message_text = message_text + (len-max) + top.HR(" characters over");
                }


            }else if(min==1){
                message_text = top.HR(title)+" "+top.HR(" is required field");
            }

            return message_text;

        } else {
            return '';
        }
    },

    //
    //
    //
    checkRegexp:function ( o, regexp ) {
        if ( !( regexp.test( o.val() ) ) ) {
            o.addClass( "ui-state-error" );
            return false;
        } else {
            return true;
        }
    },
    
    /**
    * show url in iframe within popup dialog
    */
    showDialog: function(url, options){

                if(!options) options = {};

                if(!options.title) options.title = ''; // removed 'Information'  which is not a particualrly useful title

                var opener = options['window']?options['window'] :window;

                //.appendTo( that.document.find('body') )

                //create new div for dialogue with $(this).uniqueId();
                var $dlg = $('<div>')
                        .addClass('loading')
                        .appendTo( $(opener.document).find('body') ).uniqueId();
                        
                if(options.class){
                    $dlg.addClass(options.class);
                }
                
                var $dosframe = $( "<iframe>").attr('parent-dlg-id', $dlg.attr('id'))
                            .css({overflow: 'none !important', width:'100% !important'}).appendTo( $dlg );
                $dosframe.hide();
/*
                //on close event listener - invoke callback function if defined
                $dosframe[0].close = function() {
                    var rval = true;
                    var closeCallback = options['callback'];
                    if(closeCallback){
                        rval = closeCallback.apply(opener, arguments);
                    }
                    if ( !rval  &&  rval !== undefined){
                        return false;
                    }

                    $dlg.dialog('close');
                    return true;
                };
*/
                //callback function to resize dialog from internal frame functions
                $dosframe[0].doDialogResize = function(width, height) {
                    //top.HEURIST4.msg.showMsgDlg('resize to '+width+','+height);
                    /*
                    var body = $(this.document).find('body');
                    var dim = { h: Math.max(400, body.innerHeight()-10), w:Math.max(400, body.innerWidth()-10) };

                    if(width>0)
                        $dlg.dialog('option','width', Math.min(dim.w, width));
                    if(height>0)
                        $dlg.dialog('option','height', Math.min(dim.h, height));
                    */    
                };

                //on load content event listener
                $dosframe.on('load', function(){
                         
                        if(top.HEURIST4.util.isempty($dosframe.attr('src'))){
                            return;
                        }
                        
                        var content = $dosframe[0].contentWindow;
                        content.alert = function(txt){
                            top.HEURIST4.msg.showMsgDlg(txt, null, ""); // Title was an unhelpful and inelegant "Info"
                            return true;
                        }
                        
                        if(!options["title"]){
                            $dlg.dialog( "option", "title", content.document.title );
                        }      
                        if(options["context_help"]){
                            top.HEURIST4.ui.initDialogHintButtons($dlg, options["context_help"], true);
                        }
                        
                        
                        /*
                        content.confirm = function(txt){
                            var resConfirm = false,
                                isClosed = false;
                            
                            var $confirm_dlg = top.HEURIST4.msg.showMsgDlg(txt, function(){
                                resConfirm = true;
                            }, "Confirm");
                            
                            $confirm_dlg.dialog('option','close',
                                function(){
                                    isClosed = true;        
                                });
                            
                            while(!isClosed){
                               $.wait(1000);
                            }
                            
                            return resConfirm;
                        }*/
                        
                        //content.document.reference_to_parent_dialog = $dlg.attr('id');
                        //$dosframe[0].contentDocument.reference_to_parent_dialog = $dlg.attr('id');
                        //functions in internal document
                        //content.close = $dosframe[0].close;    // make window.close() do what we expect
                        content.close = function() {
                            var did = $dlg.attr('id');

                            var rval = true;
                            var closeCallback = options['callback'];
                            if($.isFunction(closeCallback)){
                                rval = closeCallback.apply(opener, arguments);
                            }
                            if ( rval===false ){ //!rval  &&  rval !== undefined){
                                return false;
                            }
                            $dlg.dialog('close');
                            return true;
                        };


                        //content.popupOpener = opener;
                        content.doDialogResize = $dosframe[0].doDialogResize;

                        var onloadCallback = options['onpopupload'];
                        if(onloadCallback){
                                onloadCallback.call(opener, $dosframe[0]);
                        }

                        $dlg.removeClass('loading');
                        $dosframe.show();    
                });

//    options['callback']
                //(this.document.find('body').innerHeight()-20)
                        options.height = parseInt(options.height, 10);
                        if(isNaN(options.height) || options.height<50){
                            options.height = 480;
                        } 
                        if(options.height > opener.innerHeight-20){
                            options.height = opener.innerHeight-20;
                        }
                        options.width = parseInt(options.width, 10);
                        if(isNaN(options.width) || options.width<100){
                            options.width = 640; 
                        } 
                        if(options.width > opener.innerWidth-20){
                            options.width = opener.innerWidth-20;
                        }

                        var opts = {
                                autoOpen: true,
                                width : options.width,
                                height: options.height,
                                modal: true,
                                resizable: (options['no-resize']!=true),
                                //draggable: false,
                                title: options["title"],
                                resizeStop: function( event, ui ) {
                                    $dosframe.css('width','100%');
                                },
                                close: function(event, ui){
                                    var closeCallback = options['afterclose'];
                                    if($.isFunction(closeCallback)){
                                        closeCallback.apply();
                                    }
                                    $dlg.remove();
                                }
                        };
                        $dlg.dialog(opts);
                        
                        if(options['padding'])
                            $dlg.css('padding', options.padding);
                        
                        //start content loading
                        $dosframe.attr('src', url);

    },
    
    //
    // take element and assign it to dialog, on dialog close place element back to original parent
    //
    showElementAsDialog: function(options){

            var opener = options['window']?options['window'] :window;

            var $dlg = $('<div>')
               .appendTo( $(opener.document).find('body') );

            var element = options['element'];
            var originalParentNode = element.parentNode;
            element.parentNode.removeChild(element);

            $(element).show().appendTo($dlg);

            var body = $(this.document).find('body');
            var dim = { h: Math.max(400, body.innerHeight()-10), w:Math.max(400, body.innerWidth()-10) };
            
            
            var opts = {
                    autoOpen: true,
                    width : (options.width>0?options.width+20:690),
                    height: (options.height>0?options.height+20:dim.h),
                    modal: true,
                    resizable: (options['no-resize']==true),
                    //draggable: false,
                    title: options["title"],
                    buttons: options["buttons"],
                    close: function(event, ui){

                        //var element = popup.element.parentNode.removeChild(popup.element);
                        element.style.display = "none";
                        originalParentNode.appendChild(element);

                        $dlg.remove();
                    }
            };
            $dlg.dialog(opts);

            return $dlg;
    },

    //
    //
    //
    createAlertDiv: function(msg){
        
        return '<div class="ui-state-error" style="width:90%;margin:auto;margin-top:10px;padding:10px;">'+
                                '<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'+
                                msg+'</div>';
    },

    
};