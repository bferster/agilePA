////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function MakeSelect(id, multi, items, sel, extra, values)				// CREATE HTML SELECT
{
	var	str="<select class='pa-is' id='"+id+"' ";							// Header
	str+="style='width:auto;height:22px'";									// Size
	if (extra)																// If extra param
		str+=extra;															// Add them
	if (multi)																// Multi select
		str+="multiple='multiple' size='"+multi+"'";						// Add flag
	str+=">";																// End header
	for (i=0;i<items.length;++i) {											// For each option
		str+="<option";														// Add tag
		if (sel == items[i])												// If selected
			str+=" selected='selected'"										// Add tag
		if (values && values[i])											// If has a value
			str+=" value='"+values[i]+"'";									// Add it
		str+=">"+items[i]+"</option>";										// End option
		}	
	return str+"</select>";													// Return element				
}

function ShortenString(str, len)										// SHORTEN A STRING TO LENGTH
{
	if (str && str.length > len)											// Too long
		str=str.substr(0,(len-3)/2)+"..."+str.slice((len-3)/-2);			// Shorten	
	return str;																// Return string
}

function TimecodeToSeconds(timecode) 									// CONVERT TIMECODE TO SECONDS
	{
		var h=0,m=0;
		var v=(""+timecode).split(":");										// Split by colons
		var s=v[0]															// Add them
		if (v.length == 2)													// Just minutes, seconds
			s=v[1],m=v[0];													// Add them
		else if (v.length == 3)												// Hours, minutes, seconds
			s=v[2],m=v[1],h=v[0];											// Add them
		return(Number(h*3600)+Number(m*60)+Number(s));						// Convert
	}

function SecondsToTimecode(secs) 										// CONVERT SECONDS TO TIMECODE
	{
		var str="",n;
		n=Math.floor(secs/3600);											// Get hours
		if (n) str+=n+":";													// Add to tc
		n=Math.floor(secs/60);												// Get mins
		if (n < 10) str+="0";												// Add leading 0
		str+=n+":";															// Add to tc
		n=Math.floor(secs%60);												// Get secs
		if (n < 10) str+="0";												// Add leading 0
		str+=n;																// Add to tc
		return str;															// Return timecode			
	}	

function PopUp(msg, time, div)											// TIMED POPUP
{
	var str="";
	$("#popupDiv").remove();												// Kill old one, if any
	str+="<div id='popupDiv' class='pa-popup'>"; 							// Add div
	if (time == -1) {														// If has close but
		time=100000;														// Increase time
		str+="<img id='pu-close' src='img/closedot.gif' style='float:right;cursor:pointer'>";	// Add close button
		}
	str+=msg+"</div>"; 														// Add div
	$(div ? "#"+div : "body").append(str);									// Add popup to div or body
	$("#pu-close").click(function() { $("#popupDiv").remove(); });			// Remove on click of close but
	$("#popupDiv").fadeIn(500).delay(time ? time : 2000).fadeOut(500)		// Animate in and out		
}

function DialogBox(title, content, x, y, width, callback, callback2) 	// DIALOG BOX
{
	$("#dialogDiv").remove();												// Kill old one, if any
	var str="<div id='dialogDiv' class='pa-meta' style='width:"+width+"px'>"; // Add div
	str+="<span class='pa-bodyTitle'>"+title+"</span><br><br>"+content+"<br><br>";	// Content	
	str+="<div style='float:right'>"										// Div to hold buttons
	str+="<div id='okBut' class='pa-bs'>OK</div>&nbsp";						// OK Button
	str+="<div id='cancelBut' class='pa-bs'>Cancel</div></div";				// Cancel
	$("body").append(str+"</div>");											// Add popup
	$("#dialogDiv").offset({ left:x, top:y} );								// Position popup

	$("#okBut").on("click",function() {										// CLICK ON OK
		if (callback)														// If an ok callback spec'd
			callback();														// Run it
		$("#dialogDiv").remove();											// Kill dialog
		});

	$("#cancelBut").on("click",function() {									// CLICK ON CANCEL
		if (callback2)														// If a cancel callback spec'd
			callback2();													// Run it
		$("#dialogDiv").remove();											// Kill dialog
		});
}	

