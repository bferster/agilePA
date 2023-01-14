
//////////////////////////////////////////////////////////////////////////////////////////////////
// PLAYER
/////////////////////////////////////////////////////////////////////////////////////////////////

class CPlayer {

	constructor()														//  CONSTRUCTOR
	{
		this.curPic=-1;														// Currently active picture
		this.inPlay=this.inMove=0;											// Default modes
		var _this=this;														// Save context
		this.curTime=0;														// Start at 0
		this.pos=[.5,.5,1];													// Current position
		this.audio=null;													// Audio object
		this.voice=0;	this.pitch=100;										// TTS options
		this.voices=[];														// Voices
		this.speechRate=.064;												// Seconds per char
		this.maxTime=18.5;													// Maximum time
		this.audioRate=100;													// Rate multiplier
		this.drift=0;														// TTS drift for char pos
		this.startCharPos=0;												// Starting char in script of TTS

		$("#moveDiv").fadeOut(0);											// Hide move controls
		$("#startPic").height($("#startPic").width*playAspect);				// Scale to aspect
		$("#endPic").height($("#endPic").width*playAspect);					// Scale to aspect
		
		this.GetVoiceList()													// Set voice list up, in case event to triggered
		speechSynthesis.onvoiceschanged=()=> {	this.GetVoiceList(); }		// Set voice list up

		$("#sliderDiv").draggable( {										// Draggable slider
			axis: "x",														// X axis
			containment: "parent",											// Constrain
			drag: function(event, ui) {										// On drag
				if (!_this.inMove) {										// Not in motion editor
					_this.curTime=ui.position.left/($("#sliderBarDiv").width()-4)*_this.maxTime; // Set time
					_this.Draw();											// Show position
					}
				}
			})

		$("#screenDiv").on("click", ()=>{									// ON SCREEN CLICK
			if (isFullScreen == 1) 											// If full screen
				this.SetFullScreen(0);										// Exit mode
			});	
			
		$("#playerDiv").on("click", ()=> {									// ON PLAYER CLICK
			$("#metaDiv").remove();											// Kill metadata popup
			});

		$("#startTime").on("click", ()=> {									// ON START TIME CLICK
			this.curTime=0;													// Set curtime to 0
			this.Draw();													// Show position
			});

		$("#playBut").on("click", ()=> {									// ON PLAYBUT CLICK
			this.inPlay=!this.inPlay;										// Toggle state
			if (this.inMove) {												// In motion editor
				var s=script.pics[this.curPic].start*this.speechRate;		// Start
				var se=script.pics[this.curPic].end*this.speechRate;		// End
				this.Play(s,se);											// Play or pause this clip
				}
			else
				this.Play(0,-1);											// Play to end or pause
			});

		$("#picOptions").on("change", function() {							// ON PIC OPTIONS CHANGE
			if (($(this).val() == "Set motion") && (_this.curPic != -1)) {	// If setting motion on a valid pic
				doc.Do();													// Save a do
				_this.InitMotionEditor(1);									// Draw motion editor
				$("#moveDiv").fadeIn();										// Show move controls
				}
			else if ($(this).val() == "addNewPic")							// Add pic (use value!)
				bin.AddPic();												// Run pic dialog
			else if ($(this).val() == "Full screen") {						// Full screen
				_this.SetFullScreen(1);										// Show full
				}
			else if ($(this).val() == "Get project link") 					// Get link to show
				doc.GetLink();												// Show link
			else if ($(this).val() == "Chat") 								// Chat
				chat.Open();												// Open
			$(this).val("Picture options");									// Set menu to default
			});

		$("#soundOptions").on("click", ()=> {								// ON SOUND OPTIONS CLICK
			doc.Do();														// Save a do
			this.SoundSettings();											// Change sound settings	
			$(this).val("Sound options");									// Set menu to default
			}); 
	
		$("#moveDoneBut").on("click", ()=> {								// ON MOVE DONE CLICKED
			this.inMove=0;													// Moving start
			$("#picOptions").val("Picture options");						// Restore menu
			$("#moveDiv").fadeOut(0);										// Hide move controls
			$("#cameraDiv").remove();										// Remove camera
			$("#playerDiv").height($("#scriptDiv").height());				// Shorten
			script.pics[_this.curPic].pos[0][3]=$("#slowInBut").prop("checked") ? 1 : 0;
			script.pics[_this.curPic].pos[1][3]=$("#slowOutBut").prop("checked") ? 1 : 0;
			this.Draw();													// Draw screen
			script.Draw();													// Draw script
			});

		$("#startPic").on("click", ()=> {									// ON MOVE START CLICK
			this.InitMotionEditor(1);										// Draw motion editor
			});
		
		$("#endPic").on("click", ()=> {										// ON MOVE END CLICK
			this.InitMotionEditor(2);										// Draw motion editor
			});
		
		$("#matchBut").on("click", ()=>{									// ON MATCH CLICK
			script.pics[this.curPic].pos[0][0]=script.pics[this.curPic-1].pos[1][0];		// Match x from last
			script.pics[this.curPic].pos[0][1]=script.pics[this.curPic-1].pos[1][1];		// y
			script.pics[this.curPic].pos[0][2]=script.pics[this.curPic-1].pos[1][2];		//z
			this.DrawCamera(0);												// Camera position
			Sound("ding");													// Ding					
			this.ScalePic(100,66,"#startImg",script.pics[this.curPic].pos[0]);	 // Set start
			});

		$("#playerDiv").disableSelection();									// Inhibit selection
	}

