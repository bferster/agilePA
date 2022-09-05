<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config7.php');
	
	$q="";	$era="";
	if (isSet($_GET['q'])) 		 									// If set
		$q=addEscapes($_GET['q']);												
	if (isSet($_GET['era'])) 		 								// If set
		$era=addEscapes($_GET['era']);												
	$query="SELECT * FROM resource WHERE ";							// Make query
	$str="GetPaRes([";												// Function
	if ($q) {														// If q spec'd
		$query.="(title LIKE '%$q%' ";								
		$query.="OR who LIKE '%$q%' OR what LIKE '%$q%')";
		}
	if ($era && $q)													// If both
		$query.=" AND ";											// Add AND
	if ($era)														// If era spec'd
		$query.="era = '$era'";										// Match it
	$query.=" LIMIT 1000";											// Limit
	$result=mysqli_query($link, $query);							// Run query
	if (($result != false) && (mysqli_num_rows($result)))	{		// No Error
		$num=mysqli_num_rows($result);								// Get num rows
		for ($i=0;$i<$num;$i++) {									// For each row
			$row=mysqli_fetch_assoc($result);						// Get row
			$str.="{id:\"".addEscapes($row["id"])."\",";			// Id
			$str.="title:\"".addEscapes($row["title"])."\",";		// Title
			$str.="desc:\"".addEscapes($row["who"])." ";			// Who
			$str.=addslashes($row["what"])."\",";					// What
			$str.="src:\"".addEscapes($row["src"])."\",";			// Src
			$str.="link:\"".addEscapes($row["link"])."\",";			// Link
			$str.="std:\"".addEscapes($row["standard"])."\","; 		// Std
			$str.="era:\"".addEscapes($row["era"])."\"";			// Era
			$str.="}";
			if ($i != $num-1)										// Not last one
				$str.=",";											// Add comma
			}
		mysqli_free_result($result);								// Free
		}
	print($str."])");												// Print JSONP	
	mysqli_close($link);											// Close session

	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=addslashes($str);									// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		$str=str_replace("\n","",$str);							// No lfs
		return $str;
	}
?>
