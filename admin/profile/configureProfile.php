<?php

/*
* Copyright (C) 2005-2016 University of Sydney
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
* brief description of file
*
* @author      Tom Murtagh
* @author      Kim Jackson
* @author      Ian Johnson   <ian.johnson@sydney.edu.au>
* @author      Stephen White   
* @author      Artem Osmakov   <artem.osmakov@sydney.edu.au>
* @copyright   (C) 2005-2016 University of Sydney
* @link        http://HeuristNetwork.org
* @version     3.1.0
* @license     http://www.gnu.org/licenses/gpl-3.0.txt GNU License 3.0
* @package     Heurist academic knowledge management system
* @subpackage  !!!subpackagename for file such as Administration, Search, Edit, Application, Library
*/


require_once(dirname(__FILE__).'/../../common/php/dbMySqlWrappers.php');
require_once(dirname(__FILE__).'/../../common/connect/applyCredentials.php');
require_once(dirname(__FILE__).'/../../common/t1000/.ht_stdefs');

if (! is_logged_in()) {
	header('Location: ' . HEURIST_BASE_URL . 'common/connect/login.php?db='.HEURIST_DBNAME);
	return;
}


if (@$_REQUEST['submitted']) {
	mysql_connection_overwrite(USERS_DATABASE);
	mysql_query('update sysUGrps usr set ugr_MinHyperlinkWords = '.intval(@$_REQUEST['word_limit']).' where usr.ugr_ID='.get_user_id());
	mysql_connection_overwrite(USERS_DATABASE);
	mysql_query('update sysUGrps usr set ugr_MinHyperlinkWords = '.intval(@$_REQUEST['word_limit']).' where usr.ugr_ID='.get_user_id());
	mysql_connection_overwrite(DATABASE);

	if (@$_REQUEST['new_hyp_text']) {
		$res = mysql_query('select * from usrHyperlinkFilter
		                     where (hyf_UGrpID is null or hyf_UGrpID='.get_user_id().')
		                       and hyf_String="'.mysql_real_escape_string(@$_REQUEST['new_hyp_text']).'"');
		if (mysql_num_rows($res) == 0) {
			mysql__insert('usrHyperlinkFilter',
			             array('hyf_String' => @$_REQUEST['new_hyp_text'],
			                   'hyf_UGrpID' => get_user_id()));
		}
	}
}

$tag_message = '';
if (@$_REQUEST['delete_kwd_id']) {
	mysql_connection_overwrite(DATABASE);
	$kwd_id = intval(@$_REQUEST['delete_kwd_id']);
	mysql_query('delete from usrTags where tag_ID = ' . $kwd_id . ' and tag_UGrpID= ' . get_user_id());
	if (mysql_affected_rows()) {
		mysql_query('delete from usrRecTagLinks where rtl_TagID = ' . $kwd_id);
		$tag_message .= '<div class="success">Tag was deleted</div>';
	} else {
		$tag_message .= '<div class="failure">Tag was not deleted</div>';
	}
}

if (@$_REQUEST['update_kwd_from']  and  @$_REQUEST['update_kwd_to']) {
	mysql_connection_overwrite(DATABASE);
	$kwd_from = intval(@$_REQUEST['update_kwd_from']);
	$kwd_to = intval(@$_REQUEST['update_kwd_to']);

	/* check that both tags belong to this user */
	$res = mysql_query('select * from usrTags where tag_ID in ('.$kwd_from.','.$kwd_to.') and tag_UGrpID='.get_user_id());
	if (mysql_num_rows($res) == 2) {
		mysql_query('update ignore usrRecTagLinks set rtl_TagID = '.$kwd_to.' where rtl_TagID = '.$kwd_from);
		$count = mysql_affected_rows();
		mysql_query('delete from usrTags where tag_ID = '.$kwd_from);

		if ($count == -1)
			$tag_message .= '<div class="success">Tag changed: duplicate tag links removed</div>';
		else if ($count != 1)
			$tag_message .= '<div class="success">Tag changed: ' . $count . ' tag links updated</div>';
		else
			$tag_message .= '<div class="success">Tag changed: one tag link updated</div>';
	} else {
		$tag_message .= '<div class="failure">Tag not changed</div>';
	}
}

if (@$_REQUEST['change_names']) {
	mysql_connection_overwrite(DATABASE);
	$orig_kwd_label = mysql__select_assoc('usrTags', 'tag_ID', 'tag_Text', 'tag_UGrpID='.get_user_id());

	$count = 0;
	foreach (@$_REQUEST['kwdl'] as $kwd_id => $new_kwd_label) {
		if ($orig_kwd_label[$kwd_id]  and  $orig_kwd_label[$kwd_id] != $new_kwd_label) {
			mysql_query('update usrTags set tag_Text="'.mysql_real_escape_string($new_kwd_label).'"
			                           where tag_ID='.intval($kwd_id));
			$count += mysql_affected_rows();
		}
	}
	if ($count > 1)
		$tag_message .= '<div class="success">'.$count.' tags renamed</div>';
	else if ($count == 1)
		$tag_message .= '<div class="success">One tag renamed</div>';
	else
		$tag_message .= '<div class="failure">Error of some sort: ' . mysql_error() . '</div>';
}

if (@$_REQUEST['replace_kwd']) {
    
	mysql_connection_overwrite(DATABASE);
    
    $rquery = 'delete r1 FROM usrRecTagLinks AS r1 inner join usrRecTagLinks AS r2 on r1.rtl_RecID=r2.rtl_RecID and r2.rtl_TagID='
    .intval(@$_REQUEST['replace_with_kwd_id'])
    .' where r1.rtl_TagID='
    .intval($_REQUEST['replace_kwd_id']); 

    mysql_query($rquery);
    
	$rquery = 'update usrRecTagLinks set rtl_TagID = '
                    .intval(@$_REQUEST['replace_with_kwd_id'])
                    .' where rtl_TagID = '
                    .intval($_REQUEST['replace_kwd_id']);
    mysql_query($rquery);
	$tag_message .= '<div class="success">Tag replaced</div>';
}

if (@$_REQUEST['delete_multiple_kwds']) {

    $isok = false;
    if(is_array(@$_REQUEST['delete_kwds'])){
	    $kwd_ids = array_map('intval', array_keys(@$_REQUEST['delete_kwds']));
        $isok = (count($kwd_ids)>0);
    }
	if ($isok) {
		mysql_connection_overwrite(DATABASE);
		$res = mysql_query('delete usrTags, usrRecTagLinks from usrTags left join usrRecTagLinks on rtl_TagID = tag_ID where tag_ID in ('. join(', ', $kwd_ids) .') and tag_UGrpID='.get_user_id());
		$tag_message .= mysql_error() . '<div class="success">Tags deleted</div>';
	} else {
		$tag_message .= mysql_error() . '<div class="success">No tags deleted</div>';
	}
}

if (get_user_id() == 96) {
	mysql_connection_select(DATABASE);

	$user_hyperlinks_import = '<p>';
	if (@$_REQUEST['import_hyperlinks_user']) {
		$hls = mysql__select_array('usrHyperlinkFilter', 'hyf_String',
		                           'hyf_UGrpID='.intval(@$_REQUEST['import_hyperlinks_user']));
		if ($hls) {
			$insert_stmt = '';
			foreach ($hls as $hl) {
				if ($insert_stmt) $insert_stmt .= ', ';
				$insert_stmt .= '("'.mysql_real_escape_string($hl).'", get_user_id())';
			}
			$insert_stmt = 'insert into usrHyperlinkFilter (hyf_String, hyf_UGrpID) values ' . $insert_stmt;
			mysql_query($insert_stmt);
			$row_count = mysql_affected_rows();
		} else $row_count = 0;

		$user_hyperlinks_import .= '<span style="color: red; font-weight: bold;">';
		if ($row_count == 1)
			$user_hyperlinks_import .= 'One new hyperlink added.';
		else if ($row_count > 1)
			$user_hyperlinks_import .= $row_count . ' new hyperlinks added.';
		else
			$user_hyperlinks_import .= 'No new hyperlinks added.';
		$user_hyperlinks_import .= '</span>&nbsp;';
	}


	$user_hyperlinks_import .= '
  Import ignored hyperlinks from user:
  <select name="import_hyperlinks_user" onchange="form.submit();">
   <option value="">(select a user)</option>
';
	if (defined('HEURIST_USER_GROUP_ID')) {
		$usernames = mysql__select_assoc(USERS_DATABASE.'.sysUGrps usr left join '.USERS_DATABASE.'.sysUsrGrpLinks on ugl_UserID=usr.ugr_ID', 'usr.ugr_ID', 'usr.ugr_Name', 'ugl_GroupID='.HEURIST_USER_GROUP_ID.' and !usr.ugr_IsModelUser order by usr.ugr_Name');
	} else {
		$usernames = mysql__select_assoc(USERS_DATABASE.'.sysUGrps usr', 'usr.ugr_ID', 'usr.ugr_Name', '!usr.ugr_IsModelUser  order by usr.ugr_Name');
	}
	foreach ($usernames as $id => $name) {
		$user_hyperlinks_import .=
'   <option value="'.$id.'">'.escChars($name).'</option>';
	}

	$user_hyperlinks_import .= '</select></p>';
END;

} else	$user_hyperlinks_import = '';

mysql_connection_select(DATABASE);


/* Specify the template file containing the web page to be processed and displayed */
$template = file_get_contents('configureProfile.html');

$template = str_replace('{database}', HEURIST_DBNAME, $template);

if (! array_key_exists('body_only', $_REQUEST)) {
	/* Replaces the word {PageHeader} in the web page with the concatenation of the files specified */

	$template = str_replace('{PageHeader}', file_get_contents(dirname(__FILE__).'/../../common/html/simpleHeader.html'), $template);
} else {
	$template = str_replace('{PageHeader}', '', $template);
	$template = str_replace('<body ', '<body width=600 height=650 ', $template);
}

if (@$_REQUEST['tag_edit'])
	$template = str_replace('<body ', '<body class=tag_edit ', $template);
else if (@$_REQUEST['bookmark_import'])
	$template = str_replace('<body ', '<body class=bookmark_import ', $template);
$template = str_replace('{tag_edit}', @$_REQUEST['tag_edit'], $template);
$template = str_replace('{bookmark_import}', @$_REQUEST['bookmark_import'], $template);
$template = str_replace('{body_only}', (array_key_exists('body_only', $_REQUEST)? '<input type=hidden name=body_only>' : ''), $template);
$template = str_replace('{section}', @$_REQUEST['section'], $template);

mysql_connection_select(USERS_DATABASE);
$res = mysql_query('select ugr_MinHyperlinkWords from sysUGrps usr where usr.ugr_ID = '.get_user_id());
$row = mysql_fetch_row($res);
$word_limit = $row[0];	// minimum number of spaces that must appear in the link text
mysql_connection_select(DATABASE);

$word_limit_options =
'<option value="0" '.($word_limit==0? 'selected':'').'>any number of words</option>' .
'<option value="1" '.($word_limit==1? 'selected':'').'>at least one word</option>' .
'<option value="2" '.($word_limit==2? 'selected':'').'>at least two words</option>' .
'<option value="3" '.($word_limit==3? 'selected':'').'>at least three words</option>' .
'<option value="4" '.($word_limit==4? 'selected':'').'>at least four words</option>' .
'<option value="5" '.($word_limit==5? 'selected':'').'>at least five words</option>';
$template = str_replace('{word_limit_options}', $word_limit_options, $template);

$atags = mysql__select_array('usrHyperlinkFilter', 'hyf_String', 'hyf_UGrpID is null or hyf_UGrpID='.get_user_id());

if(is_array($atags) && count($atags)>0){
    $hyperlinks_ignored = '<div>'.implode("</div>\n<div>", $atags).'</div>';
}else{
    $hyperlinks_ignored = '<div/>';
}

$bookmarklet_script = dirname(__FILE__).'/../../import/bookmarklet/bookmarklet.js';
$template = str_replace('{hyperlinks_ignored}', $hyperlinks_ignored, $template);
if(file_exists($bookmarklet_script)){
$template = str_replace('{Bookmarklet}', file_get_contents($file), $template);
}

$res = mysql_query('select count(rtl_ID) as cnt from usrTags left join usrRecTagLinks on rtl_TagID=tag_ID where tag_UGrpID= ' . get_user_id() . ' group by tag_ID order by cnt desc, tag_Text limit 1');
$row = mysql_fetch_row($res);
$max_cnt = intval($row[0]);

if (@$_REQUEST['order_by_popularity']) {
	$res = mysql_query('select tag_ID, tag_Text, count(rtl_ID) as cnt from usrTags left join usrRecTagLinks on rtl_TagID=tag_ID where tag_UGrpID= ' . get_user_id() . ' group by tag_ID order by cnt desc, tag_Text');
} else {
	$res = mysql_query('select tag_ID, tag_Text, count(rtl_ID) as cnt from usrTags left join usrRecTagLinks on rtl_TagID=tag_ID where tag_UGrpID= ' . get_user_id() . ' group by tag_ID order by tag_Text');
}

$tagsCount = 0;
$foreach_kwd = $foreach_kwd_js = '';
while ($row = mysql_fetch_row($res)) {
	$foreach_kwd .=
        '<tr style="vertical-align:top;">
         <td nowrap>
          <input type="checkbox" style="vertical-align: middle;" name="delete_kwds['.$row[0].']">
          <img src="'.HEURIST_BASE_URL.'common/images/cross.png" onclick="delete_kwd('.$row[0]
                .',\''.escChars($row[1]).'\','.$row[2].')">
          <input type="text" class="textinput" name="kwdl['.$row[0].']" value="'.escChars($row[1]).'" onchange="rename_kwd('.$row[0].', this);">
         </td>
         <td nowrap style="padding-top: 4px;">' . $row[2] . '</td>
         <td class="u-cell">
          <div class="u" style="padding-top: 4px;" title="' . $row[2] . ' records"><div style="width: ' 
                . ($max_cnt>0?(intval($row[2]) / $max_cnt * 100):0) . '%;"></div></div>
         </td>
         <td class=search>'.($row[2] ? '<a target=_blank href="'.HEURIST_BASE_URL.'?w=bookmark&db='.HEURIST_DBNAME.'&q=tag:%22'.$row[1].'%22" title="View records with this tag" class="externalLink"></a>': '').'</td>
         <td class=replace style="padding-top: 4px;">'.($row[2] ? '<a href=# onclick="show_replace_list(this, '.$row[0].'); return false;">replace...</a>': '').'</td>
        </tr>';

	$foreach_kwd_js .= "kwd['".escChars(strtolower($row[1]))."'] = ".$row[0].";\n";
    $tagsCount++;
}
if($tagsCount==0){
    $foreach_kwd = '<h2>You have not defined any tags</h2>';
}else{
    $foreach_kwd_js .=  'tagsCount='.$tagsCount."\n";
}

$kwd_select = "<select id=kwd_select style=\"display: none;\"><option value=\"\" disabled selected>select tag...</option>";
$res = mysql_query('select tag_ID, tag_Text from usrTags where tag_UGrpID= ' . get_user_id() . ' order by tag_Text');
while ($row = mysql_fetch_row($res)) {
	$kwd_select .= "<option value=".$row[0].">".escChars($row[1])."</option>";
}
$kwd_select .= "</select>";

$sortby_button = @$_REQUEST['order_by_popularity']
	? '<input type="submit" class="button" value="Sort alphabetically" onclick="document.getElementById(\'sortby_input\').value = \'\';" style="float: right;">'
	: '<input type="submit" class="button" value="Sort by usage" onclick="document.getElementById(\'sortby_input\').value = \'order_by_popularity\';" style="float: right;">';
$sortby_input = @$_REQUEST['order_by_popularity']
	? '<input type="hidden" id="sortby_input" name="order_by_popularity" value="1">'
	: '<input type="hidden" id="sortby_input" name="order_by_popularity" value="">';

if($tag_message!=''){
    $tag_message = $tag_message.'<script>setTimeout(function(){document.getElementById("div-tag-message").style.display="none";},2000);</script>';
}    
    

$template = str_replace('{ForeachTag}', $foreach_kwd, $template);
$template = str_replace('{ForeachTagJs}', $foreach_kwd_js, $template);
$template = str_replace('{TagMessage}', $tag_message, $template);
$template = str_replace('{UserHyperlinksImport}', $user_hyperlinks_import, $template);
$template = str_replace('{sortby_button}', $sortby_button, $template);
$template = str_replace('{sortby_input}', $sortby_input, $template);
$template = str_replace('{kwd_select}', $kwd_select, $template);

/*
$template = str_replace('{resize_button}',
'<button class="button" value="resize" onclick="{if(typeof doDialogResize != 'undefined'    && doDialogResize.call && doDialogResize.apply) doDialogResize(500,700);}" style="float: right;">reize</button>', $template);
*/

echo($template);

function escChars($val){
    return htmlspecialchars(str_replace("'",'',$val));   //&#039;
}
?>
