<?php

    /**
    * Application interface. See hSystemMgr in hapi.js
    *    user/groups information/credentials
    *    saved searches
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

    require_once (dirname(__FILE__).'/../System.php');
    require_once (dirname(__FILE__).'/../dbaccess/db_users.php');
    require_once (dirname(__FILE__).'/../dbaccess/db_svs.php');

    $response = array(); //"status"=>"fatal", "message"=>"OBLOM");
    $res = false;

    $action = @$_REQUEST['a']; //$system->getError();
     
    $system = new System();
        
    
    if($action=='is_logged'){ //just check only if logged in
        
        $res = $system->is_logged(@$_REQUEST['db']);
        
    }else if( ! $system->init(@$_REQUEST['db'], ($action!='sysinfo') ) ){ //the only action that is possible without db 

        //get error and response
        //$response = $system->getError();
        
    }else if($action=='usr_log'){
        
        $system->user_LogActivity(@$_REQUEST['activity'], @$_REQUEST['suplementary']);
        $res = true;
        
    }else{

        $mysqli = $system->get_mysqli();
        
        if ($action=="sysinfo") {
            
            $res = $system->getCurrentUserAndSysInfo();

        }else        
        //no enough permission for guest
        if ( $system->get_user_id()<1 &&
            !( $action=='login' || $action=='logout' || $action=='reset_password' || $action=='svs_savetree'  || $action=='svs_gettree'
               || $action=='usr_save' || $action=='usr_get' || $action=='svs_get' ) ) {

            $response = $system->addError(HEURIST_REQUEST_DENIED);

        }else{

            $res = false;

            if ($action=="login") {

                //check request
                $username = @$_REQUEST['username'];
                $password = @$_REQUEST['password'];
                $session_type = @$_REQUEST['session_type'];

                if($system->login($username, $password, $session_type)){
                    $res = $system->getCurrentUserAndSysInfo();
                    checkDatabaseFunctions($mysqli);
                }

            } else if ($action=="reset_password") {

                $system->user_LogActivity('ResetPassword');
                
                if(user_ResetPassword($system, @$_REQUEST['username'])){
                    $res = true;
                }

            } else if ($action=="logout") {
                
                $system->user_LogActivity('Logout');

                if($system->logout()){
                    $res = true;
                }
                
            } else  if ($action=="action_password") { //special passwords for some admin actions - defined in configIni.php
            
                    $action = @$_REQUEST['action'];
                    $password = @$_REQUEST['password'];
                    if($action && $password){
                        $varname = 'passwordFor'.$action;
                        $res = (@$$varname==$password)?'ok':'wrong';
                    }
                        
            } else if ($action == "save_prefs"){ //save preferences into session

                user_setPreferences($system->dbname_full(), $_REQUEST);
                $res = true;

            } else if ($action=="usr_save") {

                $res = user_Update($system, $_REQUEST);

            } else if ($action=="usr_get" && is_numeric(@$_REQUEST['UGrpID'])) {

                $ugrID = $_REQUEST['UGrpID'];

                if($system->is_admin2($ugrID)){
                    $res = user_getById($system->get_mysqli(), $ugrID);
                    if(is_array($res)){
                        $res['ugr_Password'] = '';
                    }
                }else{
                    $system->addError(HEURIST_REQUEST_DENIED);
                }

            } else if ($action=="groups") {

                $ugr_ID = @$_REQUEST['UGrpID']?$_REQUEST['UGrpID']:$system->get_user_id();

                $res = user_getWorkgroups($system->get_mysqli(), $ugr_ID, true);

            } else if ($action=="members" && @$_REQUEST['UGrpID']) {

                $res = user_getWorkgroupMemebers($system->get_mysqli(), @$_REQUEST['UGrpID']);

            } else if ($action=="svs_save"){

                $res = svsSave($system, $_REQUEST);

            } else if ($action=="svs_delete" && @$_REQUEST['ids']) {

                $res = svsDelete($system, $_REQUEST['ids'], @$_REQUEST['UGrpID']);

            } else if ($action=="svs_get" ) {

                if(@$_REQUEST['svsIDs']){
                    $res = svsGetByIds($system, $_REQUEST['svsIDs'], @$_REQUEST['UGrpID']);
                }else{
                    $res = svsGetByUser($system, @$_REQUEST['UGrpID']);
                }

            } else if ($action=="svs_savetree" ) { //save saved searches tree status

                $res = svsSaveTreeData($system, @$_REQUEST['data']);

            } else if ($action=="svs_gettree" ) { //save saved searches tree status

                $res = svsGetTreeData($system, @$_REQUEST['UGrpID']);

            } else {

                $system->addError(HEURIST_INVALID_REQUEST);
            }


        }
        
    }
    
    if(is_bool($res) && !$res){
        $response = $system->getError();
    }else{
        $response = array("status"=>HEURIST_OK, "data"=> $res);
    }
        
    header('Content-type: text/javascript');
    print json_encode($response);
?>
