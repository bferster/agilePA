<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
header("Access-Control-Allow-Origin: *");
require_once('config7.php');
			
	$ver=0;
	$email="";
	if (isSet($_GET['ver'])) 		 							// If set
		$ver=addslashes($_GET['ver']);							// Get deleted
	if (isSet($_GET['email'])) 		 							// If set
		$email=addslashes($_GET['email']);						// Get email
	$query="SELECT * FROM qshow WHERE version = '$ver'";		// Query start
	if ($email)
		$query.=" AND LOWER(email) = '".strtolower($email)."'";	// WHERE email search
	$query.=" ORDER by date DESC";								// Sort
	$result=mysqli_query($link, $query);						// Run query
	if ($result == false) {										// Bad query
		print("-1\n");											// Return error
		mysqli_close($link);									// Close session
		exit();													// Quit
		}
	$num=mysqli_num_rows($result);								// Get num rows
	print("qmfListFiles([\n");									// Function
	for ($i=0;$i<$num;$i++) {									// For each row
		$row=mysqli_fetch_assoc($result);						// Get row
		print("{\"id\":\"".$row["id"]."\",");					// Id
		print("\"title\":\"".$row["title"]."\",");				// Title
		print("\"email\":\"".$row["email"]."\",");				// Email
		print("\"date\":\"".$row["date"]."\"}");				// Date
		if ($i != $num-1)	print(",\n");						// Comma
		}		
	print("\n])");												// Close function
	mysqli_free_result($result);								// Free
	mysqli_close($link);										// Close session
																// Close session
?>
