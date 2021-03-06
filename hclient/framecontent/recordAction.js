/**
* Class to perform action on set of records in popup dialog
*
* @param action_type - name of action - used to access help, widget name and method on server side
* @returns {Object}
* @see  hclient/framecontent/record for widgets
* @see  migrated/search/actions
* @see  record_action_help_xxxx in localization.js for description and help
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


function hRecordAction(_action_type, _scope_type, _field_type, _field_value) {
    var _className = "RecordAction",
    _version   = "0.4",

    selectRecordScope, allSelectedRectypes;

    var action_type = _action_type,
        init_scope_type = _scope_type,
        init_field_type = _field_type,
        init_field_value = _field_value;


    /*
    header that describes the action
    selector of records: all, selected, by record type
    widget to enter data
    request to server
    results
    given
    processed
    rejected (rights)
    error
    */
    function _init(){

        //fill header with description
        $('#div_header').html(window.hWin.HR('record_action_'+action_type));
        
        //fill selector for records: all, selected, by record type
        selectRecordScope = $('#sel_record_scope')
        .on('change',
            function(e){
                _onRecordScopeChange();
            }
        );
        _fillSelectRecordScope();

        //init buttons
        $('#btn-ok').button({label:window.hWin.HR('Go')}).click(_startAction);
        $('#btn-cancel').button({label:window.hWin.HR('Cancel')}).click(function(){window.close();});
    }

    //
    //
    //
    function _fillSelectRecordScope(){

        selectRecordScope.empty();


        if(!window.hWin.HAPI4.currentRecordset){
            //debug
            window.hWin.HAPI4.currentRecordset = new hRecordSet({count: "1",offset: 0,reccount: 1,records: [1069], rectypes:[25]});
            //return;
        }

        var opt, selScope = selectRecordScope.get(0);

        if(init_scope_type=='all'){
            opt = new Option("All records", "All");
            selScope.appendChild(opt);
        }else if(init_scope_type>0 && window.hWin.HEURIST4.rectypes.pluralNames[init_scope_type]){
            opt = new Option(window.hWin.HEURIST4.rectypes.pluralNames[init_scope_type], init_scope_type);
            selScope.appendChild(opt);
        }else{
            
            if(init_scope_type=='' || init_scope_type=='current'){
                //add result count option default
                opt = new Option("Current results set (count="+ window.hWin.HAPI4.currentRecordset.length()+")", "Current");
                selScope.appendChild(opt);
            }
            //selected count option
            if((init_scope_type=='' || init_scope_type=='selected') &&
               (window.hWin.HAPI4.currentRecordsetSelection &&  window.hWin.HAPI4.currentRecordsetSelection.length > 0)) {
                opt = new Option("Selected results set (count=" + window.hWin.HAPI4.currentRecordsetSelection.length+")", "Selected");
                selScope.appendChild(opt);
            }
            if(init_scope_type==''){
                //find all types for result and add option for each with counts.
                var rectype_Ids = window.hWin.HAPI4.currentRecordset.getRectypes();

                for (var rty in rectype_Ids){
                    if(rty>=0){
                        rty = rectype_Ids[rty];
                        opt = new Option(window.hWin.HEURIST4.rectypes.pluralNames[rty], rty);
                        selScope.appendChild(opt);
                    }
                }
            }
        }
        _onRecordScopeChange();
    }

    //
    //
    //
    function _onRecordScopeChange() {

        switch(action_type) {
            case 'add_detail':
            case 'replace_detail':
            case 'delete_detail':
                $('#div_sel_fieldtype').show();
                _fillSelectFieldTypes();
                break;
        }

    }

    //
    // fill all field type selectors
    //
    function _fillSelectFieldTypes() {

        var fieldSelect = $('#sel_fieldtype').get(0);
        if(init_scope_type>0){
            window.hWin.HEURIST4.ui.createSelector(fieldSelect, {key:init_scope_type, title:window.hWin.HEURIST4.detailtypes.names[init_scope_type]});
        }else{

            var scope_type = selectRecordScope.val();
        
            var rtyIDs = [], dtys = {}, dtyNames = [],dtyNameToID = {},dtyNameToRty={};
            var rtys = {};
            var i,j,recID,rty,rtyName,dty,dtyName,fieldName,opt;

            //get record types
            if(scope_type=="All"){
                rtyIDs = null; //show all details
            }else if(scope_type=="Current"){
                rtyIDs = window.hWin.HAPI4.currentRecordset.getRectypes();
            }else if(scope_type=="Selected"){
                rtyIDs = [];

                //loop all selected records
                for(i in window.hWin.HAPI4.currentRecordsetSelection){

                    var rty_total_count = window.hWin.HAPI4.currentRecordset.getRectypes().length;
                    var recID = window.hWin.HAPI4.currentRecordsetSelection[i];
                    var record  = window.hWin.HAPI4.currentRecordset.getById(recID) ;
                    rty = window.hWin.HAPI4.currentRecordset.fld(record, 'rec_RecTypeID');

                    if (!rtys[rty]){
                        rtys[rty] = 1;
                        rtyIDs.push(rty);
                        if(rtyIDs.length==rty_total_count) break;
                    }
                }

                allSelectedRectypes = rtyIDs;

            }else{
                rtyIDs = [scope_type];
            }

            var allowed = Object.keys(window.hWin.HEURIST4.detailtypes.lookups);
            allowed.splice(allowed.indexOf("separator"),1);
            allowed.splice(allowed.indexOf("relmarker"),1);
            allowed.splice(allowed.indexOf("geo"),1);
            allowed.splice(allowed.indexOf("file"),1);


            window.hWin.HEURIST4.ui.createRectypeDetailSelect(fieldSelect, rtyIDs, allowed, null);
        }
        
        
        fieldSelect.onchange = _createInputElements;
        _createInputElements();
    }

    //
    // crete editing_input element for selected field type
    //
    function _createInputElements(){

        var $fieldset = $('#div_widget>fieldset');
        $fieldset.empty();

        if(action_type=='add_detail'){
            _createInputElement('fld-1', window.hWin.HR('Value to be added'));
        }else if(action_type=='replace_detail'){
            _createInputElement('fld-1', window.hWin.HR('Value to find'));
            _createInputElement('fld-2', window.hWin.HR('Replace with'));
        }else if(action_type=='delete_detail'){

            $('<div tyle="padding: 0.2em; width: 100%;" class="input">'
                +'<div class="header" style="padding-left: 16px;">'
                +'<label for="cb_remove_all">Remove all occurrences</label></div>'
                +'<input id="cb_remove_all" type="checkbox" class="text ui-widget-content ui-corner-all">'
                +'</div>').appendTo($fieldset);

            _createInputElement('fld-1', window.hWin.HR('Remove value matching'));

            $('#cb_remove_all').change(function(){ $(this).is(':checked')?$('#fld-1').hide():$('#fld-1').show();  });
            $('.editint-inout-repeat-button').hide();
            
        }else if(action_type=='merge_delete_detail'){ //@todo
            _createInputElement('fld-1', window.hWin.HR('Value to remove'), init_field_value);
            _createInputElement('fld-2', window.hWin.HR('Or repalce it with'));
        }

    }


    function _createInputElement(input_id, input_label, init_value){

        var $fieldset = $('#div_widget>fieldset');

        var dtID = $('#sel_fieldtype').val();//

        if(window.hWin.HEURIST4.util.isempty(dtID)) return;

        var dtidx = window.hWin.HEURIST4.detailtypes.typedefs.fieldNamesToIndex['dty_Type'];

        var scope_type = selectRecordScope.val();
        if(Number(scope_type)>0){
            rectypeID = Number(scope_type)
        }else{
            var i, rtyIDs
            if(scope_type=="Current"){
                rtyIDs = window.hWin.HAPI4.currentRecordset.getRectypes();
            }else{
                rtyIDs = allSelectedRectypes;
            }
            for (i in rtyIDs){
                if(window.hWin.HEURIST4.rectypes.typedefs[rtyIDs[i]].dtFields[dtID]){
                    rectypeID = rtyIDs[i];
                    break;
                }
            }
        }

        //window.hWin.HEURIST4.util.cloneObj(
        var dtFields = window.hWin.HEURIST4.util.cloneJSON(window.hWin.HEURIST4.rectypes.typedefs[rectypeID].dtFields[dtID]);
        var fi = window.hWin.HEURIST4.rectypes.typedefs.dtFieldNamesToIndex;

        dtFields[fi['rst_DisplayName']] = input_label;
        dtFields[fi['rst_RequirementType']] = 'optional';
        dtFields[fi['rst_MaxValues']] = 1;
        dtFields[fi['rst_DisplayWidth']] = 50; //@todo set 50 for freetext and resource
        //dtFields[fi['rst_DisplayWidth']] = 50;
        
        if(window.hWin.HEURIST4.util.isnull(init_value)) init_value = '';

        var ed_options = {
            recID: -1,
            dtID: dtID,
            //rectypeID: rectypeID,
            rectypes: window.hWin.HEURIST4.rectypes,
            values: init_value,
            readonly: false,

            showclear_button: false,
            //input_width: '350px',
            //detailtype: field['type']  //overwrite detail type from db (for example freetext instead of memo)
            dtFields:dtFields

        };

        $("<div>").attr('id',input_id).editing_input(ed_options).appendTo($fieldset);
    }

    //
    //
    //
    function getFieldValue(input_id) {
        var sel = $('#'+input_id).editing_input('getValues');
        if(sel && sel.length>0){
            return sel[0];
        }else{
            return null;
        }
    }

    //
    //
    //
    function _startAction(){


        if ($('#div_result').is(':visible')){
            $('#div_result').hide();
            $('#div_parameters').show();
            $('#btn-ok').button('option','label',window.hWin.HR('Go'));
            return;
        }


        var dtyID = $('#sel_fieldtype').val();
        if(window.hWin.HEURIST4.util.isempty(dtyID)) {
            alert('Field is not defined');
            return;
        }
        var request = { dtyID:dtyID, tag: $('#cb_add_tags').is(':checked')?1:0 };

        if(action_type=='add_detail'){
            request['a'] = 'add';
            request['val'] = getFieldValue('fld-1');
            if(window.hWin.HEURIST4.util.isempty(request['val'])){
                alert('Define value to add');
                return;
            }

        }else if(action_type=='replace_detail'){

            request['a'] = 'replace';
            request['sVal'] = getFieldValue('fld-1');
            if(window.hWin.HEURIST4.util.isempty(request['sVal'])){
                alert('Define value to search');
                return;
            }
            request['rVal'] = getFieldValue('fld-2');
            if(window.hWin.HEURIST4.util.isempty(request['rVal'])){
                alert('Define value to replace');
                return;
            }

        }else if(action_type=='delete_detail'){

            request['a'] = 'delete';
            if(!$('#cb_remove_all').is(':checked')){
                request['sVal'] = getFieldValue('fld-1');
                if(window.hWin.HEURIST4.util.isempty(request['sVal'])){
                    alert('Define value to delete');
                    return;
                }
            }
        }

        var scope_type = selectRecordScope.val();

        if(scope_type=="Selected"){
            request['recIDs'] = window.hWin.HAPI4.currentRecordsetSelection;
        }else{
            request['recIDs'] = window.hWin.HAPI4.currentRecordset.getIds();
            if(scope_type!="Current"){
                request['rtyID'] = scope_type;
            }
        }


        /*
        * recIDs - list of records IDS to be processed
        * rtyID - optional filter by record type
        * dtyID  - detail field to be added
        * for add: val, geo or ulfID
        * for replace: sVal - search value, rVal - replace value
        * for delete:  sVal - search value
        * tag 0|1  - add system tag to mark processed records
        */

        // show hourglass/wait icon
        $('body > div:not(.loading)').hide();
        $('.loading').show();

        window.hWin.HAPI4.RecordMgr.details(request, function(response){

            $('body > div:not(.loading)').show();
            $('.loading').hide();
            var  success = (response.status == window.hWin.HAPI4.ResponseStatus.OK);
            if(success){
                $('#div_parameters').hide();

                $('#div_result').empty();

                response = response['data'];

                /*
                *       passed - count of given rec ids
                *       noaccess - no rights to edit
                *       processed - success
                _tag   _tag_error
                *       undefined - value not found
                *       limitted
                *       errors     - sql error on search or updata
                errors_list
                */
                var sResult = '';
                for(key in response){
                    if(key && key.indexOf('_')<0 && response[key]>0){
                        //main report entry
                        var lbl_key = 'record_action_'+key;
                        var lbl = window.hWin.HR(lbl_key);
                        if(lbl==lbl_key){
                            //not found - try to find specified for particular action
                            lbl = window.hWin.HR(lbl_key+'_'+action_type);
                        }
                        var tag_link = '';
                        if(response[key+'_tag']){
                            tag_link = '<span><a href="'+
                            encodeURI(window.hWin.HAPI4.baseURL+'?db='+window.hWin.HAPI4.database
                                +'&q=tag:"'+response[key+'_tag']+'"')+
                            '" target="_blank">view</a></span>';
                        }else if(response[key+'_tag_error']){
                            tag_link = '<span>'+response[key+'_tag_error']+'</span>';
                        }else if(key=="processed"){
                            tag_link = '<span><a href="'+
                            encodeURI(window.hWin.HAPI4.baseURL+'?db='+window.hWin.HAPI4.database
                                +'&q=sortby:-m after:"5 minutes ago"')+
                            '" target="_blank">view recent changes</a></span>';
                        }

                        sResult = sResult + '<div><span>'+lbl+'</span><span>'
                        +response[key]+'</span>'
                        +tag_link+'</div>'

                    }
                }

                $('#div_result').html(sResult);
                $('#div_result').show();
                $('#btn-ok').button('option','label',window.hWin.HR('New Action'));

            }else{
                $('#div_result').hide();
                window.hWin.HEURIST4.msg.showMsgErr(response.message);
            }
        });

    }


    //public members
    var that = {

        getClass: function () {return _className;},
        isA: function (strClass) {return (strClass === _className);},
        getVersion: function () {return _version;},

    }

    
    _init();
    return that;  //returns object
}
