$.widget( "heurist.profile", {

  // default options
  options: {
    // callbacks
    onlogin: null,
    onlogout: null
  },

  // the constructor
  _create: function() {

    var that = this;

    this.element
      // prevent double click to select text
      .disableSelection();

    //---------------------
    this.btn_options = $( "<button>", {text: "options"} )
            .css('float','right')
            .appendTo( this.element )
            .button({icons: {
                        primary: "ui-icon-gear",
                        secondary: "ui-icon-triangle-1-s"
                    },text:false});

    this.menu_options = $('<ul id="menu-options">'+
        '<li id="menu-options-db-select"><a href="#">'+top.HR('Databases')+'</a></li>'+
        '<li id="menu-options-db-design" class="logged-in-only"><a href="#">'+top.HR('Design database')+'</a></li>'+
        '<li id="menu-options-import" class="logged-in-only"><a href="#">'+top.HR('Import data')+'</a>'+
            '<ul>'+
                '<li><a href="#">CSV</a></li>'+
                '<li><a href="#">KML</a></li>'+
                '<li><a href="#">Zotero</a></li>'+
                '<li><a href="#">'+top.HR('Files in situ')+'</a></li>'+
                '<li><a href="#">Email</a></li>'+
                '<li id="menu-options-import-faims"><a href="#">FAIMS</a></li>'+
            '</ul>'+
        '</li>'+
        (top.HAPI.registration_allowed?'<li id="menu-options-register" class="logged-out-only"><a href="#">'+top.HR('Register')+'</a></li>':'')+
        '<li id="menu-options-help"><a href="#">'+top.HR('Help')+'</a></li>'+
        '<li id="menu-options-bug" class="logged-in-only"><a href="#">'+top.HR('Report bug')+'</a></li>'+
        '<li id="menu-options-about"><a href="#">'+top.HR('About')+'</a></li>'+
        '</ul>')
            .addClass('menu-or-popup')
            .css('position','absolute')
            .css('width','12em')
            .appendTo( this.document.find('body') )
            .menu({
                select: function( event, ui ) {
                    var action = ui.item.attr('id');
                    if(action == "menu-options-db-select"){

                        var $dlg = $("#heurist-dialog");
                        $dlg.empty();
                        $dlg.load("php/databases.php .db-list", function(){
                            $dlg.dialog({
                                autoOpen: true,
                                height: 420,
                                width: 220,
                                modal: true,
                                resizable: false,
                                draggable: false,
                                title: top.HR("Select database")
                            })
                        });

                    }else if(action == "menu-options-about"){
                        $( "#heurist-about" ).dialog("open");
                    }else if(action == "menu-options-import-faims"){

                        var $dlg = $("#heurist-dialog");
                        $dlg.empty();
                        $dlg.load("php/sync/faims.php?db="+top.HAPI.database+" .utility-content", function(){
                            $dlg.dialog({
                                autoOpen: true,
                                height: 480,
                                width: 640,
                                modal: true,
                                resizable: false,
                                draggable: false,
                                title: top.HR("FAIMS sync")
                            })
                        });
                    }
                }})
            .hide();

    this._on( this.btn_options, {
        click: function() {
          $('.menu-or-popup').hide(); //hide other
          var menu = $( this.menu_options )
                .show()
                .position({my: "right top", at: "right bottom", of: this.btn_options });
          $( document ).one( "click", function() { menu.hide(); });
          return false;
        }
    });

    //---------------------
    this.btn_login = $( "<button>", {
                    text: top.HR('Login')
            })
            .css('float','right')
            .addClass('logged-out-only')
            .appendTo( this.element )
            .button({icons: {
                        primary: "ui-icon-key"
                    }});

    //---------------------
    this.btn_user = $( "<button>",{
                    text: "username"
            })
            .css('float','right')
            .addClass('logged-in-only')
            .appendTo( this.element )
            .button({icons: {
                        primary: "ui-icon-person",
                        secondary: "ui-icon-triangle-1-s"
                    }});
    this.menu_user = $('<ul>'+
        '<li id="menu-user-preferences"><a href="#">'+top.HR('Preferences')+'</a></li>'+
        '<li id="menu-user-profile"><a href="#">'+top.HR('My User Info')+'</a></li>'+
        '<li id="menu-user-groups"><a href="#">'+top.HR('My Groups')+'</a></li>'+
        '<li id="menu-user-tags"><a href="#">'+top.HR('Manage Tags')+'</a></li>'+
        '<li id="menu-user-reminders"><a href="#">'+top.HR('Manage Reminders')+'</a></li>'+
        '<li id="menu-user-logout"><a href="#">'+top.HR('Log out')+'</a></li>'+
        '</ul>')
            .addClass('menu-or-popup')
            .css('position','absolute')
            .appendTo( this.document.find('body') )
            .menu({
                select: function( event, ui ) {
                    var action = ui.item.attr('id');
                    if(action == "menu-user-logout"){
                        that.logout();
                    }else if(action == "menu-user-preferences"){

                        that.editPreferences();
                    }else if(action == "menu-user-tags"){
                        if($.isFunction($('body').tag_assign)){ //already loaded
                            showManageTags();
                        }else{
                            $.getScript(top.HAPI.basePath+'apps/tag_assign.js', function(){ showManageTags(); } );
                        }
                    }

                    
                }})
            .hide();

    this._on( this.btn_user, {
        click: function() {
          $('.menu-or-popup').hide(); //hide other
          var menu = $( this.menu_user )
                .css('width', this.btn_user.width())
                .show()
                .position({my: "right top", at: "right bottom", of: this.btn_user });
          $( document ).one( "click", function() { menu.hide(); });
          return false;
        }
    });

    //---------------------
    this.select_rectype = $( "<select>" )
                .addClass('menu-or-popup text ui-corner-all ui-widget-content')
                .attr("size","15")
                .css({'position':'absolute'})   //,'border':'none'
                .appendTo(this.document.find('body'))
                .hide();

    top.HEURIST.util.createRectypeSelect(this.select_rectype.get(0), null, false);

    this.btn_record = $( "<button>", {
                    text: top.HR("add new record")
            })
            .css('float','right')
            .addClass('logged-in-only')
            .appendTo( this.element )
            .button({icons: {
                        primary: "ui-icon-circle-plus",
                        secondary: "ui-icon-triangle-1-s"
                    }});


    this._on( this.btn_record, {
      click: function() {
        $('.menu-or-popup').hide(); //hide other
        that.select_rectype.show().position({my: "right top", at: "right bottom", of: that.btn_record });
        $( document ).one( "click", function() { that.select_rectype.hide(); });
        return false;
          //window.open(top.HAPI.basePath + "php/recedit.php?db="+top.HAPI.database, "_blank");
      }
    });
    this._on( this.select_rectype, {
      click: function(event) {

          var recordtype = event.target.value;

          if(!top.HEURIST.editing){
                top.HEURIST.editing = new hEditing();
          }
          top.HEURIST.editing.add(recordtype);

          /* open in new window
          window.open(top.HAPI.basePath + "php/recedit.php?db="+top.HAPI.database+"&rt="+recordtype, "_blank");
          */
      }
    });


    //---------------------
    this.login_dialog = $( "<div>" )
    .appendTo( this.element );


    // bind click events
    this._on( this.btn_login, {
      click: "login"
    });

    /*this._on( this.btn_record, {
      click: "logout"
    });*/

/*
    this._on( this.btn_logout, {
      click: "islogged"
    });
*/



    this._refresh();

  }, //end _create

  /* private function */
  _refresh: function(){

      if(top.HAPI.currentUser.ugr_ID>0){
            $(this.element).find('.logged-in-only').show(); //.css('visibility','visible');
            $(this.element).find('.logged-out-only').hide(); //.css('visibility','hidden');
            this.btn_user.button( "option", "label", top.HAPI.currentUser.ugr_FullName);
            $('#menu-options li.logged-in-only').css('display','block');
            $('#menu-options li.logged-out-only').css('display','none');
      }else{
            $(this.element).find('.logged-in-only').hide(); //.css('visibility','hidden');
            $(this.element).find('.logged-out-only').show(); //.css('visibility','visible');
            $('#menu-options li.logged-in-only').css('display','none');
            $('#menu-options li.logged-iut-only').css('display','block');
      }

  },

  /*
  islogged: function(){

        var that = this;

        top.HAPI.SystemMgr.is_logged(
            function(response){
                if(response.status == top.HAPI.ResponseStatus.OK){
                    alert(response.data);
                }else{
                    top.HEURIST.util.showMsgErr(response.message);
                }
            }
        );


  },      */

  logout: function(){

        var that = this;

        top.HAPI.SystemMgr.logout(
            function(response){
                if(response.status == top.HAPI.ResponseStatus.OK){
                    top.HAPI.setCurrentUser(null);
                    $(that.document).trigger(top.HAPI.Event.LOGOUT);
                    that._refresh();
                }else{
                    top.HEURIST.util.showMsgErr(response.message);
                }
            }
        );

  },

  login: function(){

    if(  this.login_dialog.is(':empty') )
    {
        var that = this;
        var $dlg = this.login_dialog;

        //load login dialogue
        $dlg.load("apps/profile_login.html", function(){

            var allFields = $dlg.find('input');
            var message = $dlg.find('.messages');

            function __doLogin(){

                  allFields.removeClass( "ui-state-error" );

                  var username = $dlg.find('#username');
                  var password = $dlg.find('#password');
                  var session_type = $dlg.find('input[name="session_type"]');

                  var bValid = top.HEURIST.util.checkLength( username, "username", message, 3, 16 )
                           && top.HEURIST.util.checkLength( password, "password", message, 3, 16 );

                  if ( bValid ) {

                    //get hapi and perform login
                    top.HAPI.SystemMgr.login({username: username.val(), password:password.val(), session_type:session_type.val()},
                        function(response){
                            if(response.status == top.HAPI.ResponseStatus.OK){

                                top.HAPI.setCurrentUser(response.data.currentUser);
                                top.HAPI.registration_allowed = (response.registration_allowed==1);

                                $(that.document).trigger(top.HAPI.Event.LOGIN, [top.HAPI.currentUser]);

                                $dlg.dialog( "close" );
                                that._refresh();
                            }else{
                                message.addClass( "ui-state-highlight" );
                                message.text(response.message);
                            }
                        }

                    );

                  }
            }

            allFields.on("keypress",function(event){
                  var code = (event.keyCode ? event.keyCode : event.which);
                  if (code == 13) {
                      __doLogin();
                  }
            });


            $dlg.dialog({
              autoOpen: false,
              height: 220,
              width: 350,
              modal: true,
              title: top.HR('Login'),
              buttons: [
                {text:top.HR('Login'), click: __doLogin},
                {text:top.HR('Cancel'), click: function() {
                  $( this ).dialog( "close" );
                }}
              ],
              close: function() {
                allFields.val( "" ).removeClass( "ui-state-error" );
              }
            });

            $dlg.dialog("open");

        });
    }else{
        //show dialogue
        this.login_dialog.dialog("open");
    }
  },

  editPreferences: function()
  {
        var $dlg = $("#heurist-dialog");
        $dlg.empty();

        $dlg.load("apps/profile_preferences.html", function(){

            //find all labels and apply localization
            $dlg.find('label').each(function(){
                 $(this).html(top.HR($(this).html()));
            })
            $dlg.find('.header').css({'min-width':'300px', 'width':'300px'});

            populateLanguages();

            //assign values to form fields from top.HAPI.currentUser['ugr_Preferences']
            var prefs = top.HAPI.currentUser['ugr_Preferences'];
            var allFields = $dlg.find('input,select');

            var themeSwitcher = $("#layout_theme").themeswitcher({currentTheme:prefs['layout_theme']});
            
            //form prefs to ui
            allFields.each(function(){
                    if(prefs[this.id]){
                        if(this.type=="checkbox"){
                            this.checked = (prefs[this.id]=="1" || prefs[this.id]=="true")
                        }else{
                            $(this).val(prefs[this.id]);
                        }
                    };
            });

            function __doSave(){

                    var request = {};

                                allFields.each(function(){
                                    if(this.type=="checkbox"){
                                        request[this.id] = this.checked?"1":"0";
                                    }else{
                                        request[this.id] = $(this).val();
                                    }
                                });
                                request.layout_theme = themeSwitcher.getCurrentTheme();
                                //$('#layout_theme').themeswitcher.


                    //get hapi and perform login
                    top.HAPI.SystemMgr.save_prefs(request,
                        function(response){
                            if(response.status == top.HAPI.ResponseStatus.OK){

                                var prefs = top.HAPI.currentUser['ugr_Preferences'];
                                var askreload = (prefs['layout_language'] != request['layout_language'] ||
                                                 prefs['layout_theme'] != request['layout_theme']);
                                
                                top.HAPI.currentUser['ugr_Preferences'] = request;
                                /*allFields.each(function(){
                                    top.HAPI.currentUser['ugr_Preferences'][this.id] = $(this).val();
                                });*/

                                $dlg.dialog( "close" );
                                
                                if(askreload){
                                    top.HEURIST.util.showMsgDlg('Reload page to apply new settings?',
                                    function(){
                                        window.location.reload();
                                    }, 'Confirmation');
                                }
                                
                            }else{
                                var message = $dlg.find('.messages');
                                message.addClass( "ui-state-highlight" );
                                message.text(response.message);
                            }
                        }

                    );
            }

            $dlg.dialog({
                autoOpen: true,
                height: 420,
                width: 640,
                modal: true,
                resizable: false,
                draggable: true,
                title: top.HR("Preferences"),
                buttons: [
                    {text:top.HR('Save'), click: __doSave},
                    {text:top.HR('Cancel'), click: function() {
                      $( this ).dialog( "close" );
                    }}
                ]
            })
        });

  },


  // events bound via _on are removed automatically
  // revert other modifications here
  _destroy: function() {
    // remove generated elements
    this.select_rectype.remove();
    this.btn_record.remove();
    this.btn_user.remove();
    this.btn_options.remove();
    this.btn_login.remove();

    this.menu_user.remove();
    this.menu_options.remove();

    this.login_dialog.remove();

  }

});