	Draw() 																// UPDATE PLAYER
	{
		$("#startTime").text(SecondsToTimecode(Math.round(this.curTime)));	// Start display
		$("#endTime").text(SecondsToTimecode(Math.round(this.maxTime)));	// End display
		var x=$("#sliderBarDiv").offset().left-8;							// Set left
		var y=Math.round($("#sliderBarDiv").offset().top+10);				// Set top
		if (this.maxTime) 													// If some time in script
			x+=Math.min(this.curTime/this.maxTime,1)*($("#sliderBarDiv").width()-20);	// Move slider into position
		trace(x,y)
			$("#sliderDiv").offset({ left:x, top:y });							// Set slider						
		var num=script.GetPicFromTime(this.curTime);						// Get current pic
		if (num != -1) {													// If on a picture
			$("#screenPic").show(0);										// Show pic
			this.curPic=num;												// Set current pic
			var o=script.pics[num];											// Point at pic
			$("#screenPic").prop("src",bin.pics[o.num].src);				// Set src
			var pct=(this.curTime-(o.start*this.speechRate))/(o.dur*this.speechRate);	// Point in move
			pct=Math.min(pct,1);											// Cap to 1
			if (o.pos[0][3] && o.pos[0][3])									// Both
				pct=1.0-((Math.cos(3.1414*pct)+1)/2.0);						// Full cosine curve
			else if (o.pos[0][3])											// Slow in
				pct=1.0-(Math.cos(1.5707*pct));								// 1st quadrant of cosine curve
			else if (o.pos[1][3])											// Slow out
				pct=1.0-(Math.cos(1.5707+(1.5707*pct))+1.0);				// 2nd quadrant of cosine curve
			pct=Math.min(Math.max(pct,0),1);								// Cap 0-1
			this.pos[0]=(o.pos[0][0]+((o.pos[1][0]-o.pos[0][0])*pct));		// Calc x
			this.pos[1]=(o.pos[0][1]+((o.pos[1][1]-o.pos[0][1])*pct));		// Calc y
			this.pos[2]=(o.pos[0][2]+((o.pos[1][2]-o.pos[0][2])*pct));		// Calc w
			this.ScalePic($("#screenDiv").width(),$("#screenDiv").height(),"#screenPic",this.pos); // Set start
			}
		else																// No pic
			$("#screenPic").hide(0);										// Hide it
		script.Highlight("#0000ff",this.curTime/this.speechRate,-1);		// Highlight position in text						
		if (isFullScreen && !this.curTime)									// If full screen
			$("#screenTitleDiv").fadeIn(0);									// Fade title in
	}

