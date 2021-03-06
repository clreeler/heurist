/**
* View record in iframe with help of external viewer
* The url is specified in options.url as a template with [recID] replaced by actual recID  
* 
* @package     Heurist academic knowledge management system
* @link        http://HeuristNetwork.org
* @copyright   (C) 2005-2016 University of Sydney
* @author      Artem Osmakov   <artem.osmakov@sydney.edu.au>
* @license     http://www.gnu.org/licenses/gpl-3.0.txt GNU License 3.0
* @version     4.0
*/

/*
* Licensed under the GNU License, Version 3.0 (the "License"); you may not use this file except in compliance
* with the License. You may obtain a copy of the License at http://www.gnu.org/licenses/gpl-3.0.txt
* Unless required by applicable law or agreed to in writing, software distributed under the License is
* distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied
* See the License for the specific language governing permissions and limitations under the License.
*/


$.widget( "heurist.rec_viewer_ext", {

    // default options
    options: {
        databases: null, //array of allowed databases
        url: null,
        recID: null
    },

    // the constructor
    _create: function() {

        var that = this;

        this.framecontent = $(document.createElement('div'))
        .addClass('frame_container')
        .appendTo( this.element ).hide();

        this.dosframe = $( "<iframe>" )
        .appendTo( this.framecontent );

        this.lbl_message = $( "<label>" )
        .appendTo( this.element ).hide();

        //-----------------------   listener for global event
        $(this.document).on(window.hWin.HAPI4.Event.ON_REC_SELECT,
            function(e, data) {

                var _recID;
                if(data) data = data.selection;

                var res = window.hWin.HAPI4.getSelection(data, true);
                if(window.hWin.HEURIST4.util.isArrayNotEmpty(res)){
                    _recID = res[0];
                }

                that.option("recID", _recID);
        });

        this._refresh();

        this.element.on("myOnShowEvent", function(event){
            if( event.target.id == that.element.attr('id')){
                that._refresh();
            }
        });

    }, //end _create


    _setOptions: function() {
        // _super and _superApply handle keeping the right this-context
        this._superApply( arguments );
        this._refresh();
    },

    /* private function */
    _refresh: function(){

        if(this.options.databases && this.options.databases.indexOf(window.hWin.HAPI4.database)<0){

            this.framecontent.hide();
            this.lbl_message.show();
            this.lbl_message.html('database not supported');

        }else if ( this.element.is(':visible') ) {

            if(this.options.recID == null){
                this.framecontent.hide();
                this.lbl_message.show();
                this.lbl_message.html('select record');
                //}else if (this.options.record[4]){

            }else{
                this.lbl_message.hide();
                this.framecontent.show();
                var newurl = this.options.url.replace("[recID]",  this.options.recID).replace("[dbname]",  window.hWin.HAPI4.database);
                if(this.dosframe.attr('src')!==newurl){
                    this.dosframe.attr('src', newurl); //recID
                }
            }

        }

    },

    // events bound via _on are removed automatically
    // revert other modifications here
    _destroy: function() {
        this.element.off("myOnShowEvent");
        $(this.document).off(window.hWin.HAPI4.Event.ON_REC_SELECT);

        // remove generated elements
        this.dosframe.remove();
        this.framecontent.remove();
        this.lbl_message.remove();
    }

});
