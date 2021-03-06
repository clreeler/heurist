/**
* Search header for DefRecTypeGroups manager
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


$.widget( "heurist.searchDefRecTypeGroups", $.heurist.searchEntity, {

    // the widget's constructor
    _create: function() {
        
        this._super();

        this._htmlContent =  '';
        this._helpContent = 'defRecTypes.html';
        this._helpTitle = 'Record Types';
        this._need_load_content = false;
        
    }, //end _create

    //
    _initControls: function() {
        //this._super();
        
        this.startSearch();
    },  
    
    //
    // public methods
    //
    startSearch: function(){
        
            this._super();
        
            var request = {}
        
                this._trigger( "onstart" );

                request = {
                'a'          : 'search',
                'entity'     : this.options.entity.entityName, //'defRecTypeGroups',
                'details'    : 'list',
                'request_id' : window.hWin.HEURIST4.util.random(),
                };

                var that = this;                                                
                //that.loadanimation(true);
                window.hWin.HAPI4.EntityMgr.doRequest(request, 
                    function(response){
                        if(response.status == window.hWin.HAPI4.ResponseStatus.OK){
                            that._trigger( "onresult", null, 
                                {recordset:new hRecordSet(response.data), request:request} );
                        }else{
                            window.hWin.HEURIST4.msg.showMsgErr(response);
                        }
                    });
    },
    

});