	SetFullScreen(mode)													// FULL SCREEN
	{
		isFullScreen=mode;													// Set flag
		let ww=$(window).width();                                      		// Get window width
		let wh=$(window).innerHeight();                                     // Get window height
			if (mode) {														// If full screen
			$("body").css({ "background-color":"#ddd" });					// Grey background,
			$("#picOptions").fadeOut(0);	$("#soundOptions").fadeOut(0);	// Hide options
			$("#scriptDiv").fadeOut();										// Fade out script
			$("#binDiv").fadeOut();											// Bin
			let h=wh-130;                                                   // Use screen height as dominant
			let w=h/playAspect;                                             // Screen width to aspect
			if (w > ww-32) {                                               	// Too narrow
				w=ww-32;                                                    // Size by width
				h=w*playAspect;                                             // Height follows width
				}
			$("#screenDiv").height(h);                                      // Size screen height
			$("#screenDiv").width(w);                                       // Width    
			$("#playerDiv").width(w+32);                                    // Player width
			$("#playerDiv").height(wh);                                     // Player height
			var x=($(window).width()-$("#playerDiv").width())/2;			// Center
			$("#playerDiv").offset({ left:Math.max(0,x), top:0 });			// Top left
			$("#screenTitleDiv").text($("#titleDiv").text());				// Set title
			$("#screenTitleDiv").css({ "font-size":h/10+"px",padding:(w/8)+"px","padding-top":(h/2.5)+"px", width:(w-w/4+32)+"px" });			
			$("#screenTitleDiv").fadeOut(0).fadeIn(0);						// Fade title in
			this.Draw();													// Redraw
			}
		else{																// If regular screen
			$("#screenTitleDiv").text("");									// No title
			$("body").css({ "background-color":"#eee" });					// White back, overflow
			$("#binDiv").fadeIn();											// Fade bin in
			$("#scriptDiv").fadeIn();										// Script
			$("#picOptions").fadeIn(0);	$("#soundOptions").fadeIn(0);		// Show options
			this.inPlay=false;												// Force stop playing
			this.Play(0,0);													// Stop
			$("#screenDiv").css({ width:"calc(40vw - 32px)", height:"calc((40vw - 32px)*.5625)" });
			$("#playerDiv").css({ left:"60%", height:"calc(100vh - 150px)", width:"40%" }); 		
			}
	}

	InitMotionEditor(mode)												// INIT MOTION EDITOR
	{
		var onCol="#009900", offCol="#666";									// Colors
		this.inMove=mode;													// Set moving mode to head
		var _this=this;														// Save context
		var num=script.pics[this.curPic].num;								// Picture to move
		$("#screenPic").prop("src",bin.pics[num].src);						// Set src
		var w=$("#screenPic")[0].naturalWidth/$("#screenPic")[0].naturalHeight*$("#screenDiv").height();
		$("#screenPic").css("transform","translate(0px,0px)");				// Identity matrix
		$("#screenPic").css({ height:"100%",left:0,top:0,width:w+"px"});	// Top left, full height
		this.picWid=$("#screenPic").width();								// Save width
		this.picHgt=$("#screenDiv").height();								// Save height
		if ((this.curPic > 0) && (script.pics[this.curPic].num == script.pics[this.curPic-1].num))  // Same pic as last
			$("#matchBut").css("display","inline-block");					// Show match button
		else																// Different
			$("#matchBut").css("display","none");							// Hide match button
		$("#playerDiv").height($("#scriptDiv").height()+150);				// Extend full screen
		$("#startDiv").css("color",offCol);									// Mute start text
		$("#endPic").css("border","3px solid "+offCol);						// And border
		$("#endDiv").css("color",offCol);									// Mute end text
		$("#startPic").css("border","3px solid "+offCol);					// And border
		$("#slowInBut").prop("checked",script.pics[this.curPic].pos[0][3] == 1);	// Set in checkbox
		$("#slowOutBut").prop("checked",script.pics[this.curPic].pos[1][3] == 1)	// Set out
		$("#startPic").html("<img id='startImg' src='"+bin.pics[num].src+"' style='position:relative'>");	
		$("#endPic").html("<img id='endImg' src='"+bin.pics[num].src+"' style='position:relative'>");	
		this.ScalePic(100,66,"#startImg",script.pics[this.curPic].pos[0]);	// Init start
		this.ScalePic(100,66,"#endImg",script.pics[this.curPic].pos[1]);	// Init end
		
		$("#startPic").draggable({ zIndex: 100, axis: "x",					// Make start draggable to copy position to end
				stop: function(event, ui) {									// On drag stop
					if (ui.position.left > 100) {							// Over end 
						script.pics[_this.curPic].pos[1]=script.pics[_this.curPic].pos[0].slice(0);	// Clone key
						Sound("ding");										// Ding					
						_this.ScalePic(100,66,"#endImg",script.pics[_this.curPic].pos[1]);	 // Set end
						$(this).css("left",0);								// Revert
						$("#endPic").trigger("click");						// Highight end				
						}
					}
				})

		$("#endPic").draggable({ zIndex: 100, axis: "x",					// Make end draggable to copy position to start
				stop: function(event, ui) {									// On drag stop
					if (ui.position.left < 100) {							// Over end 
						script.pics[_this.curPic].pos[0]=script.pics[_this.curPic].pos[1].slice(0);	// Clone key
						Sound("ding");										// Ding					
						_this.ScalePic(100,66,"#startImg",script.pics[_this.curPic].pos[0]);	 // Set start
						$(this).css("left",0);								// Revert image
						$("#startPic").trigger("click");					// Highight start					
						}
					}
				})

		if (mode == 1 ) {													// Set start
			$("#startDiv").css("color",onCol);								// Hilite  text
			$("#startPic").css("border","3px solid "+onCol);				// And border
			this.DrawCamera(0);												// Camera position
			}
		if (mode == 2 ) {													// Set end
			$("#endDiv").css("color",onCol);								// Hilite  text
			$("#endPic").css("border","3px solid "+onCol);					// And border
			this.DrawCamera(1);												// Camera position
			}
	}

