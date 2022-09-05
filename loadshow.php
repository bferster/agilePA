<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config7.php');
	
	$id=$_GET['id'];											// Get ID
	$id=addEscapes($id);										// ID
	if (strlen($id) == 9) {										// Must be a key
		$id[0]=hexdec($id[0])&7;								// Get only 1st 3 bits of 1st char
		$query="SELECT * FROM qshow WHERE email = '$id'";		// Look for key in email
		$result=mysqli_query($link, $query);					// Run query
		if (($result == false) || (!mysqli_num_rows($result))) { // Not found
			$row=mysqli_fetch_assoc($result);					// Get row
			$oid=$id;											// Save original
			$nn=$id[0];											// Get shift order
			$id=substr($id,3);									// Trim order and student
			while ($nn-- > 0) 									// For each shift
				$id=substr($id,1,5).$id[0];						// Shift-left
			$id=intval($id);									// Number
			$query="SELECT * FROM qshow WHERE id = '$id'";		// Make query
			$result=mysqli_query($link, $query);				// Run query
			if (($result == false) || (!mysqli_num_rows($result))) // Error
				print("LoadShow({ \"qmfmsg\":\"error 1\"})");
			else{												// Good result
				$row=mysqli_fetch_assoc($result);				// Get row
				$script=$row["script"];							// Get script
				$title=$row["title"];							// Get title
				$query="INSERT INTO qshow (email, password, title, script, version) VALUES ('";
				$query.=addEscapes($oid)."','";
				$query.=addEscapes("none")."','";
				$query.=addEscapes($title)."','";
				$query.=addEscapes($script)."','";
				$query.=addEscapes(0)."')";
				$result=mysqli_query($link, $query);			// Run query
				if ($result == false)							// Bad save
					print("LoadShow({ \"qmfmsg\":\"error 2\"})");
				else
					$id=mysqli_insert_id($link);				// Get ID of new resource
				}
			}
		else													// Found it
			$id=$row["id"];										// Load this id
		}														// Key closure
	
	$query="SELECT * FROM qshow WHERE id = '$id'";				// Make query
	$result=mysqli_query($link, $query);						// Run query
	if (($result == false) || (!mysqli_num_rows($result)))		// Error
		print("LoadShow({ \"qmfmsg\":\"error 3\"})");			// Show it
	else{														// Good result
		$row=mysqli_fetch_assoc($result);						// Get row
		$p=$row["script"];										// Get script
		$p=substr($p,0,strlen($p)-3).",\"newId\":".$id."})";	// Add id
		print($p);												// Send script
		}
	mysqli_free_result($result);								// Free
	mysqli_close($link);										// Close session
		
	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=addslashes($str);									// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		return $str;
	}
	
?>