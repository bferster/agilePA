////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CImageFind
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var CImageFindObj=null;																// Points at object

function CImageFind(div)														// CONSTRUCTOR
{
	CImageFindObj=this;																// Save pointer to obj
	this.div=(div == "body") ? div : "#"+div;										// Container div
	this.rawData=null;																// Holds raw search results
	this.data=null;																	// Folds formatted search results
	this.filter="";																	// No filter
	this.filterCollect="";															// No collection filter
	this.filterPlace="";															// No place filter
	this.user="";																	// No user
	this.type="PrimaryAccess";														// Start with PA
	this.previewMode="";															// Mode of preview ( 'Preview', '')
	this.curItem=-1;																// Currently selected item
	this.era=0;																		// Era
	this.ncssEras=[ "Any",															// NCSS eras
		"1. Three Worlds Meet (Beginnings - 1620)",
		"2. Colonization & Settlement (1585-1763)",
		"3. Revolution & the New Nation (1754-1820s)",
		"4. Expansion and Reform (1801-1861)",
		"5. Civil War & Reconstruction (1850-1877)",
		"6. Development of Industrial US (1870-1900)",
		"7. Emergence of Modern America (1890-1930)",
		"8. The Great Depression & WW-II (1929-1945)",
		"9. Postwar US (1945 to early 1970s)",
		"10. Contemporary US (1968 to the present)",
		"11. The World" 
	];
}