	ScalePic(wid, hgt, image, pos)			// POSITION IMAGE
	{
		var nw=$(image)[0].naturalWidth;									// Get true width
		var nh=$(image)[0].naturalHeight;									// Get true height
		var fs=wid/nw;														// Frame scaling
		var s=1/pos[2];														// Reciprocal scale
		var w=nw*s*fs;														// Get image width scaled
		var h=nh*s*fs;														// Get image height
		var l=w*pos[0]-(w/s/2);												// Get left
		var t=h*pos[1]-(hgt/2);												// Get top
		$(image).width(w); $(image).height(h);								// Size	
		$(image).css("transform","translate("+-l+"px,"+-t+"px)");			// Position
	} 

	DrawCamera(which) 													// DRAW CAMERA
	{
		var _this=this;														// Save context
		$("#cameraDiv").remove();											// Remove old one
		var o=script.pics[this.curPic].pos[which];							// Point at position based on side
		var w=$("#screenPic").width()*o[2]-1;								// Calc width
		var h=$("#screenPic").height()*o[2]-1;								// Calc height
		var str="<div id='cameraDiv' style='width:"+w+"px;height:"+w*playAspect;	// Size
		str+="px;cursor:url(img/move.cur),auto; ";							// Cursor
		str+= "px;border:1px solid yellow;position:absolute;border-radius:0px'>"
		str+="<div style='width:calc(100% - 4px);height:calc(100% - 4px);";
		str+= "border:2px solid #000;border-radius:0px'>";
		str+="<div style='width:calc(100% - 2x);height:calc(100% - 2px);";
		str+= "border:1px solid yellow;border-radius:0px'></div></div>"
		str+="<div id='camSizerBut' style='width:30px;height:32px;";
		str+="float:right;margin:-15px;cursor:nw-resize'>"
		str+="<div style='width:0;height:0;border-bottom: 10px solid yellow;";	
		str+="border-left: 10px solid transparent'</div></div>";
		$("#screenDiv").append("</div>"+str);								// Add camera to screen
		var cx=this.picWid*o[0]+(o[0]-w/2)+14;								// Calc camera left
		var cy=this.picHgt*o[1]+(o[1]-w*playAspect/2)+14;					// And top
		$("#cameraDiv").css({ left:cx, top:cy });							// Position camera
		$("#cameraDiv").draggable({											// Make camera draggable
			stop: function(event, ui) {										// On drag stop
				o[0]=(ui.position.left-14+$("#cameraDiv").width()/2)/$("#screenPic").width();	// Calc x
				o[1]=(ui.position.top-14+$("#cameraDiv").height()/2)/$("#screenPic").height();	// Calc y
				_this.ScalePic(100,66,"#startImg",script.pics[_this.curPic].pos[0]); // Set start
				_this.ScalePic(100,66,"#endImg",script.pics[_this.curPic].pos[1]);	 // Set end
				}
			});
		$("#camSizerBut").draggable({										// Make resizer draggable
			axis:"x",														// Constrict to x axis
			drag: function(event, ui) {										// On drag
				var x=event.pageX-$("#cameraDiv").offset().left;			// Position of camera left
				x=Math.max(x,25);											// Not too small
				$("#cameraDiv").width(x);									// Size camera width
				$("#cameraDiv").height(x*playAspect);						// Height is proportional
				$(this).css("display","none");								// Hide resizer while dragging
				},
			stop: function(event, ui) {										// On drag stop
				$(this).css({display:"inline-block",left:"0px"});			// Force in box
				o[2]=$("#cameraDiv").width()/$("#screenPic").width();		// Set width
				o[0]=($("#cameraDiv").position().left-14+$("#cameraDiv").width()/2)/$("#screenPic").width();	// Calc x
				o[1]=($("#cameraDiv").position().top-14+$("#cameraDiv").height()/2)/$("#screenPic").height();	// Calc y
				_this.ScalePic(100,66,"#startImg",script.pics[_this.curPic].pos[0]); // Set start
				_this.ScalePic(100,66,"#endImg",script.pics[_this.curPic].pos[1]);	 // Set end
				}
			});
	}

