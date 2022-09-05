///////////////////////////////////////////////////////////////////////////////////////////////
//  QMEDIA FILE SYSTEM
//
//	Dependencies:
//  img/logo64.gif, img/overlay.png
//	Draw(), Popup(), doc.DecodeKey() (for PA only)
//  SaveShow.php, LoadShow.php, ListShow.php, config.php
//
///////////////////////////////////////////////////////////////////////////////////////////////
		
	function QmediaFile(host, version) 										// CONSTRUCTOR
	{
		this.host=host;															// Get host
		this.version=version;													// Get version
		this.email=this.GetCookie("email");										// Get email from cookie
		this.curFile="";														// Current file
		this.password=this.GetCookie("password");								// Password
		var style=document.createElement("style");	style.type="text/css";		// Create  style
		this.is="border-radius:10px;padding:1px 8px 0 8px;border:1px solid #999;font-size:12px;height:20px;width:200px;";
		this.bs="display:inline-block;border-radius:10px;padding:1px 8px 0 8px;background-color:#ccc;color:#333;border:1px solid #999;font-size:12px;height:16px;cursor:pointer;width:50px;text-align:center;";
	}
	
	QmediaFile.prototype.LogIn=function(callback) 							//	LOGIN DIALOG
	{
		var _this=this;															// Save context
		var str="<br/>Type your email address in the box below."
		str+="<br><br><div style='text-align:center'>";							// Center	
		str+="<b>Email:&nbsp;&nbsp</b> <input style='"+this.is+"' type='text' id='email' value='"+this.email+"'/>";
		str+="</div><br><div style='text-align:right'><br>";					// Right justify	
		str+="<div style='"+this.bs+"' id='logBut'>Login</div>&nbsp;&nbsp;";	// OK but
		str+="<div style='"+this.bs+"' id='cancelBut'>Cancel</div></div>";		// Cancel but
		this.ShowLightBox("Login",str);
		
		$("#cancelBut").on("click", function() {								// CANCEL BUTTON
			$("#lightBoxDiv").remove();											// Close
			if (callback) callback(false);										// Run callback 
			});
	
		$("#logBut").on("click",function() {									// LOGIN BUTTON
			_this.email=$("#email").val();										// Get current email
			_this.SetCookie("email",_this.email,7);								// Save cookie
			$("#lightBoxDiv").remove();											// Close
			if (callback) callback(true);										// Run callback
			});
	}	

	QmediaFile.prototype.Load=function() 									//	LOAD FILE DIALOG
	{
		var _this=this;															// Save context
		var str="<br/>To load one of your projects, type your email address in the box below."
		str+="<br><br><div style='text-align:center'>";							// Center	
		str+="<b>Email:&nbsp;&nbsp</b> <input style='"+this.is+"' type='text' id='email' value='"+this.email+"'/>";
		str+="</div><br><div style='text-align:right'><br>";					// Right justify	
		str+="<div style='"+this.bs+"' id='logBut'>Login</div>&nbsp;&nbsp;";	// OK but
		str+="<div style='"+this.bs+"' id='cancelBut'>Cancel</div></div>";		// Cancel but
		this.ShowLightBox("Login",str);
		
		$("#cancelBut").on("click", function() {								// CANCEL BUTTON
			$("#lightBoxDiv").remove();											// Close
			});
	
		$("#logBut").on("click",function() {									// LOGIN BUTTON
			_this.ListFiles();													// Get list of files
			});
	}	

	QmediaFile.prototype.Save=function() 									//	SAVE FILE TO DB
		{	
		if ((this.password == "undefined" | this.password == undefined))		// No password
			this.password="";													// Null it out
		var str="<br/>To save your project, type your email address in the box below. Type in a password if you want to protect it."
		str+="<br/><blockquote><table cellspacing=0 cellpadding=0 style='font-size:11px'>";
		str+="<tr><td><b>Email</b><span style='color:#990000'> * </span>&nbsp;</td><td><input style='"+this.is+"' type='text' id='email' value='"+this.email+"'/></td></tr>";
		str+="<tr><td><b>Password&nbsp;&nbsp;</b><span style='color:#990000'></span></b></td><td><input style='"+this.is+"' type='password' id='password' value='"+this.password+"'/></td></tr>";
		if (this.curFile) {														// If a project loaded, as for save as...
			str+="<tr><td colspan='2'>&nbsp;</td></tr>";
			str+="<tr><td colspan='2'><input type='radio' name='rgrp' checked>";
			str+="Save to current project - (Id: "+this.curFile+")<td><tr>";
			str+="<tr><td colspan='2'><input type='radio' id='saveNew' name='rgrp'";
			str+=">Create a fresh project</td></tr>";
			}
		str+="</table></blockquote><div style='font-size:12px;text-align:right'><br>";	
		str+="<div style='"+this.bs+"' id='saveBut'>Save</div>&nbsp;&nbsp;";	// Save but
		str+="<div style='"+this.bs+"' id='cancelBut'>Cancel</div>";			// Cancel but
		this.ShowLightBox("Save your project",str);								// Show dialog
		var _this=this;															// Save context
		
		$("#saveBut").on("click",function() {									// SAVE BUTTON
			_this.password=$("#password").val();								// Get current password
			if (_this.password)													// If a password
				_this.password=_this.password.replace(/#/g,"@");				// #'s are a no-no, replace with @'s	
			_this.email=$("#email").val();										// Get current email
			if (!_this.email) 													// Missing email
				 return _this.LightBoxAlert("Need email");						// Quit with alert
			_this.SetCookie("password",_this.password,7);						// Save cookie
			_this.SetCookie("email",_this.email,7);								// Save cookie
			_this.SaveFile(_this.email,_this.password);							// Save to server
			});
	
		$("#cancelBut").on("click", function() {								// CANCEL BUTTON
			$("#lightBoxDiv").remove();											// Close
			});
	}
	
	QmediaFile.prototype.SaveFile=function(email, password) 				//	SAVE A FILE TO DB
	{
		var dat={};
		var _this=this;															// Save context
		var url=this.host+"saveshow.php";										// Base file
		if ($("#saveNew").prop("checked"))										// Save as
			this.curFile="";													// Force saving to a new file
		dat["id"]=this.curFile;													// Add id
		dat["email"]=email;														// Add email
		dat["password"]=password;												// Add password
		dat["ver"]=this.version;												// Add version
		var title=curJson.title.replace(/\'/g,"");								// Remove apostrophes
		dat["title"]=AddEscapes(title);											// Add title
		dat["private"]=0;														// Add private
		dat["script"]="LoadShow("+JSON.stringify(curJson,null,'\t')+")";		// Add jsonp-wrapped script
		$("#lightBoxDiv").remove();												// Close
		$.ajax({ url:url,dataType:'text',type:"POST",crossDomain:true,data:dat,  // Post data
			success:function(d) { 			
				if (d == -1) 													// Error
					 AlertBox("Error","Sorry, there was an error saving that project (1)");		
				else if (d == -2) 												// Error
					 AlertBox("Error","Sorry, there was an error saving that project (2)");		
				else if (d == -3) 												// Error
					 AlertBox("Wrong password","Sorry, the password for this project<br>does not match the one you supplied");	
				 else if (d == -4) 												// Error
					 AlertBox("Error","Sorry, there was an error updating that project (4)");		
				 else if (!isNaN(d)){											// Success if a number
					_this.curFile=d.trim();										// Set current file
					_this.Sound("ding");										// Ding
					PopUp("<span style='color:#009900'<b>Saved!</b></span>",100);	// Saved!
					Draw();														// Redraw menu
					}
				},
			error:function(xhr,status,error) { trace(error) },					// Show error
			});		
	
			function AlertBox(title, content) {									// ALERT BOX
				_this.Sound("delete");											// Delete sound
				var str="<span style='color:#990000'><b>"+title+"</b></span><br><br>";
				str+=content+"<br>";
				PopUp(str,4000); 
				}
	}

	QmediaFile.prototype.LoadFile=function(id, dontSetId) 					//	LOAD A FILE FROM DB
	{
		id=id.substr(3);														// Strip off prefix
		$("#lightBoxDiv").remove();												// Close
		var url=this.host+"loadshow.php";										// Base file
		url+="?id="+id;															// Add id
		if ((""+id.length) == 9)												// A key
			id=doc.DecodeKey(id);												// Get real id
		if (!dontSetId)															// Unless told otherwise
			this.curFile=id;													// Set as current file
		$.ajax({ url:url, dataType:'jsonp'});									// Get data and pass to LoadProject() in Edit
	}	
		
	QmediaFile.prototype.ListFiles=function() 								//	LIST PROJECTS IN DB
	{
		var _this=this;															// Save context
		this.email=$("#email").val();											// Get current email
		this.SetCookie("email",this.email,7);									// Save cookie
		var url=this.host+"listshow.php?ver="+this.version+"&deleted=0";		// Base file
		if (this.email)															// If email
			url+="&email="+this.email;											// Add email and deleted to query line
		$.ajax({ url:url, success:function(files) {								// Get file list
			files=files.substr(14,files.length-15);								// Remove jsonp part
			files=$.parseJSON(files);											// Objectify
			var trsty=" style='height:20px;cursor:pointer' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' ";
			trsty+="onMouseOut='this.style.backgroundColor=\"#f8f8f8\"'";
			_this.email=$("#email").val();										// Get current email
			_this.SetCookie("email",_this.email,7);								// Save cookie
			$("#lightBoxDiv").remove();											// Close old one
			str="<br>Choose project from the list below:<br>";					// Title
			str+="<br><div style='width:100%;max-height:300px;overflow-y:auto'>";	// Scrolling div
			str+="<table style='font-size:12px;width:100%;padding:0px;border-collapse:collapse;'>";
			str+="<tr></td><td><b>Title </b></td><td><b>Date&nbsp;&&nbsp;time</b></td><td style='float:right'><b> Project ID</b></tr>";
			str+="<tr><td colspan='3'><hr></td></tr>";
			for (var i=0;i<files.length;++i) 									// For each file
				str+="<tr id='qmf"+files[i].id+"' "+trsty+"><td>"+ShortenString(files[i].title,30)+"</td><td>"+files[i].date.substr(5,11)+"</td><td align=right>"+files[i].id+"</td></tr>";
			str+="</table><br><div style='"+_this.bs+"float:right' id='cancelBut'>Cancel</div>";	// Cancel but
			_this.ShowLightBox("Load a project",str);								// Show lightbox

			for (var i=0;i<files.length;++i)									// For each file
				$("#qmf"+files[i].id).on("click", function(e) {					// ON CLICK
					_this.LoadFile(e.currentTarget.id);							// Load
					});

			$("#cancelBut").on("click", function() {							// CANCEL BUTTON
				$("#lightBoxDiv").remove();										// Close
				});
			_this.Sound('click'); 												// Click sound
			}
		});	
	}
	
///////////////////////////////////////////////////////////////////////////////////////////////
//  HELPERS
///////////////////////////////////////////////////////////////////////////////////////////////
	
	QmediaFile.prototype.SetCookie=function(cname, cvalue, exdays)			// SET COOKIE
	{
		var d=new Date();
		d.setTime(d.getTime()+(exdays*24*60*60*1000));
		var expires = "expires="+d.toGMTString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}
	
	QmediaFile.prototype.GetCookie=function(cname) {						// GET COOKIE
		var name=cname+"=",c;
		var ca=document.cookie.split(';');
		for (var i=0;i<ca.length;i++)  {
		  c=ca[i].trim();
		  if (c.indexOf(name) == 0) 
		  	return c.substring(name.length,c.length);
		  }
		return "";
	}

	QmediaFile.prototype.ShowLightBox=function(title, content)				// LIGHTBOX
	{
		var str="<div id='lightBoxDiv' style='position:fixed;width:100%;height:100%;";	
		str+="background:url(img/overlay.png) repeat;top:0px;left:0px';</div>";
		$("body").append(str);														
		var	width=500;
		var x=$("#lightBoxDiv").width()/2-250;
		var y=$("#lightBoxDiv").height()/2-200;
		if (this.xPos != undefined)
			x=this.xPos;
		str="<div id='lightBoxIntDiv' class='unselectable' style='position:absolute;padding:16px;width:400px;font-size:12px";
		str+=";border-radius:12px;z-index:2003;"
		str+="border:1px solid; left:"+x+"px;top:"+y+"px;background-color:#f8f8f8'>";
		str+="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span id='lightBoxTitle' style='font-size:18px;text-shadow:1px 1px #ccc'><b>"+title+"</b></span>";
		str+="<div id='lightContentDiv'>"+content+"</div>";					
		$("#lightBoxDiv").append(str);	
		$("#lightBoxDiv").css("z-index",2500);						
	}
	
	QmediaFile.prototype.LightBoxAlert=function(msg) 						//	SHOW LIGHTBOX ALERT
	{
		this.Sound("delete");													// Delete sound
		$("#lightBoxTitle").html("<span style='color:#990000'>"+msg+"</span>");	// Put new
	}
	
	QmediaFile.prototype.Sound=function(sound, mute) 						//	PLAY SOUND
	{
		var snd=new Audio();													// Init audio object
		snd=new Audio("img/"+sound+".mp3");										// Use mp3
		if (!mute)	{															// If not initing or muting	
			snd.volume=50/100;													// Set volume
			snd.play();															// Play it
			}
		}
