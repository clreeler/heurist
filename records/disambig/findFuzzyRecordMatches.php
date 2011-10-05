<?php

/**
 * filename, brief description, date of creation, by whom
 * @copyright (C) 2005-2010 University of Sydney Digital Innovation Unit.
 * @link: http://HeuristScholar.org
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 * @package Heurist academic knowledge management system
 * @todo
 **/

?>

<?php

function findFuzzyMatches($fields, $rec_types, $rec_id=NULL, $fuzziness=NULL) {

	if (! $fuzziness) $fuzziness = 0.5;

	// Get some data about the matching data for the given record type
	$types = mysql__select_assoc('defRecStructure left join defDetailTypes on rst_DetailTypeID=dty_ID',
								'dty_ID', 'dty_Type', 'rst_RecTypeID=' . $rec_types[0] .
														' and rst_RecordMatchOrder or rst_DetailTypeID='.DT_TITLE);
	$fuzzyFields = array();
	$strictFields = array();
	foreach ($fields as $key => $vals) {
		if (! preg_match('/^t:(\d+)/', $key, $matches)) continue;
		$rdt_id = $matches[1];

		if (! @$types[$rdt_id]) continue;
		if (! $vals) continue;

		switch ($types[$rdt_id]) {
			case "blocktext": case "freetext": case "urlinclude":
			foreach ($vals as $val)
				if (trim($val)) array_push($fuzzyFields, array($rdt_id, trim($val)));
			break;

			case "integer": case "float":
			case "date": case "year": case "file":
			case "enum": case "boolean":
			case "relationtype": case "resource":
			foreach ($vals as $val)
				if (trim($val)) array_push($strictFields, array($rdt_id, trim($val)));
			break;

			case "separator":	// this should never happen since separators are not saved as details, skip if it does
			case "relmarker": // saw seems like relmarkers are external to the record and should not be part of matching
			case "fieldsetmarker":
			case "calculated":
			default:
			continue;
		}
	}
	if (count($fuzzyFields) == 0  &&  count($strictFields) == 0) return;

	$groups = get_group_ids();
	if(is_logged_in()){
		array_push($group,get_user_id());
		array_push($group,0);
	}
	$groups = join(",",$groups);
	$tables = "records";
	$predicates = "rec_RecTypeID=$rec_types[0] and ! rec_FlagTemporary and (rec_OwnerUGrpID in ($groups) or not rec_NonOwnerVisibility='hidden')" . ($rec_id ? " and rec_ID != $rec_id" : "");
	$N = 0;
	foreach ($fuzzyFields as $field) {
		list($rdt_id, $val) = $field;
		$threshold = intval((strlen($val)+1) * $fuzziness);

		++$N;
		$tables .= ", recDetails bd$N";
		$predicates .= " and (bd$N.dtl_RecID=rec_ID and bd$N.dtl_DetailTypeID=$rdt_id and limited_levenshtein(bd$N.dtl_Value, '".addslashes($val)."', $threshold) is not null)";
	}
	foreach ($strictFields as $field) {
		list($rdt_id, $val) = $field;

		++$N;
		$tables .= ", recDetails bd$N";
		$predicates .= " and (bd$N.dtl_RecID=rec_ID and bd$N.dtl_DetailTypeID=$rdt_id and bd$N.dtl_Value = '".addslashes($val)."')";
	}

	$matches = array();
	$res = mysql_query("select rec_ID as id, rec_Title as title, rec_Hash as hhash from $tables where $predicates order by rec_Title limit 100");
	error_log("approx-matching: select rec_ID as id, rec_Title as title, rec_Hash as hhash from $tables where $predicates order by rec_Title limit 100");
	while ($bib = mysql_fetch_assoc($res)) {
		array_push($matches, $bib);
	}

	return $matches;
}

?>
