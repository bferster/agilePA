////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ROSTER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class CRoster {

	constructor() 														// CONSTRUCTOR
	{
		this.title="";														// Class title
		this.assigns=[];													// List of assignments
		this.roster=[];														// Roster
	}

Draw() 																	// UPDATE 
{
	var i,o;
	
let title="New"
var x=$("#bodyDiv").offset().left+560;								// Left
	var str="<p class='pa-bodyTitle'>Edit class";						// Title
	str+="<span class='pa-proTitle' id='classTitleTitle'> "+title+"</span>"; // Add show name
	str+="<span style='float:right'>";
	str+=MakeSelect("classOptions",false,["Class options","New","Load","Save"]);
	str+="&nbsp;&nbsp;<img src='img/helpicon.gif' style='cursor:pointer;vertical-align:-5px' onclick='ShowHelp(\"assign\")'></span></p>"; 
	str+="<table style='display:inline-block;padding-bottom:8px'>";	
	str+="<tr><td>Class name&nbsp;&nbsp;</td><td><input id='classTitle' class='pa-is' value='"+this.title+"'></input></td></tr>";
	str+="<tr><td>Assign to all&nbsp;&nbsp;</td><td>"+MakeSelect("classAssigns",false,["Choose assignment"],"")+"</td></tr>";
	str+="</table><br><br><hr style='margin-top:-8px'><p><span class='pa-bodyTitle'>Students</span><br>";	// Title
	str+="</span></p><div id='classAssets' style='height:400px' class='pa-dialogResults'></div>";	// Scrollable container
	str+="<span id='classAdd' style='margin-top:8px' class='pa-greenbs'>Add student(s) to class</span>";		// Find
	$("#bodyDiv").html(str);
	this.DrawClass();													// Fill in class

	if (myEmail) {														// If an email set
		$.ajax({ url: "//viseyes.org/pa/findshows.php",					// GET ASSIGNMENTS FROM DB
				data: { email: myEmail, ver:1 },						// Query
				success: (res)=> {										// When loaded
				this.assigns=[];										// Start fresh
				$("#classAssigns").empty();								// Clear select
				$("#classAssigns").append("<option>Choose assignment</option>");	// Add title
				res=$.parseJSON(res);									// Objectify
				for (var i=0;i<res.length;++i) {						// For each assignment
					var opt=ShortenString(res[i].id+" - "+res[i].title,48);	// Make options
					this.assigns.push(opt);								// Add assignment id
					$("#classAssigns").append("<option>"+opt+"</option>");	// Add to pulldown
					}
				this.DrawClass();										// Fill in class
				}
			});
		}
	else $("#classAssigns").append("<option>49 - Demo Civil Rights</option>");	// Add demo

	$("#classAdd").on("click", ()=> { this.EditStudent(-1); });			// ON ADD STUDENT

	$("#classTitle").on("change", ()=> {								// ON TITLE CHANGE
		this.title=$("#classTitle").val();								// Set 
		this.titleChanged=true;											// Changed the title
		});
		
	$("#classAssigns").on("change", ()=> {								// ON ASSIGNMENT CHANGE
		var i;
		var a=$("#classAssigns").val();									// Get assignment 
		if (a == "Choose assignment")									// No pick
			return;														// Quit
		this.assign=a.match(/\d+/);										// Extract id
		for (i=0;i<this.roster.length;++i) 								// For each show
		this.roster[i].assign=this.assign;								// Set assignment
		$("#classAssigns").val("Choose assignment");					// Restore menu
		this.DrawClass();												// Draw roster
		});

	$("#classOptions").on("change", ()=> {								// ON OPTIONS CHANGE
		var opt=$("#classOptions").val();								// Current option
		if (opt == "New") 												// New show
			ConfirmBox(()=> {											// Confirm 
				this.title="";	 this.roster=[]; 	this.assigns=[];	// Defaults
				this.Draw();											// Redraw
				});
		else if (opt == "Load")	ConfirmBox(()=> { this.Load(); });		// Confirm and load
		else if (opt == "Save")	this.Save();							// Save show
		$("#classOptions").val("Class options");						// Restore pulldown
		});
}
	
Save()																// SAVE CLASS
{
	let o={ title:this.title, email:myEmail };							// Set data
	o.roster=$.parseJSON(JSON.stringify(this.roster)); 					// Clone roster
	o.assigns=$.parseJSON(JSON.stringify(this.roster)); 				// Clone assigns
}

Load()																// LOAD CLASS
{
	this.Draw();													// Redraw
}


