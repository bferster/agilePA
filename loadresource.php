<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config7.php');
	
	$id=$_GET['id'];												// Get ID
	$i=$id=addEscapes($id);											// ID
	$end=$id+100;
	for ($id=$i;$id<$end;$id++) {
		$query="SELECT * FROM resource WHERE id = '$id'";			// Make query
		$result=mysqli_query($link, $query);						// Run query
		if (($result == false) || (!mysqli_num_rows($result)))		// Error
				print("Error:".$id);
		else{														// Good result
			$row=mysqli_fetch_assoc($result);						// Get row
			$check_url_status = check_url($row["src"]);
			if ($check_url_status != '200') {						// Bad link
				$query="DELETE FROM resource WHERE id = '$id'";		// Make query
				$result=mysqli_query($link, $query);				// Run query
				print($id."  DELETED");
			}
		}	
	}
	mysqli_free_result($result);									// Free
	mysqli_close($link);											// Close session
	
	function addEscapes($str)										// ESCAPE ENTRIES
	{
		if (!$str)													// If nothing
			return $str;											// Quit
		$str=addslashes($str);										// Add slashes
		$str=str_replace("\r","",$str);								// No crs
		return $str;
	}

	function check_url($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, 1);
		curl_setopt($ch , CURLOPT_RETURNTRANSFER, 1);
		$data = curl_exec($ch);
		$headers = curl_getinfo($ch);
		curl_close($ch);
		return $headers['http_code'];
	}	

?>