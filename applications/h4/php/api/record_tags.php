<?php
/**
* Application interface. See hRecordMgr in hapi.js
*     
*       tags and bookmarks manipulation
*/

require_once (dirname(__FILE__).'/../System.php');
require_once (dirname(__FILE__).'/../common/db_tags.php');

$response = array();

$system = new System();
if( ! $system->init(@$_REQUEST['db']) ){

    //get error and response
    $response = $system->getError();

}else{

    $mysqli = $system->get_mysqli();

    if ( $system->get_user_id()<1 ) {

         $response = $system->addError(HEURIST_REQUEST_DENIED);

    }else{

        $action = @$_REQUEST['a'];// || @$_REQUEST['action'];

        // call function from db_record library
        // these function returns standard response: status and data
        // data is recordset (in case success) or message

        $res = false;

        if($action=="add" || $action=="save"){

           $res = tagSave($system, $_REQUEST);

        } else if ($action=="delete" && @$_REQUEST['ids']) {

            $res = tagDelete($system, $_REQUEST['ids'], @$_REQUEST['UGrpID']);

        } else if ($action=="search" && @$_REQUEST['UGrpID'] ) {

            $res = tagGetByRecords($system, true, @$_REQUEST['recIDs'], $_REQUEST['UGrpID']);
            /*
                $res = tagGetByUser($system, false, $_REQUEST['UGrpID']);
            */

        } else if ($action=="set") {  // assign/remove tags to records

            if(@$_REQUEST['assign']){
                $res = tagsAssign($system, @$_REQUEST['recs'], @$_REQUEST['assign'], null, @$_REQUEST['UGrpID']);
            }

            if($res['status']==HEURIST_OK && @$_REQUEST['remove']){
                $res2 = tagsRemove($system, @$_REQUEST['recs'], @$_REQUEST['remove'], null, @$_REQUEST['UGrpID']);
                if($res2['status']==HEURIST_OK){
                    $res['data'] = array_merge($res['data'], $res2['data']);
                }else{
                    $res = $res2;
                }
            }

        } else {

            $system->addError(HEURIST_INVALID_REQUEST, "KUKU");
        }

        if(is_bool($res) && !$res){
            $response = $system->getError();
        }else{
            $response = array("status"=>HEURIST_OK, "data"=> $res);
        }

    }
}

header('Content-type: text/javascript');
print json_encode($response);
exit();
?>