CImageFind.prototype.ImportDialog=function()									// IMPORTER DIALOG
{
	var i;
	var _this=this;																	// Save context
	var collections=["PrimaryAccess","WikiMedia","Library of Congress", "National Archives", "Cooper-Hewitt Museum", "Harvard Art", "Flickr"];// Supported collections
	var str="<hr style='margin-top:12px'><p><span class='pa-bodyTitle'>Find pictures</span>";	// Title
	str+="&nbsp;&nbsp;&nbsp;&nbsp;<i>(<span id='numItemsFound'>No</span> items found)</i>"; 	// Number of items
	str+="<span style='float:right'>";												// Hold controls
	str+="Search for: <input class='pa-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:200px;height:17px;vertical-align:0px'>";
	str+="&nbsp;&nbsp;From: "+MakeSelect("mdType",false,collections,this.type);		// From where
	str+="</span></p><div id='mdAssets' class='pa-dialogResults'></div>";			// Scrollable container
	str+="<br><span id='useEra'>Limit by NCSS era: "+MakeSelect("mdEra",false,this.ncssEras)+"</span>"; 		// Add eras
	$(this.div).append(str+"</div>");												// Add to container
	if (this.era)	$("#mdEra")[0].selectedIndex=this.era;							// Set era
	this.LoadCollection();															// Load 1st collection
 	
 	$("#mdType").on("change", function() {											// ON CHANGE COLLECTION
			_this.type=$(this).val();												// Save for later											
		 	_this.LoadCollection();													// Load it
			});
	
	$("#mdFilter").on("change", function() {										// ON CHANGE FILTER
			_this.filter=$(this).val();												// Save for later											
			_this.LoadCollection();													// Load it
		});
	$("#mdFilterCollect").on("change", function() {									// ON CHANGE FILTER COLLECT
			_this.filterCollect=$(this).val();										// Save for later											
			_this.LoadCollection();													// Load it
		});
	$("#mdEra").on("change", function() {											// ON CHANGE ERA
			_this.era=$(this)[0].selectedIndex;										// Save era										
			_this.LoadCollection();													// Load it
		});
	}

	CImageFind.prototype.LoadCollection=function() 								// LOAD COLLECTION 
	{	
		$("#useEra").hide();														// Hide era selector
		LoadingIcon(true,32,"mdAssets");											// Show loading icon

		if (this.type == "PrimaryAccess") {											// From PA DB				
		if (this.filter.charAt(0) == "#") {
			var url="//viseyes.org/pa/loadshow.php?id="+this.filter.substr(1);
			getPicsFromShow=true;													// Divert 
			$.ajax( { url: url,  dataType: 'jsonp' }); 
			return;
			}
			
			$("#useEra").show();													// Show era selector
			var era=this.era;														// Index of era
			var url="//viseyes.org/pa/getresources.php";
			if (this.filter && this.era) url+="?q="+this.filter+"&era="+era;		// Q and era
			else if (this.filter) url+="?q="+this.filter.toLowerCase();				// Q
			else if (this.era) url+="?era="+era;									// Era
			$.ajax( { url: url,  dataType: 'jsonp' });
			}	
		else if (this.type == "WikiMedia") {										// From  Wikimedia			
			$.ajax( { url: "//commons.wikimedia.org/w/api.php",
				jsonp: "callback", 	dataType: 'jsonp', 
				data: { action: "query", list: "search", srsearch: "javascript",  format: "json",
						gimlimit:300, redirects:1, generator:"images", prop:"imageinfo", iiprop:"url|mediatype",	
						titles:this.filter
						},
				xhrFields: { withCredentials: true },
				success: function(res) {											// When loaded
					var i=0,o,u,data=[];
					if (res && res.query && res.query.pages) {						// If valid
						for (var p in res.query.pages)	{							// For each page
							p=res.query.pages[p];									// Turn into actual pointer to obj
							u=p.imageinfo[0];										// Point at URL section
							if (u.mediatype != "BITMAP")							// In not a bitmap
								continue;											// Ignore
							o={desc:"", era:"", link:"", title:"No title",id:++i};	// Shell
							if (p.title)											// If a title
								o.title=p.title.substring(5,p.title.length-4);		// Strip File: && ext
							o.src=u.url;											// Set url
							data.push(o);											// Add to array
							}
						}
					GetPaRes(data);													// Add to viewer
					},
				error: function(res) {												// On error
					trace(res)
					LoadingIcon();													// Hide loading icon
					}
				});
			}
			else if (this.type == "Flickr") {										// Flickr
				this.GetFlickrImage(function(o) {									// Flickr dialog
					LoadingIcon();													// Hide loading icon
					$("#addImg").prop("src",o.src);									// Show it
					$("#zoomaddBut").css("display","inline-block");					// Show zoom button
					$("#addUrl").val(o.src);										// Src
					$("#addTitle").val(o.title);									// Title
					});												
				}
			else if (this.type == "Library of Congress") {							// LOC
				$.ajax( { url: "https://www.loc.gov/photos?fo=json&c=300",
					jsonp: "callback", 	dataType: 'jsonp', 
					data: { q: this.filter },
					xhrFields: { withCredentials: true },
					success: function(res) {										// When loaded
						var i,o,data=[];
						for (i=0;i<res.results.length;++i) {						// For each result
								p=res.results[i];									// Point a obj
								if (!p.image_url)									// If no image
									continue;										// Skip				
								if (!p.image_url.length)							// If no image
									continue;										// Skip				
								o={desc:"", era:"", link:"", title:"No title",id:i};// Shell
								o.src=p.image_url[Math.max(0,p.image_url.length-1)];// Get last
								if (p.title)	o.title=p.title;					// Add title
								if (p.url)		o.link=p.url;						// Add Link
								data.push(o);										// Add to data
								}
							GetPaRes(data);											// Add to viewer
							},
						error: function(res) {										// On error
							trace(res)
							LoadingIcon();											// Hide loading icon
							}
					});
				}
			else if (this.type == "National Archives") {							// NARA
				$.ajax( {   url: "//catalog.archives.gov/api/v1?resultTypes=item",
					data: { q: this.filter },
					jsonp: "callback", 	dataType: 'json', 
					success: function(res) {										// When loaded
						res=res.opaResponse.results.result;							// Point at results
						var i,p,o,data=[];
						for (i=0;i<res.length;++i) {								// For each result
							if (!res[i].objects)									// No objects
								continue;											// Skip				
							p=res[i].objects.object									// Point a obj
							if (!p)													// No object
								continue;											// Skip				
							if (!p.file)											// No file
								continue;											// Skip				
							if (!p.file["@url"])									// No pic										
								continue;											// Skip				
							if (!p.file["@url"].match(/jpg|jpeg|gif|png/i))			// Not right format									
								continue;											// Skip				
							if (p.technicalMetadata && (p.technicalMetadata.size > 1000000))	// Too big
								continue;											// Skip				
							o={desc:"", era:"", link:"", title:"No title",id:i};	// Shell
							o.src=p.file["@url"];									// Get source
							p=res[i];												// Point a obj
							if (p.description && p.description.item && p.description.item.title) // If a title
								o.title= p.description.item.title;					// Add title
							data.push(o);											// Add to data
							}
						GetPaRes(data);												// Add to viewer
						},
						error: function(res) {										// Error
							trace(res);
							LoadingIcon();											// Hide loading icon
							}
						});
				}
			else if (this.type == "Cooper-Hewitt Museum") {							// COOPER-HEWITT MUSEUM
				$.ajax( { url: "//api.collection.cooperhewitt.org/rest",
					jsonp: "callback", 	dataType: 'jsonp', 
					data: { access_token:"a07c5bf33b26e047cd5eb1ad1734f16d",
							method:"cooperhewitt.search.objects",
							has_images:"true", page:1, per_page:300, format:"jsonp",
							query:this.filter
							},
						success: function(res) {										// When loaded
								var i,p,data=[];
							if (res && res.objects) {									// If valid
								for (i=0;i<res.objects.length;++i) {					// For each object
									p=res.objects[i];									// Point at it
									o={desc:"", era:"", link:"", title:"No title",id:i};// Shell
									if (p.title)		o.title=p.title;				// Set title
									if (p.description)	o.desc=p.description;			// Set desc
									if (p.url)			o.link=p.url;					// Set link
									if (!p.images)		continue;						// No images
									p=p.images[0];										// Point at primary image
									if (p.b)			o.src=p.b.url;					// Set scr to biggest 1st
									else if (p.n)		o.src=p.n.url;					// Set scr
									else 				continue;						// Don't add if no image
									data.push(o);										// Add to data
									}
								GetPaRes(data);											// Add to viewer
								}
							},
						error: function(res) {											// On error
							trace(res)
							LoadingIcon();												// Hide loading icon
							}
					});
				}
			else if (this.type == "Harvard Art") {									// HAVARD ART
				$.ajax( { url: "//api.harvardartmuseums.org/object",
					data: { apikey:"d0c70200-1ee4-11e8-a3db-659c806f7a23",
						"hasimage":1,
						title:this.filter
						},
					success: function(res) {											// When loaded
						var i,p,data=[];
						if (res && res.records) {										// If valid
							for (i=0;i<res.records.length;++i) {						// For each object
								p=res.records[i];										// Point at it
								o={desc:"", era:"", link:"", title:"No title",id:i};	// Shell
								if (p.description)	o.desc=p.description;				// Set desc
								if (p.title)		o.title=p.title;					// Set title
								if (p.url)			o.link=p.url;						// Set link
								if (p.primaryimageurl) o.src=p.primaryimageurl+"?width=1024";	// Get url
								else				continue;							// No image
								data.push(o);											// Add to data
								}
							GetPaRes(data);												// Add to viewer
							}
					},
				error: function(res) {													// On error
					trace(res)	
					LoadingIcon();														// Hide loading icon
					}
				});
			}
	}																					// End closure
																					
	function GetPaRes(data)															// HADLE JSONP AJAX LOAD
	{
		var i;
		LoadingIcon();																// Hide loading icon
		CImageFindObj.data=[];														// New results store 
		for (i=0;i<data.length;++i) 												// For each doc returned
			CImageFindObj.data.push(data[i]);										// Add result to array
		$("#numItemsFound").text(CImageFindObj.data.length);						// Show number of results
		CImageFindObj.DrawAsGrid();													// Draw
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SHOW RESULTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

CImageFind.prototype.DrawAsGrid=function()											// SHOW RESULTS AS GRID
{	
	var i,str="";
	var _this=this;																	// Save context
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<div class='pa-gridItem' id='mdres-"+i+"'>";							// Div start
		str+="<div class='pa-gridPic'>";											// Pic div start
		if (o.src)																	// If a thumbnail defined
			str+="<img src='"+o.src+"' width='100%'>";								// Add it
		str+="</div><span style='color:#27ae60'>"+(o.id)+". </span>";				// Add pic num
		str+=ShortenString(o.title,70);												// Add title
		str+="</div>";																// Close div	
		}
	$("#mdAssets").html(str);														// Add results to panel
	$('[id^="mdres-"]').off();														// Remove old handlers
	$('[id^="mdres-"]').on("click",function(e) {									// ON CLICK ON ITEM
		var id=$(this).prop("id").substr(6);										// Isolate id
		_this.Preview(id);															// Preview
		});
}

