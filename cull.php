<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
	
	$num=300;
	$id=$_GET['id'];												// Get ID
	$i=$id=addEscapes($id);											// ID
	if ($_GET['num'])												// If num				
		$num=addEscapes($_GET['num']);								// Get num
	$end=$id+$num;													// Set end
	for ($id=$i;$id<$end;$id++) {									// For each record
		$query="SELECT * FROM resource WHERE id = '$id'";			// Make query
		$result=mysql_query($query);								// Run query
		if (($result == false) || (!mysql_numrows($result)))		// Error
				print(".");
		else{														// Good result
			$check_url_status = check_url(mysql_result($result,0,"src"));
			if ($check_url_status != '200') {						// Bad link
				$query="DELETE FROM resource WHERE id = '$id'";		// Make query
				mysql_query($query);								// Run query
				print($id." - <a target='_blank' href='".mysql_result($result,0,"src")."'>".mysql_result($result,0,"src")."</a><br>");
				}
			}	
		}
		mysql_close();												// Close


	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=addslashes($str);									// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		return $str;
	}

	function check_url($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_NOBODY, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		curl_setopt($ch , CURLOPT_RETURNTRANSFER, 1);
		$data = curl_exec($ch);
		$headers = curl_getinfo($ch);
		curl_close($ch);

		return $headers['http_code'];
	}	

?>