	Play(start, end)													// START / STOP PLAYING 
	{
		$("#cameraDiv").remove();											// Remove camera
		if (this.inPlay) {													// If playing
			$("#screenTitleDiv").fadeOut(750);								// Fadeout title, if any
			this.StartAudio(this.curTime);									// Start	
			if (end == -1)	end=this.maxTime;								// Get real end *AFTER* audio start
			var resetTime=start;											// Time to restart
			start=this.curTime;												// Set to start
			this.playerStart=new Date().getTime()							// Set start to now
			this.playerTimer=setInterval(()=> {								// Set timer
				this.curTime=start+(new Date().getTime()-this.playerStart)/1000; // Get elapsed time from start
				this.Draw();												// Show screen
				if (this.curTime >= end+1) {								// If past end post roll
					this.curTime=resetTime;									// Set to reset point
					this.inPlay=false;										// Toggle state
					this.Play(0,0);											// Stop player
					this.Draw();											// Show screen
					}
				},42);														// Set timer ~24ps
			$("#playBut").prop("src","img/pausebut.gif");					// Show pause but
			}
		else{																// If paused	
			this.StartAudio(-1);											// Stop playing
			clearInterval(this.playerTimer);								// Kill timer
			$("#playBut").prop("src","img/playbut.gif");					// Show play but
		}
	}

//////////////////////////////////////////////////////////////////////////////////////////////////
// SOUND
/////////////////////////////////////////////////////////////////////////////////////////////////

	SoundSettings()														// SOUND SETTINGS DIALOG
	{
		var _this=this;														// Save context
		var x=$("#playerDiv").position().left+$("#playerDiv").width()/2-166;// Center in screen
		var y=$("#screenDiv").height()-220;									// Bottom of screen
		var str="Audio rate<div id='rateSlider' style='float:right;width:150px'></div><br>";
		str+="<div style='float:right;width:75px;border-left:1px solid #66cc66;margin-top:-1px;'>&nbsp;</div><br>";
		str+="Audio pitch<div id='pitchSlider'style='float:right;width:150px'></div><br><br>";
		str+="Voice<select id='voiceSel' class='pa-is' style='float:right'width:150px'><option>None</option><option>Use MP3 file</option><option>Default computer voice</option></select><br><br>";
		str+="MP3 files<span  style='float:right'><input id='mp3Inp' type='text' class='pa-is' style='width:150px'>";
		str+="&nbsp<img src='img/microphone.png' title='MP3 recorder' style='vertical-align:-5px' onclick='doc.RecordMP3()'><span>";
		
		DialogBox("Sound Settings",str,x,y,300, function() {				// Run dialog			
			_this.pitch=$("#pitchSlider").slider("option", "value"); 		// Get pitch		
			_this.audioRate=$("#rateSlider").slider("option","value");		// Get rate		
			_this.voice=$("#voiceSel").prop("selectedIndex");				// Get voice
			_this.mp3=$("#mp3Inp").val();									// Get MP3 file
			_this.InitAudio();												// Init audio
			script.Draw();													// Redraw script
			_this.Draw();													// Redraw screen
			if (_this.voice == 1) 		$("#activeVoice").text("MP3 file");			// Show voice used	
			else if (_this.voice > 1) 	$("#activeVoice").text("Computer voice");	// Show voice used	
			else 						$("#activeVoice").text("");					// Show voice used	
			});
		for (i=0;i<this.voices.length;++i)									// For each voice
			$("#voiceSel").append("<option>"+this.voices[i].name+"</option>");	// Add to select
		$("#mp3Inp").val(this.mp3);											// Set mp3
		$("#voiceSel").prop("selectedIndex",_this.voice);					// Set current voice
		$(this).val("Sound options");										// Set menu to default
		$("#pitchSlider").slider({ value:_this.pitch, step:5, min:0, max:200 });		// Init as slider 0-200
		$("#rateSlider").slider({ value:_this.audioRate, step:5, min:50, max:150 });	// Init as slider 50-150
		}
		
