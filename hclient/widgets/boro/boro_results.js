/**
* result list for BORO
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


$.widget( "heurist.boro_results", $.heurist.resultList, {
    
  _initControls:function(){
        this.options.searchfull = this._searchFullRecords; 
        this.options.navigator = 'buttons';
        
        //this.options.renderer = _renderRecord_html;
        
        this._super();

        
        this.div_content.css({'padding':'30px','top':'8em'});//.addClass('bor-search-results');
        
        //this.span_info.appendTo(this.div_header);

        //this.span_info = $('<div>').css('color','red').after(this.div_header);
        
        var $header = $(".header"+this.element.attr('id'));
        this.span_info.addClass('help-block','lead').css({'color':'red','float':'left'}).insertAfter($header);
        
        //add bottom panel and place navigator on it
        this.div_content.removeClass('ent_content_full').addClass('ent_content');
        
        
        this.div_bottom = $( "<div>" ).addClass('ent_footer').css('text-align','center')
                .appendTo( this.element );
        

        this.span_pagination.css('float','').addClass('pagination').appendTo(this.div_bottom);
  },
  
   //
   // function for searchfull option - return full record info
   //
  _searchFullRecords: function(rec_toload, current_page, callback){
      
    var DT_NAME = window.hWin.HAPI4.sysinfo['dbconst']['DT_NAME'], //1
        DT_GIVEN_NAMES = window.hWin.HAPI4.sysinfo['dbconst']['DT_GIVEN_NAMES'],
        DT_EXTENDED_DESCRIPTION = 134;//window.hWin.HAPI4.sysinfo['dbconst']['DT_EXTENDED_DESCRIPTION']; //4      
      
                var ids = rec_toload.join(',');
                var request = { q: 'ids:'+ ids,
                    w: 'a',
                    detail: 'detail', //[DT_NAME, DT_GIVEN_NAMES, DT_EXTENDED_DESCRIPTION], 
                    id: current_page,
                    source:this.element.attr('id') };
               var that = this;
                    
                window.hWin.HAPI4.RecordMgr.search(request, function(responce){
                    that._onGetFullRecordData(responce, rec_toload);   
                });
      
  },  

  _renderPage: function(pageno, recordset, is_retained_selection){

        this._super( pageno, recordset, is_retained_selection );

               $('.div-result-list-content').css('overflow','hidden');
               var newHeight = $('.div-result-list-content')[0].scrollHeight + 100;
               if (newHeight<500) newHeight = 500;
               
        $('.bor-search-results').height( newHeight );
  },    
    
 //<h3 class="bor-section-title">Results</h3>   
 _renderRecord_html: function(recordset, record){
  
        function fld(fldname){
            return recordset.fld(record, fldname);
        }

        var DT_NAME = window.hWin.HAPI4.sysinfo['dbconst']['DT_NAME'], //1
            DT_GIVEN_NAMES = window.hWin.HAPI4.sysinfo['dbconst']['DT_GIVEN_NAMES'],
            DT_EXTENDED_DESCRIPTION = 134;//window.hWin.HAPI4.sysinfo['dbconst']['DT_EXTENDED_DESCRIPTION']; //4      
   
        var fullName = fld(DT_GIVEN_NAMES)+' '+fld(DT_NAME);
   
        //get thumbnail if available for this record, or generic thumbnail for record type
        var html_thumb = '';
        if(fld('rec_ThumbnailURL')){
            html_thumb = 
                '<a href="#" class="bor-stop-image ab-dark" data-ab-yaq="19" style="background-color: rgb(19, 19, 19);">'
                +'<img src="'+fld('rec_ThumbnailURL')+'" alt="Photograph of '+fullName
                +'" data-adaptive-background="1" data-ab-color="rgb(19,19,19)"></a>';
            //'<div class="recTypeThumb realThumb" style="background-image: url(&quot;'+ fld('rec_ThumbnailURL') + '&quot;);opacity:1"></div>';
        }else{
            html_thumb = '<a href="#" class="bor-stop-image bor-stop-image-placeholder"></a>';
        }
   
        var html = 
                '<div class="bor-search-result bor-stop bor-stop-large">'
                + html_thumb
                + '<div class="bor-stop-description">'
                +     '<h3><a href="#">'+fullName+'</a></h3>'
                +     '<p class="bor-search-result-text">'+fld(DT_EXTENDED_DESCRIPTION)+'</p>'
                + '</div>'
                +'</div>';

        return html;
 },
 
 //
 // overwrite parent method
 //
 _updateInfo: function(){
     
 },
 
 _renderSearchInfoMsg: function(data){
     
    this._super( data ); 
    
    if(data==null){
        this.span_info.html('');
        return;
    }
     
    var total_inquery = data.count_total();
    var sinfo = [total_inquery+' result'+(total_inquery>1?'s':'')+' found.'];
                /*
    this.span_info.prop('title','');
    this.span_info.html(sinfo);    
    this.span_info.show();
               */
    //translate search criteria in human readable explanatory text
    // for persons only
    
    //get faceted search instance
    var app = window.hWin.HAPI4.LayoutMgr.appGetWidgetByName('dh_search');
    var iFacetedSearch = $(app.widget).dh_search('getFacetedSearch');    
    
    if(iFacetedSearch!=null){
            //get faceted search values
            var values = iFacetedSearch.search_faceted('getFacetsValues');    
            var add_filter = iFacetedSearch.search_faceted('option','add_filter');
            var f_params = iFacetedSearch.search_faceted('option','params');
            var primary_rt = f_params.rectypes[0];
        
            var idx=0, len = values.length;

            if (len>0 || !window.hWin.HEURIST4.util.isempty(add_filter)) {            
            
                if(primary_rt==10){  //for persons only
                
                    function __getTerm(value){
                        
                        //check if comma separated and take first one
                        var aval = value.split(',');
                        if(window.hWin.HEURIST4.util.isArrayNotEmpty(aval)){

                            var term_id = aval[0];
                            if(!window.hWin.HEURIST4.terms.termsByDomainLookup.enum[term_id]){
                                console.log('term '+term_id+' not found');
                                return 'term#'+term_id;   
                            }else{
                                return window.hWin.HEURIST4.terms.termsByDomainLookup.enum[term_id][0];
                            }
                        }
                    }
                
                    sinfo.push('Showing');
                    
                    var gender = 'people';
                    var born = '';
                    var educated = '';
                    var qualification = '';
                    var served = '';
                    var awarded = '';
                    var died = '';
                    
                    var died_were = [4247,4970,4592,4632,4807];
                    
/*                    
{"ui_title":"People (ao test)","rectypes":["10"],"facets":
[{"var":3,"code":"10:lt103:24:9","title":"Date of Birth","type":"date","order":0,"isfacet":"1","help":""},
 {"var":4,"code":"10:lt103:24:lt78:25:1","title":"Born in","type":"freetext","order":1,"isfacet":"2b","help":""},
 {"var":0,"code":"10:20","title":"Gender","type":"enum","order":2,"isfacet":"2b","help":""},
 {"var":2,"code":"10:lt102:27:lt97:26:1","title":"Name of institution","type":"freetext","order":3,"isfacet":"2b","help":""},
 {"var":1,"code":"10:lt102:27:80","title":"Qualification","type":"enum","order":4,"isfacet":"2b","help":""},
 {"var":5,"code":"10:lt88:29:99","title":"Military rank","type":"enum","order":5,"isfacet":"2b","help":""},
 {"var":6,"code":"10:lt87:28:98","title":"Military award","type":"enum","order":6,"isfacet":"2b","help":""},
 {"var":7,"code":"10:lt95:33:143","title":"Cause of death","type":"enum","order":7,"isfacet":"2b","help":""},
 {"var":8,"code":"10:lt95:33:9","title":"Date of death","type":"date","order":8,"isfacet":"1","help":""},
 {"var":9,"code":"10:lt95:33:lt78:25:1","title":"Died in","type":"freetext","order":9,"isfacet":"2b","help":""}],
 "version":2,"title_hierarchy":false,"domain":"all","rules":"","sup_filter":""}                    
*/                
                    for (;idx<len;idx++){
                
                        var code = values[idx]['code'];
                        var val =  values[idx].value;

                        switch (code) {
                            case '10:20':
                                 if(val==414){
                                     gender = 'men';
                                 }else if(val==415){
                                     gender = 'women';
                                 }
                            break;
                            case '10:lt103:24:9':   //birth date
                                 born = born+' in the year '+val;
                            break;
                            case '10:lt103:24:lt78:25:1': //birth place
                                 born = born+' in '+val;
                            case '10:lt103:24:lt78:25:26': //birth country
                                 born = born+' in '+__getTerm(val);
                            break;
                            case '10:lt102:27:lt97:26:1':   //Name of institution
                                 educated = val;
                            break;
                            case '10:lt102:27:80':   //Qualification
                                 qualification = __getTerm(val); 
                            break;
                            case '10:lt88:29:99':   //Military rank
                                 served = __getTerm(val); 
                            break;
                            case '10:lt87:28:98':   //Military award
                                awarded = __getTerm(val); 
                            break;
                            case '10:lt95:33:9':   //death date
                                 died = died+' in the year '+val;
                            break;
                            case '10:lt95:33:143':   //death cause
                                 if (died_were.indexOf(Number(val))<0){
                                    died = died+' from ';    
                                 }else{
                                    died = died+' were ';
                                 }
                                 died = died+__getTerm(val);
                            break;
                            case '10:lt95:33:lt78:25:1': //death place
                                 died = died+' in '+val;
                            case '10:lt95:33:lt78:25:26': //death place  country
                                 died = died+' in '+__getTerm(val);
                            break;
                            default:
                            
                        }
                        
                        //sinfo.push(code);
                        //sinfo.push( values[idx].value+',');
                        
    //console.log(code+'='+values[idx].value);                    
                    }//for
                  
//console.log('here');
                    
                    sinfo.push(gender);
                    if(born!=''){
                        born = 'born'+born;
                        sinfo.push(born);
                    }
                    if(qualification!=''){
                        qualification = 'who studied '+qualification;
                        sinfo.push(qualification);
                    }
                    if(educated!=''){
                        if(qualification==''){
                            educated = 'were educated at '+educated;
                        }else{
                            educated = 'at '+educated;
                        }
                        
                        sinfo.push(educated);
                    }
                    if(served!=''){
                        served = 'who served as '+served;
                        sinfo.push(served);
                    }
                    if(awarded!=''){
                        awarded = ' were awarded '+awarded;
                        awarded = ((served=='')?'who':'and') + awarded;
                        sinfo.push(awarded);
                    }
                    if(died!=''){
                        died = 'who died'+died;
                        sinfo.push(died);
                    }
                    
                }//for persons only
                else{
                    sinfo.push('Showing '+window.hWin.HEURIST4.rectypes.names[primary_rt]);    
                }
                
                if(!window.hWin.HEURIST4.util.isempty(add_filter)){
                   sinfo.push('matching the phrase "'+add_filter['any'][0]['f:1']+'".');
                }
            
            }//has values
            
            
    }
    
    this.span_info.html(sinfo.join(' '));   
     
 }

 
    
});