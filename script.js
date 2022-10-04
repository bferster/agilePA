//////////////////////////////////////////////////////////////////////////////////////////////////
// SCRIPT and BIN
/////////////////////////////////////////////////////////////////////////////////////////////////

class CScript {

	constructor()														//  CONSTRUCTOR
	{
		this.pics=[];														// Alloc array									
		this.charMap=[];													// Positions of periods in text

		$("#scriptDiv").droppable({											// HANDLE DROPS TO BIN
			accept: ".pa-pic", 												// Accept only pics from bin	  
			drop: (event,ui)=> {											// On drop
				doc.Do();													// Save a do
				$("#metaDiv").remove();										// Kill popup
				var id=ui.draggable[0].id.substr(7);						// Get id
				if (!player.inMove)											// If not in motion editor
					player.curPic=this.pics.length;							// This is current pic
				var pos=$("#"+ui.draggable[0].id).offset().top;				// Get y pos of image
				var pos=ui.offset.top+$("#scriptDiv").scrollTop();			// Get unscrolled pos
				pos=this.GetPosFromPic(pos);								// Get char pos
				this.AddPic(id,pos);										// Add to script
				Sound("ding");												// Ding
				this.Draw();												// Show script
				$("#scriptPic-"+(this.pics.length-1)).trigger("click");		// Set as current
				}
			});
		
		$("#scriptTextDiv").on("focus",()=> {							// ON SCRIPT FOCUS
			var txt=$("#scriptTextDiv").html();								// Get script html
			$("#scriptTextDiv").html(txt.replace(/<span.+">|<\/span>/g,""));// Remove spans
			});

		$("#scriptTextDiv").on("change keyup paste", ()=> {					// ON SCRIPT CHANGE
			doc.changed=true;												// Set changed flag
			this.ResizeImageArea();											// Equilibrate fields
			player.maxTime=$("#scriptTextDiv").text().length*player.speechRate; // Set max time
			$("#endTime").text(SecondsToTimecode(Math.round(player.maxTime)));// End display
			});
	
		$("#titleDiv").on("change keyup paste", ()=> {						// ON TITLE CHANGE
			doc.changed=true;												// Set changed flag
			});
	
		$("#loadBut").on("click", (e)=> {									// ON LOAD CLICK
			doc.GetProjects(e.shiftKey);									// Get project list
			});	

		$("#loadBut").on("change", (e)=>{									// ON LOAD SELECT
			let v=$('#loadBut').val();										// Get selected value
			if  (v == "all") 	doc.GetProjects(true);						// Recurse for all
			if (!isNaN(v))		doc.Load(v);								// Load project
			});	
		}

	ResizeImageArea() 													//	MATCH IMAGE AREA TO TEXT AREA
	{
		$("#scriptPixDiv").height($("#scriptTextDiv").height())				// Make the same
		$("#scriptDivider").height($("#scriptTextDiv")[0].scrollHeight-24);	// Set divider
	}

	Draw() 																//	DRAW SCRIPT
	{
		var i,y,str="<br>Drag<br>pictures<br>here"
		var cpl=$("#scriptTextDiv").width()/15;								// Characters/line
		var offy=$("#scriptTextDiv").offset().top+24;						// Offset of title
		offy+=$("#scriptDiv").scrollTop();									// Account for scroll
		for (i=0;i<this.pics.length;++i) {									// For each pic
			y=(this.pics[i].start/cpl*40)+offy;								// Calc y pos			
			str+="<div id='scriptPic-"+i+"' class='pa-scriptPic' ";			// Container div 
			str+="style='top:"+y+"px'>";									// Pos
			str+="<img id='scriptImg-"+i+"' style='position:relative' ";	// Img
			str+="src='"+bin.pics[this.pics[i].num].src+"' ";				// Get source from bin
			str+="></div>"													// End div
			}
		$("#scriptPixDiv").html(str);										// Show pix
		this.ResizeImageArea();												// Equilibrate fields
		this.ResolvePicTimes();												// Make times a solid stream
		
		for (i=0;i<this.pics.length;++i) {									// For each pic
			player.ScalePic(128,85,"#scriptImg-"+i,script.pics[i].pos[0]); 	// Scale to start pos
			
			$("#scriptPic-"+i).on("click", (e)=> {							// On click
				if (!player.inMove)	{										// If not in motion editor
					let id=e.target.id.substr(10);							// Get index into script pics
					player.curPic=id;										// Set current pic
					player.curTime=this.pics[id].start*player.speechRate;	// Set start
					player.Draw();											// Draw
					this.Highlight("#cc0000",this.pics[id].start,this.pics[id].dur);	// Highlight text					
					$("[id^=scriptPic-]").css("border","2px solid #999");	// Kill borders
					$(this).css("border","2px solid #cc0000");				// Add border
					}
				});	
			
			$("#scriptPic-"+i).draggable( {									// Allow drag
				axis: "y",													// Constrain to y axis
				start: (event, ui)=> {										// If starting					
					$("#metaDiv").remove();									// Kill meta popup, if any
					if (!player.inMove)										// If not in motion editor
						player.curPic=ui.helper[0].id.substr(10);			// Set curpic
					},
				drag: (event, ui)=> {										// If stopped						
					$("#metaDiv").remove();									// Kill metadata popup
					let pos=this.GetPosFromPic(ui.position.top);			// Calc char pos
					this.Highlight("#0000ff",pos,-1,true);					// Highlight position in text & inhibit scrolling						
					},
				stop: (event, ui)=> {										// If stopped						
					doc.Do();												// Save a do
					if (ui.position.top < -75) {							// Off the top
						this.pics.splice(ui.helper[0].id.substr(10),1);		// Delete it
						Sound("delete");									// Sound
						if (!player.inMove)									// If not in motion editor
							player.curPic=-1;								// No current pic
						}
					else{													// Normal move
						var id=ui.helper[0].id.substr(10);					// Get id
						var pos=this.GetPosFromPic(ui.position.top);		// Calc char pos
						if (pos > 0)										// In range										
							this.SetPicStartTime(id,pos);					// Set pic start time
						this.Draw;											// Redraw
						$("#scriptPic-"+id).trigger("click");				// Set as current
						}

				this.Draw();												// Redraw
				}	
			});
		}
	}

	SetPicStartTime(id, pos) 											//	SET PIC START TIME
	{
		if (id == 0) {														// First pic
			var dest=Math.max(0,this.GetPicFromTime(pos*player.speechRate));	// Get pic we're over
			if (dest && (pos > this.pics[dest].start)) {					// If moving down, flop
				var t=$.parseJSON(JSON.stringify(this.pics[dest]));			// Clone [dest]
				this.pics[dest]=$.parseJSON(JSON.stringify(this.pics[id]));	// Flop with clone
				this.pics[id]=t;											// Copy back temp
				this.pics[dest].start=t.start;								// Set time
				}
			pos=0;															// Force to top
		}
		this.pics[id].start=Math.round(pos);								// Set start
	}

	GetPosFromPic(pos) 													// GET CHAR POS FROM PIC HEIGHT
	{
		var cpl=$("#scriptTextDiv").width()/15;								// Characters/line
		var offy=$("#scriptTextDiv").offset().top+24;						// Offset of title
		offy+=$("#scriptDiv").scrollTop();									// Account for scroll
		return (pos-offy)/40*cpl;											// Return char pos
	}

	AddPic(picNum, when) 												//	ADD PIC TO SCRIPT
	{
		var o={};															// Blank obj
		var n=this.pics.length;												// Number of pics
		o.num=picNum;														// Add bin index
		o.pos=[[.5,.4,.75,1],[.5,.5,.5,1]];									// Positions
		this.pics.push(o);													// Add to pics array
		this.SetPicStartTime(n,when);										// Set pic start time
		this.Draw();														// Redraw
	}

	ResolvePicTimes() 													// RESOLVE PIC TIMES
	{
		var i,pre;
		var o=this.pics;													// Point at pics
		o.sort((a,b)=> { return a.start-b.start });							// Sort by start
		var last=o.length-1;												// Point at last pic
		var e=$("#scriptTextDiv").text().length+2;							// End of script in chars
		if (last < 0)														// No pics yet
			return;															// Quit
		o[0].start=0;														// First pic always starts at 0
		for (i=1;i<=last;++i) {												// For each pic past 1st
			pre=i-1;														// Point a previous pic														
			o[pre].dur=Math.max(0,o[i].start-o[pre].start);					// Dur is delta from this to last
			o[pre].end=o[pre].start+o[pre].dur;								// Calc end
			}
		o[last].dur=Math.max(0,e-o[last].start);							// Fill last pix to script end	
		o[last].end=e;														// Set end
	}

	GetPicFromTime(now) 												//	GET CURRENT SCRIPT PICTURE
	{
		let i;
		let o=this.pics;													// Point at pics
		if (!player)														// If no player yet
			return -1;														// Return no pic
		now/=player.speechRate;												// Convert from time to char
		for (i=0;i<o.length;++i) 											// For each pic
			if ((now >= o[i].start) && (now < o[i].end))					// In this one
				return i;													// Return index
		return i-1;															// Last pic
	}

	Highlight(col, pos, width, noScroll) 								//	HIGHLIGHT SCRIPT TEXT
	{
		var underBar=false;
		var cpl=$("#scriptTextDiv").width()/15;								// Characters/line
		var txt=$("#scriptTextDiv").html();									// Get raw text
		txt=txt.replace(/<span.+">|<\/span>/g,"");							// Remove
		txt=txt.replace(/<br>/g,"~");										// Remove CRs
		txt=txt.replace(/\&nbsp\;/g," ");									// Remove with real spaces
		var n=txt.length;													// Length of text
		if (width < 0) {													// Tracking pos, no pic
			underBar=true;													// Use underbar
			width*=-2;														// Double width
			}
		if (player.drift) 													// If a drift from time vs TTS
			pos+=player.drift;												// Shift start
		pos=Math.max(Math.round(pos),0);									// Cap at 0
		width=Math.round(width);											// Round
		if (pos >= n)														// Start is past script length
			return;															// Quit
		if (pos+width > n)													// If end id past length
			width=(n-pos+1);												// Cap at end
		var str=txt.substr(0,pos)+"<span style='";							// Add start
		if (underBar)														// If narrow
			str+="border-bottom: 4px solid ";								// Use underline
		else																// If wide
			str+="color: ";													// Color
		str+=col+";'>"														// Finish span
		str+=txt.substr(pos,width);											// Add highlight portion
		str+="</span>"+txt.substr(pos+width)								// Close span and add rest of text
		str=str.replace(/~/g,"<br>");										// Restore CRs
		$("#scriptTextDiv").html(str);										// Set colored text in
		if (noScroll)														// If dragging pic
			return;															// Don't scroll
		var y=pos/cpl*40;													// Scroll point
		$("#scriptDiv").scrollTop(y-$("#scriptDiv").height()/2);			// Scroll text
	}

} // CLASS CLOSURE

//////////////////////////////////////////////////////////////////////////////////////////////////
// BIN
/////////////////////////////////////////////////////////////////////////////////////////////////

	class CBin {													
		
		constructor()														//  CONSTRUCTOR
		{
			var str="<img style='margin:20px 0 3px 0;width:120px' src='img/agilelogo.png'>"; 
			str+="<img  src='img/helpicon.gif'style='width:20px;margin:6px;margin-bottom:12px;cursor:pointer' onclick='bin.ShowHelp()'>"; 
			str+="<div style='color:#888;font-size:11px;line-height:100%'> &copy;2022 StageTools</div>";
			$("#binMenuDiv").html(str);											// Show menu
			$("#binDiv").disableSelection();									// Inhibit selection
			this.pics=[];														// Alloc pics array
			this.Draw();														// Show bin

			$("#binLeftBut").on("click", ()=> {									// Mobile scroll left
				$("#metaDiv").remove();											// Kill popup
				$("#binPixDiv").scrollLeft($("#binPixDiv").scrollLeft()-$("#binPixDiv").width()/2);
				if ($("#binPixDiv").scrollLeft())								// If scrolled
					$("#binLeftBut").show();									// Show
				else															// At start
					$("#binLeftBut").hide();									// Hide
				if (Math.abs($('#binPixDiv')[0].scrollWidth-$('#binPixDiv').outerWidth()) > 5)	// If it can scroll
					$("#binRightBut").show();									// Show
				});
			
			$("#binRightBut").on("click", ()=> {								// Right
				$("#metaDiv").remove();											// Kill popup
				$("#binPixDiv").scrollLeft($("#binPixDiv").scrollLeft()+$("#binPixDiv").width()/2);
				$("#binLeftBut").show();										// Show left
				if ($('#binPixDiv')[0].scrollWidth-$('#binPixDiv').scrollLeft()-$('#binPixDiv').outerWidth() < 20)	// If no scroll left
					$("#binRightBut").hide();									// Hide
				else															// At start
					$("#binRightBut").show();									// Show
				});
		}

		Draw() 																//	DRAW BIN
		{
			var i,str="";
			str+="<ul id='pixList' style='list-style-type:none;padding:0;margin:0'>"
			for (i=0;i<this.pics.length;++i) {									// For each pic
				str+="<li id='binPic-"+i+"' class='pa-pic'";					// List start
				str+="><img src='"+this.pics[i].src+"' style='margin:0;height:112px'></li>"; // Add image
				}

			$("#binPixDiv").html(str+"</ul>");									// Add to div
			$("#pixList").sortable({ 											// Make it sortable
				sort: (event, ui)=> {											// On pic drag
					$("#metaDiv").remove();										// Kill meta popup, if any on sort
					if ((ui.offset.left < -40) && (ui.offset.top > $(window).height()-100)) {   // In corner
						doc.Do();                                               // Save a do
						this.pics.splice(ui.helper[0].id.substr(7),1);         	// Delete it
						Sound("delete");                                        // Sound                           
						this.Draw();                                          	// Redraw
						}
					else if (ui.offset.left < 120) {							// In script pic area
						var pos=ui.offset.top+$("#scriptDiv").scrollTop();		// Get unscrolled pos
						pos=script.GetPosFromPic(pos);							// Calc char pos
						script.Highlight("#0000ff",pos,-1,true);				// Highlight position in text & inhibit scrolling						
						}
					}
				});
			$("#pixList").disableSelection();									// Imnhibit selection

			for (i=0;i<this.pics.length;++i) {									// For each pic
				$("#binPic-"+i).on("click", (e)=> {								// Add over handler
					$("#pa-webpage").remove();									// Remove old image, if any
					let id=e.currentTarget.id.substr(7);						// Get id
					this.ShowMetaData(id);										// Show metadata popup
					});
				}
		}

		ShowMetaData(num) 													//	SHOW METADATA POPUP
		{
			$("#metaDiv").remove();												// Kill old one
			let o=this.pics[num];												// Point at pic
			if (!o.title && !o.desc) 											// If nothing to show
				return;															// Quit


				var str="<div id='metaDiv' class='pa-meta'>";						// Add div
			str+="<img id='zoomBut' src='img/zoomer.png' style='width:14px;cursor:pointer'>&nbsp&nbsp;";	// Zoomer button
			if (o.title)														// If a title
				str+="<b>"+o.title+"</b><br><br>";								// Add it
			if (o.desc)															// If a description
				str+=o.desc;													// Add it
			if (o.link)															// If a link
				str+=" Click <a href=\""+o.link+"\" target=\"_blank\">here</a> for more information.";  // Add it
			str+="<div id='metaArrow' class='pa-arrow-down'></div>";			// Add div
			$("body").append(str+"</div>");										// Add popup
			var x=$("#binPic-"+num).offset().left-160+$("#binPic-"+num).width()/2;	// Center
			var off=x;															// Save pos
			x=Math.min(x,$(window).width()-360);								// Cap to window
			off-=x;																// Offset from end
			$("#metaArrow").css("left",Math.min(160+off,320)+"px");				// Position arrow
			var y=$("#binDiv").offset().top-$("#metaDiv").height()-32;			// Align by bottom
			$("#metaDiv").offset({left:x,top:y});								// Position popup

			$("#playerDiv").on("mouseenter", ()=> {	$("#metaDiv").remove(); });	// Kill metadata
			$("#scriptDiv").on("mouseenter", ()=> {	$("#metaDiv").remove(); });	// Kill metadata	
			$("#scriptDiv").on("click", ()=> { $("#pa-webpage").remove(); });	// Kill webpage						
			$("#playerDiv").on("click", ()=> { $("#pa-webpage").remove(); });	// Kill webpage					
			$("#zoomBut").on("click", ()=> { this.ShowPic(num);	});				// Show image popup
		}
			
		AddPic()															// ADD NEW PICTURE DIALOG
		{
			var x=$("#mainDiv").width()/2-266;									// Center in main screen
			var y=$("#scriptDiv").height()/2-100;								// Center
			var str="<div style='display:inline-block'><table style='width:300px'>";	// Info div/table
			str+="<tr><td>Title</td><td><input id='addTitle' type='text' class='pa-is' style='width:100%'</td></tr>";
			str+="<tr><td>URL</td><td><input id='addUrl' type='text' class='pa-is' style='width:100%'></td></tr>";
			str+="<tr><td>Desc&nbsp;&nbsp;</td><td><textarea id='addDesc' type='text' class='pa-is' style='width:100%;height:50px'></textarea></td></tr>";
			str+="<tr><td>Link</td><td><input id='addLink' type='text' class='pa-is' style='width:100%'>";
			str+="</table></div>";														// End div
			str+="<div style='display:inline-block;overflow:hidden;width:160px;margin-left:32px;vertical-align:top'>";
			str+="<img id='addImg' src='img/newbinpic.png' style='width:100%'></div>";
			str+="<div id='findPic' class='pa-greenbs'>Find picture</div>";	
			DialogBox("Add new picture",str,x,y,500, ()=> {						// Run dialog			
				var o={};
				doc.Do();														// Save a do
				o.src=$("#addUrl").val() ? ConvertFromGoogleDrive($("#addUrl").val()) : "";	 // Add src
				o.title=$("#addTitle").val() ? $("#addTitle").val() : "";		// Add title
				o.desc=$("#addDesc").val() ? $("#addDesc").val() : "";			// Add desc
				o.link=$("#addLink").val() ? $("#addLink").val() : "";			// Add link
				this.pics.push(o);												// Add to bin
				Sound("ding");													// Ding
				this.Draw();													// Redraw bin
				});

			$("#addUrl").on("change", ()=> {									// ON IMAGE URL SET
				$("#addImg").prop("src",$(this).val());							// Show it
				});
			
			$("#findPic").on("click", ()=> {									// ON FIND CLICK
				$("#findPic").remove();											// Remove button
				$("#dialogDiv").append("<br>");									// Shift down
				$("#dialogDiv").width(900);										// Widen
				$("#dialogDiv").draggable();									// Draggable
				picFind.ImportDialog() 											// Show pix finder
				});
		}

		ShowPic(num) 														//	SHOW PIC
		{
			$("#pa-webpage").remove();											// Remove old image, if any
			$("#metaDiv").remove();												// Kill metadata
			var o=this.pics[num];												// Point at pic
			var str="<div id='pa-webpage' class='pa-webpage' style='";			// Add div
			str+="width:"+($("#scriptDiv").width()-24);							// Width
			str+="px;height:"+($("#scriptDiv").height()-44);					// Height
			str+="px;top:8px;left:8px'>";										// Finish div
			str+="<b>"+o.title+"</b><img id='pa-close' src='img/closedot.gif' style='float:right;cursor:pointer'><br><br>"	// Add close button
			str+="<div style='overflow-y:auto;height:calc(100% - 30px)'><img src='"+o.src+"' width='100%'>";	
			if (o.desc)	{														// If a description
				str+="<br><br>"+o.desc;												// Add it
				if (o.link)														// If a link
					str+=" Click <a href=\""+o.link+"\" target=\"_blank\">here</a> for more information.";  // Add it
				}
			$("body").append("</div>"+str+"</div>");							// Add popup
			$("#pa-webpage").fadeIn(1000);										// Fade in
			$("#pa-close").click(()=> { $("#pa-webpage").remove(); });			// Remove on click of close but
		}

		ShowHelp() 															//	SHOW HELP
		{
			var div="#mainDiv";													// Enclosing div	
			$("#pa-webpage").remove();											// Remove old image, if any
			$("#metaDiv").remove();												// Kill metadata
			var h=$("#scriptDiv").height()-44;									// Height
			var str="<div id='pa-webpage' class='pa-webpage' style='";			// Add div
			str+="font-size:13px;width:"+(h*.77);								// Width proportion to 8.x x 11 page
			str+="px;height:"+h+"px;top:8px;left:8px'>";						// Finish div
			str+="<b> PrimaryAccess User&apos;s Guide</b><img id='pa-close' src='img/closedot.gif' style='float:right;cursor:pointer;padding-bottom:12px'><br>"	// Add close button
		//		str+="<div style='-webkit-overflow-scrolling:touch'>";
			str+="<iframe src='https://docs.google.com/document/d/e/2PACX-1vQQlE8nxS33bkI5CY--daR1ibM-7q6B-GFrztW6cq9lN6FNztpA_b0nrQiV33krohd5O6dvyU1ibiGU/pub?embedded=true' "; 
			str+="style='width:100%;height:"+(h-30)+"px;overflow-y:scroll'></iframe>";
			$("body").append(str+"</div>");										// Add popup
			$("#pa-webpage").fadeIn(1000);										// Fade in
			$("#pa-webpage").draggable();										// Make it draggable
			$("#pa-close").click(()=> { $("#pa-webpage").remove(); });	// Remove on click of close but
		}

} // CLASS CLOSURE
