<?php

/*
* Copyright (C) 2005-2013 University of Sydney
*
* Licensed under the GNU License, Version 3.0 (the "License"); you may not use this file except
* in compliance with the License. You may obtain a copy of the License at
*
* http://www.gnu.org/licenses/gpl-3.0.txt
*
* Unless required by applicable law or agreed to in writing, software distributed under the License
* is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
* or implied. See the License for the specific language governing permissions and limitations under
* the License.
*/

/**
* selectDBForImport.php
* Shows a list of registered databases to allow choosing source for structural elements 
*
* @author      Tom Murtagh
* @author      Kim Jackson
* @author      Ian Johnson   <ian.johnson@sydney.edu.au>
* @author      Stephen White   <stephen.white@sydney.edu.au>
* @author      Artem Osmakov   <artem.osmakov@sydney.edu.au>
* @copyright   (C) 2005-2013 University of Sydney
* @link        http://Sydney.edu.au/Heurist
* @version     3.1.0
* @license     http://www.gnu.org/licenses/gpl-3.0.txt GNU License 3.0
* @package     Heurist academic knowledge management system
* @subpackage  !!!subpackagename for file such as Administration, Search, Edit, Application, Library
*/


    require_once(dirname(__FILE__).'/../../common/connect/applyCredentials.php');
    require_once(dirname(__FILE__).'/../../records/files/fileUtils.php');

    if(isForAdminOnly("to import structural elements")){
       return;
    }

?>
<html>
	<head>
		<title>Selection of source database for structure import</title>

		<!-- YUI -->
		<link rel="stylesheet" type="text/css" href="../../external/yui/2.8.2r1/build/fonts/fonts-min.css" />
		<link rel="stylesheet" type="text/css" href="../../external/yui/2.8.2r1/build/paginator/assets/skins/sam/paginator.css">
		<link type="text/css" rel="stylesheet" href="../../external/yui/2.8.2r1/build/datatable/assets/skins/sam/datatable.css">
		<script type="text/javascript" src="../../external/yui/2.8.2r1/build/yahoo-dom-event/yahoo-dom-event.js"></script>
		<script type="text/javascript" src="../../external/yui/2.8.2r1/build/element/element-min.js"></script>
		<script type="text/javascript" src="../../external/yui/2.8.2r1/build/json/json-min.js"></script>
		<script type="text/javascript" src="../../external/yui/2.8.2r1/build/datasource/datasource-min.js"></script>
		<script type="text/javascript" src="../../external/yui/2.8.2r1/build/datatable/datatable-min.js"></script>
		<script type="text/javascript" src="../../external/yui/2.8.2r1/build/paginator/paginator-min.js"></script>

		<link rel=stylesheet href="../../common/css/global.css">
		<link rel=stylesheet href="../../common/css/admin.css">

		<style type="text/css">
			.yui-skin-sam .yui-dt-liner { white-space:nowrap; }
			.button {padding:2px; width:auto; height:15px !important}
			button.button {width:auto;}
			.yui-dt-highlighted{
				cursor:pointer !important;
			}
		</style>

	</head>

	<body class="popup yui-skin-sam" style="overflow: auto;">

		<div class="banner"><h2>Import structural definitions into current database</h2></div>
		<div id="page-inner" style="overflow:auto">

			<div id="statusMsg"><img src="../../common/images/mini-loading.gif" width="16" height="16" /> &nbspDownloading database list...</div>
			<p>The list below shows available databases registered with the HeuristScholar.org Index database.<br />
Older (or newer) format registered databases may not shown, as this list pny show databases with version number <?=HEURIST_DBVERSION?>.<br />
Use the filter to locate a specific term in the name or title. <br />
Click the database icon on the left to view available record types in that database.<br />
<b>Bolded</b> databases contain collections of schemas curated by the Heurist team or members of the Heurist community
					<br />
			</p>
			<div class="markup" id="filterDiv" style="display:none">
				<label for="filter">Filter:</label> <input type="text" id="filter" value="">
				<div id="tbl"></div>
			</div>
			<div id="topPagination"></div>
			<div id="selectDB"></div>
			<div id="bottomPagination"></div>


			<form id="crosswalkInfo" action="buildCrosswalks.php?db=<?= HEURIST_DBNAME?>" method="POST">
				<input id="dbID" name="dbID" type="hidden">
				<input id="dbURL" name="dbURL" type="hidden">
				<input id="dbName" name="dbName" type="hidden">
				<input id="dbTitle" name="dbTitle" type="hidden">
				<input id="dbPrefix" name="dbPrefix" type="hidden">
			</form>
		</div>
		<script type="text/javascript">
			var registeredDBs = [];
			<?php

				require_once(dirname(__FILE__).'/../../common/php/dbMySqlWrappers.php');
				require_once(dirname(__FILE__)."/../../common/config/initialise.php");
				mysql_connection_insert(DATABASE); // Connect to the current database

				// Send request to getRegisteredDBs on the master Heurist index server, to get all registered databases and their URLs
				$reg_url =  HEURIST_INDEX_BASE_URL . "admin/structure/getRegisteredDBs.php?t=11"; //HEURIST_INDEX_BASE_URL POINTS TO HEURISTSCHOLAR.ORG
                
