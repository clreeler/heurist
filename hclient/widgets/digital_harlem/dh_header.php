<?php

/**
* dh_header.php (Digital Harlem): Writes the header with statistical information about the database
*
* @package     Heurist academic knowledge management system
* @link        http://HeuristNetwork.org
* @copyright   (C) 2005-2016 University of Sydney
* @author      Artem Osmakov   <artem.osmakov@sydney.edu.au>
* @author      Ian Johnson     <ian.johnson@sydney.edu.au>
* @license     http://www.gnu.org/licenses/gpl-3.0.txt GNU License 3.0
* @version     4
*/

/*
* Licensed under the GNU License, Version 3.0 (the "License"); you may not use this file except in compliance
* with the License. You may obtain a copy of the License at http://www.gnu.org/licenses/gpl-3.0.txt
* Unless required by applicable law or agreed to in writing, software distributed under the License is
* distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied
* See the License for the specific language governing permissions and limitations under the License.
*/

require_once(dirname(__FILE__)."/../../../hserver/System.php");
require_once(dirname(__FILE__)."/../../../hserver/dbaccess/db_recsearch.php");

$statistics = "";
$system = new System();
// connect to given database
if(@$_REQUEST['db'] && $system->init(@$_REQUEST['db'])){
    //include('dh_stats.php');
    $appcode = @$_REQUEST['app'];
    if($appcode=='DigitalHarlem1935'){
        $appcode = 4800; //4751;
    }else if($appcode=='DigitalHarlem'){
        $appcode = 4799; //4750
    }else{
        $appcode = 0;
    }  
}
?>
<html>
    <body>
        <div id="topstuff">

            <div  id="header">


                <div id="header_title">
                    <!-- 
                    <div class="home">
                    <p><b><a title="Home - Digital Harlem" href="#" onclick="{location.reload()}">Home</a></b>&nbsp;<b><a title="Focus on Map" href="#contentstart">Center Map</a></b>&nbsp; 
                    <a href="javascript:void(0)" onClick="toggleFullScreen()">X</a></p>
                    </div>
                    -->
                </div>


                <div class="intro">
                    <?=$statistics?>
                </div>

                <div class="spacer"></div>

            </div>

            <div id="searchbar">


                <div class="menubutton"><a class="menuitem" href="javascript:void(0)" onClick="{location.reload(true);}">HOME</a></div>
                <?php
                if(true){
                    // Building query
                    $query = 'SELECT rec_ID id, rec_Title as title, d1.dtl_Value as content, d2.dtl_Value as ord, '
                    .' d3.dtl_Value as btn_title'
                    .' FROM Records '
                    .' left join recDetails d2 on rec_ID=d2.dtl_recID and d2.dtl_DetailTypeID=94 '  //order 
                    .' , recDetails d1, recDetails d3 '   
                    .' WHERE rec_ID=d1.dtl_recID and rec_RecTypeID=25 and d1.dtl_DetailTypeID=4 and ' //content
                    .' rec_ID=d3.dtl_recID and d3.dtl_DetailTypeID=1 '   //title
                    .' ORDER BY d2.dtl_Value';


                    //find Web Content (25) for header buttons ---------------------------------------
                    /*        
                    var query;
                    if(window.hWin.HAPI4.sysinfo['layout']=='DigitalHarlem1935'){
                    //query = {"t":"25","f:154":"4800"};
                    $query = "t:25 f:154:4800 sortby:f:94";
                    }else{
                    //query = {"t":"25","f:154":"4799"};
                    $query = "t:25 sortby:f:94"; //f:154:4799 
                    }
                    */      
                    //@todo all this stuff should be implemented on client side since header is not static content anymore  

                    // Put record types & counts in the table
                    if($system->is_inted()){
                        $res = $system->get_mysqli()->query($query);
                        $stats = array();
                        while($row = $res->fetch_assoc()) { // each loop is a complete table row


                            if($appcode>0){
                                //detect app
                                $list = mysql__select_list($system->get_mysqli(), 'recDetails', 'dtl_Value', 
                                    'dtl_recID='.$row["id"].' and dtl_DetailTypeID=154'); //145
                                $classes = '';    
                                $isNotFound = true;
                                if(is_array($list))
                                    foreach($list as $val){
                                        if($val==$appcode ){
                                            $isNotFound = false;
                                            break;
                                        }
                                }
                                if($isNotFound) continue;
                            }

                            $btn_title = $row['btn_title']?$row['btn_title']:$row['title'];

                            if($row["ord"]>0){
                                print '<div class="menubutton">';
                                print '<a class="menuitem" href="javascript:void(0)" onClick="{ 
                                window.hWin.HEURIST4.msg.showMsgDlg(\'#webcontent'.$row["id"].'\', null,\''.$btn_title.'\');}">'
                                .$btn_title.'</a></div>';
                            }else{
                                //not ordered - means should be auto opened
                                ?>
                                <script>
                                    window.hWin.HEURIST4.msg.showMsgDlg('#webcontent<?=$row["id"]?>', null,'<?=$btn_title?>');
                                </script>
                                <?php
                            }
                            ?>
                            <div style="display:none;" id="webcontent<?=$row["id"]?>">
                                <?php
                                print $row["content"];
                                ?>
                            </div>

                            <?php
                        }//while
                    }
                }
                switch ($appcode) {
                    case 4799: ?> 
                        <div class="menubutton"><a class="menuitem" href="javascript:void(0)" onClick="{ window.open('http://digitalharlemblog.wordpress.com/', 'DHBlog'); }">BLOG</a></div> <?php ;
                        break;
                    case 4800: ?>
                        <div class="menubutton"><a class="menuitem" href="javascript:void(0)" onClick="{ window.open('http://1935harlemriot.org', 'DHBlog'); }">1935 BLOG</a></div> <?php ;
                        break;
                }

                ?>

            </div>

        </div>  <!-- topstuff -->
    </body>
</html>