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
* Render Contributor page
*
* It loads wml file (specified in detail) and applies 2 xsl
*
* @author      Artem Osmakov   <artem.osmakov@sydney.edu.au>
* @copyright   (C) 2005-2013 University of Sydney
* @link        http://sydney.edu.au/heurist
* @version     3.1.0
* @license     http://www.gnu.org/licenses/gpl-3.0.txt GNU License 3.0
* @package     Heurist academic knowledge management system
* @subpackage  applications
*/
?>
<div id="subject-list">
<?php
	$val = $record->getDet(DT_DESCRIPTION);
	if($val){
		print '<p>'.$val.'</p>';
	}
	$val = $record->getDet(DT_CONTRIBUTOR_LINK);
	if($val){
		print '<p>Click <a target="_blank" href="'.$val.'">here</a> to visit this contributor.</p>';
	}

	makeSubjectItem( $record->getRelationRecordByType(RT_ENTRY) );

	makeSubjectItem( $record->getRelationRecordByType(RT_MEDIA, 'image') );
	makeSubjectItem( $record->getRelationRecordByType(RT_TILEDIMAGE, 'image') );
	makeSubjectItem( $record->getRelationRecordByType(RT_MEDIA, 'audio') );
	makeSubjectItem( $record->getRelationRecordByType(RT_MEDIA, 'video') );
?>
</div>