//error_log(">>>>".HEURIST_HTTP_PROXY."  ".$reg_url);
                
				$data = loadRemoteURLContent($reg_url, true); //without proxy

                if($data){                    
                    $data = json_decode($data);
                    if(!is_array($data)){
                        if(defined("HEURIST_HTTP_PROXY")){
                            $data = loadRemoteURLContent($reg_url, false); //with proxy
                            if($data){                    
                                $data = json_decode($data);
                                if(!is_array($data)){
                                    $data = null;
                                }
                            }
                        }
                    }
                }
     

				if($data) {
                    
					// If data has been successfully received, write it to a javascript array, leave out own DB if found
					$res = mysql_query("select sys_dbRegisteredID from sysIdentification where `sys_ID`='1'");
					if($res) {
						$row = mysql_fetch_row($res);
						$ownDBID = $row[0];
						echo 'var ownDBname = "'.$ownDBID.'";' . "\n";
					} else {
						$ownDBID = 0;
					}
                    
					foreach($data as $registeredDB) {

						if($ownDBID != $registeredDB->rec_ID) {

							if(array_key_exists('version',$registeredDB) &&	($registeredDB->version==null || $registeredDB->version<HEURIST_DBVERSION))
							{
								continue;
							}

							$rawURL = $registeredDB->rec_URL;
							$splittedURL = explode("?", $rawURL);

							$dbID = $registeredDB->rec_ID;
							$dbURL = $splittedURL[0];
							preg_match("/db=([^&]*).*$/", $rawURL,$match);
							$dbName = $match[1];
							if (preg_match("/prefix=([^&]*).*$/", $rawURL,$match)){
								$dbPrefix = $match[1];
							}else{
								unset($dbPrefix);
							}
							$dbTitle = $registeredDB->rec_Title;
							$dbPopularity = $registeredDB->rec_Popularity;


							//find version of database. ARTEM - not sure about prefix!
							/*$query = 'select sys_dbVersion, sys_dbSubVersion, sys_dbSubSubVersion from '.($dbPrefix?$dbPrefix:HEURIST_DB_PREFIX).$dbName.'.sysIdentification';
							$res = mysql_query($query);
							$sysValues = mysql_fetch_assoc($res);
							$version = $sysValues['sys_dbVersion'].".".$sysValues['sys_dbSubVersion'].".".$sysValues['sys_dbSubSubVersion'];
							if ( HEURIST_DBVERSION>$version ) {
								continue;
							}*/

							echo 'if(!registeredDBs['.$dbID.']) {' . "\n";
							echo 'registeredDBs['.$dbID.'] = new Array();' . "\n";
							echo '}' . "\n";
							echo 'var registeredDB = [];' . "\n";
							echo 'registeredDB[0] = '.$dbID.';' . "\n";
							echo 'registeredDB[1] = "'.$dbURL.'";' . "\n";
							echo 'registeredDB[2] = "'.$dbName.'";' . "\n";
							echo 'registeredDB[3] = "'.$dbTitle.'";' . "\n";
							echo 'registeredDB[4] = "'.$dbPopularity.'";' . "\n";
							echo 'registeredDB[5] = "'.@$dbPrefix.'";' . "\n"; // @ b/c prefix may not be defined
							//echo 'registeredDB[6] = "'.$version.'";' . "\n";
							echo 'registeredDBs['.$dbID.'].push(registeredDB);' . "\n";

						}
					}
				}else{
                    echo 'alert("Can not access '.$reg_url.'\n\n Verify your proxy settings")';
                }
			?>

			// Create a YUI DataTable
			var myDataTable;
			YAHOO.util.Event.addListener(window, "load", function() {
					YAHOO.example.Basic = function() {
						var myColumnDefs = [
							{key:"id", label:"ID" , formatter:YAHOO.widget.DataTable.formatNumber, sortable:true, resizeable:false, width:"40", className:"right"},
							{key:"crosswalk", label:"Browse", resizeable:false, width:"60", className: "center"},
							{key:"name", label:"Database Name" , sortable:true, resizeable:true, formatter:function(elLiner, oRecord, oColumn, oData) {
									var str = oRecord.getData("name");
									var id = oRecord.getData("id");
									if(Number(id)<21){
										elLiner.innerHTML = '<b>'+str+'</b>';
									}else{
										elLiner.innerHTML = str;
									}
							}},
							{key:"description", label:"Description", sortable:true, resizeable:true},
							// Currently no useful data in popularuity value
							//{key:"popularity", label:"Popularity", formatter:YAHOO.widget.DataTable.formatNumber,sortable:true, resizeable:true, hidden:true }
							{key:"URL", label:"Server URL",sortable:true, resizeable:true}
						];

						//TODO: Add the URL as a hyperlink so that one can got to a search of the database
						//      Also add as a filter criteria so you can find databases by server, for example

						// Add databases to an array that YUI DataTable can use. Do not show URL for safety
						dataArray = [];
						for(dbID in registeredDBs) {
							db = registeredDBs[dbID];
							dataArray.push([db[0][0],db[0][2],db[0][3],'<a href=\"'+db[0][1]+'search/search.html?db='+db[0][2]+'\" target=\"_blank\">'+db[0][1]+'</a>','<img src="../../common/images/b_database.png" class="button"/>']);
						}

						var myDataSource = new YAHOO.util.LocalDataSource(dataArray,{
								responseType : YAHOO.util.DataSource.TYPE_JSARRAY,
								responseSchema : {
									fields: ["id","name","description","URL","crosswalk"]
								},
								// This is the filter function
								doBeforeCallback : function (req,raw,res,cb) {
									var data = res.results || [],
									filtered = [],
									i,l;
									if (req) {
										req = req.toLowerCase();
										// Do a wildcard search for both name and description and URL
										for (i = 0, l = data.length; i < l; ++i) {
											if (data[i].description.toLowerCase().indexOf(req) >= 0 ||
												data[i].URL.toLowerCase().indexOf(req) >= 0)
												{
												filtered.push(data[i]);
											}
										}
										res.results = filtered;
									}
									return res;
								}
						});
						// Use pages. Show max 50 databases per page
						myDataTable = new YAHOO.widget.DataTable("selectDB", myColumnDefs, myDataSource, {
								paginator: new YAHOO.widget.Paginator({
										rowsPerPage:50,
										containers:['topPagination','bottomPagination']
								}),

								sortedBy: { key:'id' }
						}),


						// Updates the datatable when filtering
						filterTimeout = null;
						updateFilter  = function () {
							// Reset timeout
							filterTimeout = null;

							// Reset sort
							var state = myDataTable.getState();
							state.sortedBy = {key:'id', dir:YAHOO.widget.DataTable.CLASS_ASC};

							// Get filtered data
							myDataSource.sendRequest(YAHOO.util.Dom.get('filter').value,{
									success : myDataTable.onDataReturnInitializeTable,
									failure : myDataTable.onDataReturnInitializeTable,
									scope   : myDataTable,
									argument: state
							});
						},

						YAHOO.util.Event.on('filter','keyup',function (e) {
								clearTimeout(filterTimeout);
								setTimeout(updateFilter,600);
						});

						myDataTable.subscribe("rowMouseoverEvent", myDataTable.onEventHighlightRow);
						myDataTable.subscribe("rowMouseoutEvent", myDataTable.onEventUnhighlightRow);


						myDataTable.subscribe("cellClickEvent", function(oArgs){

								var elTargetCell = oArgs.target;
								if(elTargetCell) {
									var oColumn = myDataTable.getColumn(elTargetCell);
									var oRecord = myDataTable.getRecord(elTargetCell);
									if(oColumn.key !== 'URL' && oRecord){
										doCrosswalk(oRecord.getData("id"));
									}
								}

						});

						return {
							oDS: myDataSource,
							oDT: myDataTable
						};
					}();
					document.getElementById("statusMsg").innerHTML = "";
					document.getElementById("filterDiv").style.display = "block";
			});

			// Enter information about the selected database to an invisible form, and submit to the crosswalk page, to start crosswalking
			function doCrosswalk(dbID) {
				db = registeredDBs[dbID];
				document.getElementById("dbID").value = db[0][0];
				document.getElementById("dbURL").value = db[0][1];
				document.getElementById("dbName").value = db[0][2];
				document.getElementById("dbTitle").value = db[0][3];
				document.getElementById("dbPrefix").value = db[0][5]?db[0][5]:"";
				document.forms["crosswalkInfo"].submit();
			}
		</script>
	</body>
</html>