	InitAudio()															// INIT AUDIO
	{
		this.audio=null;													// Assume no audio						
		var _this=this;														// Save context
		if ((this.voice == 1) && this.mp3)	{								// If an mp3 file
			this.audio=new Audio();											// Init audio object
			this.audio=new Audio(ConvertFromGoogleDrive(this.mp3));			// Load mp3 file
			}
		else if (this.voice > 1) {											// If text to speech
			speechSynthesis.cancel();										// Kill queue
			this.audio=new SpeechSynthesisUtterance();						// Init TTS
			if (this.voice > 2)												// If not default voice
				this.audio.voice=this.voices[this.voice-3];					// Set voice
			this.audio.onboundary=function(e) {								// On word boundary
				_this.drift=e.charIndex+_this.startCharPos-(_this.curTime/_this.speechRate)-2;	// Save drift
				}
			}
		this.maxTime=$("#scriptTextDiv").text().length*.065/(this.audioRate/100);	// Set max time
		$("#endTime").text(SecondsToTimecode(Math.round(this.maxTime)));	// End display
	}

	StartAudio(time)													// PLAY/PAUSE AUDIO
	{
		this.speechRate=.065;												// Default speechRate
		if (!this.audio)													// No audio set up yet
			return;															// Quit
		this.drift=0;														// Assume no drift from charpos to TTS
		var ar=this.audioRate/100;											// Speed
		if (this.voice == 1) {												// If an mp3 file
			if (time < 0)													// If stopping
				this.audio.pause();											// Stop playing
			else{															// If playing
				this.speechRate=.065/ar;									// Adjust speechRate
				this.audio.currentTime=this.curTime;						// Cue it up
				this.audio.playbackRate=ar;									// Set speed from .5 to 1.5
				if (this.audio.duration) {									// If a some duration
					if (this.audio.duration != Infinity)					// Not infinity
						this.speechRate=this.audio.duration/ar/$("#scriptTextDiv").text().length;	// Set speechRate to match mp3 file
					this.maxTime=$("#scriptTextDiv").text().length*this.speechRate;		// Set max time
					$("#endTime").text(SecondsToTimecode(Math.round(this.maxTime)));	// End display
					this.audio.play();										// Start playing
					}
				else														// Not loaded yet
					PopUp("MP3 file has not loaded yet",2000,"screenDiv");	// Popup
				}
			}
		else{																// Text to speech
			speechSynthesis.cancel();										// Kill TTS queue
			if (time >= 0) {												// If playing
				this.InitAudio();											// Init TTS
				var pos=this.curTime/this.speechRate;						// Start of text
				this.startCharPos=pos;										// Save start char pos
				this.audio.text=$("#scriptTextDiv").text().substr(pos);		// Set text							
				this.audio.rate=Math.max(.1,this.audioRate/100);			// Set rate 
				this.audio.pitch=(this.pitch/100);							// Set pitch 0-2
				if (ar > 1)			ar=1+(ar-1)*2;							// Scale 1-1.5 to 1-2
				else if (ar < 1)	ar=1-(ar*1.6);							// Scale .5-1 to .25-1
				this.audio.rate=ar;											// Set TTS audio rate .25 to 2
				speechSynthesis.speak(this.audio);							// Start
				this.maxTime=$("#scriptTextDiv").text().length*this.speechRate;		// Set max time
				$("#endTime").text(SecondsToTimecode(Math.round(this.maxTime)));	// End display
				}
			}
	}

	GetVoiceList(time)													// SET VOICE LIST
	{
		this.voices=[];														// New voices array
		let v=speechSynthesis.getVoices();									// Get voices
		v.forEach((voice,index)=> {											// For each voice
			if (voice.lang == "en-US")	this.voices.push(voice);			// Just look at English and add voice
			});
	}

} // CLASS CLOSURE