function AddEscapes(str) 												// ESCAPE TEXT STRING
{	
	if (str) {																// If a string
		str=""+str;															// Force as string
		str=str.replace(/"/g,"\\\"");										// " to \"
		str=str.replace(/'/g,"\\\'");										// ' to \'
		}
	return str;																// Return escaped string
	}

function ConvertFromGoogleDrive(url)									// CONVERT GOOGLE DRIVE LINK TO DIRECT LINK
{
	if (url && url.match(/drive\.google/i)) {								// A google drive image
		var id=url.match(/\?id=(.+)/i);										// Extract id
		if (!id)															// Nothing there
			id=url.match(/\/d\/(.*?)\//);									// Try this way
		if (id)																// An id found
			url="//drive.google.com/uc?export=view&id="+id[1];				// Construct 'direct' link
		}
	return url;																// Return link
}

function trace(msg, p1, p2, p3, p4)										// CONSOLE 
{
	
	if (p4 != undefined)
		console.log(msg,p1,p2,p3,p4);
	else if (p3 != undefined)
		console.log(msg,p1,p2,p3);
	else if (p2 != undefined)
		console.log(msg,p1,p2);
	else if (p1 != undefined)
		console.log(msg,p1);
	else
		console.log(msg);
}

function mtrace(msg)													// MOBILE TRACE
{
	$("#scriptTextDiv").text(msg);
}

function Sound(sound, mute)												// PLAY SOUND
{
	var snd=new Audio();													// Init audio object
	if (!snd.canPlayType("audio/mpeg") || (snd.canPlayType("audio/mpeg") == "maybe")) 
		snd=new Audio("img/"+sound+".ogg");									// Use ogg
	else	
		snd=new Audio("img/"+sound+".mp3");									// Use mp3
	if (!mute)	{															// If not initing or muting	
		snd.volume=50/100;													// Set volume
		snd.play();															// Play it
		}
	}

function LoadingIcon(mode, size, container)									// SHOW/HIDE LOADING ICON		
{
	container=container ? "#"+container: "#bodyDiv";							// If no container spec'd, use dialog
	if (!mode) {																// If hiding
		$("#sf-loadingIcon").remove();											// Remove it
		return;																	// Quit
		}
	var str="<img src='img/loading.gif' width='"+size+"' ";						// Img
	str+="id='sf-loadingIcon' style='position:absolute;top:calc(50% - "+size/2+"px);left:calc(50% - "+size/2+"px);z-index:5000'>";	
	$(container).append(str);														// Add icon to container
}

function SetCookie(cname, cvalue, exdays)								// SET COOKIE
{
	var d=new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function GetCookie(cname) 												// GET COOKIE
	{
	var name=cname+"=",c;
	var ca=document.cookie.split(';');
	for (var i=0;i<ca.length;i++)  {
	  c=ca[i].trim();
	  if (c.indexOf(name) == 0) 
		  return c.substring(name.length,c.length);
	  }
	return "";
}

function ConfirmBox(callback, msg)												// CONFIRMATION BOX
{
	Sound("ding");																// Ding sound
	$("#popupDiv").remove();													// Kill old one, if any
	var str="<div id='popupDiv' class='pa-popup' style='width:250px'>"; 		// Add div
	str+="<br><span class='pa-bodyTitle'>Are you sure?</span>"; 				// Add content
	if (msg) str+="<br><br>"+msg;												// Add submessage
	str+="<br><br><div id='confirmOK' class='pa-greenbs'>OK</div>&nbsp;&nbsp;";	// OK
	str+="<div id='confirmCancel' class='pa-bs'>Cancel</div><br><br></div>";	// Cancel
	$("body").append(str);														// Add popup to div or body
	$("#popupDiv").fadeIn(500);													// Animate in and out		

	$("#confirmOK").on("click", function() {									// ON OK BUT
			$("#popupDiv").remove();											// Kill div
			if (callback)	callback();											// If callback defines, run it
			});

	$("#confirmCancel").on("click", function() {								// ON cancel BUT
			$("#popupDiv").remove();											// Kill div
			Sound("delete");													// Delete sound
		});
}