DrawClass() 														// UPDATE CLASS
{
	var i,o;
	var str="<table style='width:100%'><tr style='font-weight:bold'><td>Name</td><td>Assignment</td><td>Link</td><td></td><td></td></tr>";
	str+="<tr><td colspan='5'><hr></td</tr>";
	for (i=0;i<this.roster.length;++i) {								// For each show
		o=this.roster[i];												// Point at it
		if (!o.name)	continue;										// Skip over no-names
		str+="<tr id='classRow-"+o.id+"' class='pa-listItem selectable'><td><b>"+ShortenString(o.name,30);	// Name
		str+="</b></td><td>"+this.GetAssignmentName(o.assign);			// Assignment
//		key=this.EncodeKey(o.assign,o.id,0);							// Get key
		str+="</td><td>viseyes.org/pa?"+key;							// Show link
		str+="</td><td><div class='pa-greenbs' id='viewPro-";			// View
//		str+=this.EncodeKey(o.assign,o.id,1)+"'>View</div>";			// View key
		str+="</td><td><img id='editBut-"+i+"' src='img/editbut.gif' style='cursor:pointer'>";	// Edit
		str+="</td></tr>";												// End row	
		}
	str+="</table>"
	$("#classAssets").html(str);										// Fill it
	
	$("[id^=viewPro-]").click( (e)=> {								// ON VIEW CLICK
		var id=e.currentTarget.id.substr(8);							// Get key from id
		this.AssignmentPreview(id,true);								// Preview			
		});	

	$("[id^=editBut-]").click( (e)=> {								// ON EDIT CLICK
		var id=e.currentTarget.id.substr(8);							// Get key from id
		this.EditStudent(id);											// Preview			
		});	
}

GetAssignmentName(id) 												// GET ASSIGNMENT NAME
{
	var i;	
	var re=new RegExp(id+" - ");										// Search for id
	for (i=0;i<this.assigns.length;++i)									// For each assignment
		if (this.assigns[i].match(re))									// A match
			return this.assigns[i];										// Return name
	return id;
}

EditStudent(num) 													// ADD/EDIT STUDENT
{
	var o={ name:"", email:"", assign:""};
	var title="Edit student"
	var x=$(window).width()/2-266;										// Center in main screen
	var y=$("#bodyDiv").height()/2-100;									// Center
	if (num == -1) 	title="Add new student";							// Adding
	else																// Editing
		o=this.roster[num];												// Point at current
	var str="<div style='display:inline-block'><table>";				// Info div/table
	str+="<tr><td>Name(s)</td><td><textarea id='addName' type='text' class='pa-is' style='width:200px;font-family:sans-serif;padding:3px 8px 0 8px'>"+o.name+"</textarea></td></tr>";
	str+="<tr><td>Email(s)</td><td><input id='addEmail' type='text' class='pa-is' style='width:200px'value='"+o.email+"'></td></tr>";
	str+="<tr><td>Assignment&nbsp;</td><td>"+MakeSelect("addAssigns",false,this.assigns,this.GetAssignmentName(o.assign))+"</td></tr>";
	str+="</table></div>";												// End div
		
	DialogBox(title,str,x,y,500, ()=> {									// Run dialog			
		o.name=$("#addName").val() ? $("#addName").val() : "";			// Add name
		o.email=$("#addEmail").val() ? $("#addEmail").val() : "";		// Add name
		if ($("#addAssigns").val())										// If assignments
			o.assign=$("#addAssigns").val().match(/(\d+)/)[0]-0;		// Get id of assignment
		o.name=o.name.replace(/\\r/,"");								// Remove CRs
		if (num == -1) {												// Adding a new one
			var v=o.name.split(",");									// Split name by ','
			if (v.length < 2)	v=o.name.split("\t");					// If nothing, try tabs
			if (v.length < 2)	v=o.name.split("\n");					// If nothing, try CRs
			var vv=o.email.split(",");									// Split email by ','
			if (vv.length < 2)	vv=o.email.split("\t");					// If nothing, try tabs
			if (vv.length < 2)	vv=o.email.split("\n");					// If nothing, try CRs
			for (var i=0;i<v.length;++i) {								// For each one
				o.id=this.roster.length;								// Set student id
				o.name=v[i];											// Isolate name
				if (vv[i]) o.email=vv[i];								// Set								
				if (o.name)	{											// If a name
					this.roster.push($.parseJSON(JSON.stringify(o)));	// Add clone
					this.DrawClass();									// Redraw
					Sound("ding");										// Ding
					}
				}
			}
		else{															// Edit it
			if (!o.name) { 												// No name set
				ConfirmBox(()=> {										// Confirm if no name
						this.roster[num]=o; 							// Set it
						this.DrawClass();								// Redraw
						Sound("delete");								// Delete
						},								
					"This will remove the student from the class"		// Sub-prompt		
					);
				}
			else{
				this.roster[num]=o;										// Replace it
				this.DrawClass();										// Redraw
				Sound("ding");											// Ding
				}
			}
		});
}


} //CLASS CLOSURE	