CImageFind.prototype.Preview=function(num)										// PREVIEW RESULT
{
	var o=this.data[num];															// Point at item
	if (o.src) {																	// If a pic
		$("#addImg").prop("src",o.src);												// Show it
		$("#zoomaddBut").css("display","inline-block");								// Show zoom button
		}
	$("#addUrl").val(o.src);														// Src
	$("#addTitle").val(o.title);													// Title
	$("#addDesc").val(o.desc);														// Desc
	$("#addLink").val(o.link);														// Link
	if (o.er0 && $("#addEra")[0])	$("#addEra")[0].selectedIndex=o.era;			// Set it
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FLICKR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

CImageFind.prototype.GetFlickrImage=function(callback)							// GET FLICKR IMAGE
{
		var apiKey="edc6ee9196af0ad174e8dd2141434de3";
		var trsty=" style='cursor:pointer;background-color:#f8f8f8' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' onMouseOut='this.style.backgroundColor=\"#f8f8f8\"'";
		var cols,photos,str;
		var curSet;
		var str="<span style='float:right'>Flickr user name: <input id='idName' type='text' value='"+GetCookie('flickr')+"' style='width:100px' class='pa-is'>";
		str+="&nbsp;&nbsp;<div id='getBut' class='pa-greenbs'>Get</div>&nbsp;&nbsp</span><br><br>";
		str+="<div style='display:inline-block;width:150px;height:290px;overflow-y:auto;padding:12px;border:1px solid #999;margin-left:8px;";
		str+="border-radius:8px 0 0 8px;background-color:#f8f8f8'>";			// Scrollable container
		str+="<dl id='setTable' style='font-size:13px;margin-top:2px;margin-bottom:2px'>";		// Add table
		str+="<dt><b>Choose album:<br><br></b></dt><dt></dt></dl></div>";		// Add header
		str+="<div id='picGal' style='display:inline-block;border-radius: 0 8px 8px 0;width:656px;height:290px;overflow-y:auto;background-color:#fff;padding:12px;border:1px solid #999'></div>";		// Scrollable container
		$("#mdAssets").html(str);												// Add results to panel

		$("#getBut").on("click",function() {									// ON GET CONTENT BUTTON
	   		cols=[];															// Reset array of collections
			Sound("click");														// Click
			var id=$("#idName").val();											// ID name
 			var url="https://api.flickr.com/services/rest/?method=flickr.people.findByUsername&format=rest&api_key="+apiKey+"&username="+id;
	 		SetCookie("flickr",id,7);											// Save cookie
 			$.ajax({ type:"GET", url:url, dataType:"xml",						// Call REST to get user id
  				success: function(xml){											// Om XML
	   				if ($(xml).find("err").length) {							// If an error tag
	   					$("#picGal").html("<p style='text-align:center;color:990000'><b>"+$(xml).find("err").attr("msg")+"</b></p>");
	   					return;													// Quit
	   					}
  	   				id=$(xml).find("user").attr("id");							// Get id
		 			GetContent(id);												// Get content from Flickr via user id
				}});														// Ajax get id end
 			});																	// Click end

	
	function GetContent(userId) 											// GET CONTENT
	{
		var i=0,o,oo;
		var url="https://api.flickr.com/services/rest/?method=flickr.collections.getTree&format=rest&api_key="+apiKey+"&user_id="+userId;
		$.ajax({ type:"GET", url:url, dataType:"xml",							// Call REST to get user tree	
			success: function(xml) {											// On XML
				url="https://api.flickr.com/services/rest/?method=flickr.photosets.getList&format=rest&api_key="+apiKey+"&user_id="+userId;
				$.ajax({ type:"GET", url:url, dataType:"xml",					// Call REST to get user tree	
					success: function(xml) {									// On XML
						o={};													// New obj
						o.sets=[];												// Array of sets
						$(xml).find("photoset").each( function() {				// For each set
							oo={};												// New obj
							oo.id=$(this).attr("id");							// Get set id
							oo.title=$(this).text().split("\n")[1];				// Get set title
							o.sets.push(oo);									// Add set
							});
						if (o.sets.length)										// If some sets
							cols.push(o);										// Add to array
						ChooseCollection(0);									// Show current collection
						}});													// Ajax get sets end
 				}});															// Ajax get tree end	
	}

	function ChooseCollection(id) 											// CHOOSE A COLLECTION
 	{
		var o=cols[0];															// Point at collection
		$("#setTable tr").remove();												// Remove all rows
		for (var j=0;j<o.sets.length;++j) {										// For each set			
 			str="<tr id='ids"+j+"' "+trsty+">";									// Row
			str+="<td>"+o.sets[j].title+"</td>"; 								// Add name
			$("#setTable").append(str);											// Add row
			
			$("#ids"+j).on("click", function() { 								// On set click
				Sound("click");													// Click
				$("#ids"+curSet).css({"color":"#000000","font-weight":"normal"});	// Uncolor last
				curSet=this.id.substr(3);										// Cur set
				$("#ids"+curSet).css({"color":"#990000","font-weight":"bold"});	// Color current
				ChooseSet(this.id.substr(3));									// Show current set
				});																// End set click
			}	
	}
 
	function ChooseSet(id) 													// CHOOSE A SET
 	{
		var i,j=0,str="",oo,t;
		id=cols[0].sets[id].id;										// Get set id
		var url="https://api.flickr.com/services/rest/?method=flickr.photosets.getphotos&format=rest&api_key="+apiKey+"&photoset_id="+id;
		$.ajax({ type:"GET", url:url, dataType:"xml",							// Call REST to get list of photos
			success: function(xml) {											// On XML
				photos=[];														// New photo array
				$(xml).find("photo").each( function() {							// For each set
					oo={};														// New obj
					oo.id=$(this).attr("id");									// Get id
					oo.secret=$(this).attr("secret");							// Get secret
					oo.farm=$(this).attr("farm");								// Get farm
					oo.server=$(this).attr("server");							// Get server
					oo.title=$(this).attr("title");								// Get title
					photos.push(oo);											// Add photo to array
					t=oo.title;													// Copy title				   								
					str+="<div id='idp"+(j++)+"' style='width:83px;border:1px solid #ccc;padding:4px;display:inline-block;text-align:center;font-size:9px;margin:6px;";
					str+="cursor:pointer;background-color:#f8f8f8' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' onMouseOut='this.style.backgroundColor=\"#f8f8f8\"'>";
					str+="<img title='"+oo.title+"' src='https://farm"+oo.farm+".staticflickr.com/"+oo.server+"/"+oo.id+"_"+oo.secret+"_s.jpg'><br>";
					str+="<div style='padding-top:4px;overflow:hidden'>"+oo.title.substr(0,Math.min(oo.title.length,15))+"</div></div>";
					});
				$("#picGal").html(str);											// Add to gallery
				for (i=0;i<photos.length;++i) {									// For each pic
					$("#idp"+i).on("click", function(){							// ON PHOTO CLICK
						Sound("click");											// Click
						ChoosePhoto(this.id.substr(3));							// Preview and choose photo
						});														// End photo click
					}
				}});															// Ajax get photos end
	}

	function ChoosePhoto(id) 												// PREVIEW AND CHOOSE PHOTO SIZES
 	{
		var o,sizes=[],i;
		var medium="",large="";
		var url="https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=rest&api_key="+apiKey+"&photo_id="+photos[id].id;
		$.ajax({ type:"GET", url:url, dataType:"xml",							// Call REST to get sizes
			success: function(xml) {											// On XML
				$(xml).find("size").each( function() {							// For each size
					o={};														// New obj
					o.source=$(this).attr("source");							// Get source
					o.label=$(this).attr("label");								// Get label
					if (o.label == "Medium") {									// If medium pic
						str="<img style='border:1px solid #666' src='"+o.source+"' height='284'>";	// Image
						medium=o.source;
						}
					if (o.label == "Large")										// If large pic
						large=o.source;
					sizes.push(o);												// Add size to array
					});
							
				str+="<div style='float:right;text-align:right'><br>";
				if (medium) 													// If medium pic
					str+="<div id='useMed' class='pa-greenbs'>Add medium</div><br><br>";
				if (large) 														// If large pic
					str+="<div id='useLar' class='pa-greenbs'>Add large</div>";
				$("#picGal").html(str+"</div>");								// Fill gallery
				o={desc:"", era:"", link:"", title:"No title",id:i};			// Shell
				if (photos[id].title)	o.title=photos[id].title;				// Set it
				
				$("#useMed").on("click", function() {							// On button click
					o.src=medium;												// Use medium
					callback(o);												// Send url to cb
					});
				$("#useLar").on("click", function() {							// On button click
					o.src=large;												// Use large
					callback(o);												// Send url to cb
					});
				}});															// Ajax get sizes end
	  	}
	}																			// End closure function


