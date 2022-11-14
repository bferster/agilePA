
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  NODEJS SQLITE SERVER

//	resides in sql folder under web access root
//	npm install sqlite3
//	npm install forever
//	npm install os
//	npm install fs
///	open port:8081
//	local: node sql.js
//	server: cd /opt/bitnami/wordpress/pa | forever stop sql.js | forever start sql.js 
//	admin with sqlStudio.exe in c:/cc

	const sqlite3 = require('sqlite3').verbose();
	const os = require("os");	
	const https = require('https');
	const http = require('http');
	const fs = require('fs');

//SERVER ///////////////////////////////////////////////////////////////////////////////////////////////////

	const local=os.hostname().match(/^bill|desktop/i) ? true : false;					// Running on localhost?

	const OnRequest = function (req, res) 												// REQUEST LOOP
		{
		try{
			const headers={																	// Create headers
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, GET',
				'Access-Control-Max-Age': 2592000 // 30 days
				 };
			res.writeHead(200, headers);													// Write headers
			let e=req.url.match(/email=(.*)&/);												// Get email
			let pw=req.url.match(/password=(.*)/);											// Get pw

			if (req.url.match(/q=login&/)) 													// LOGIN
				LogIn(e[1], pw[1], "PALOGIN",(r)=>{ SendResponse(r, res) });				// Do login
			else if (req.url.match(/q=list&/))												// LIST
				List(e[1],"PA",(r)=>{ SendResponse(JSON.stringify(r), res); })				// Get from DB
			else if (req.url.match(/q=load&id=/))											// LOAD
				Load(req.url.match(/id=(.*)/)[1],(r)=>{ SendResponse(JSON.stringify(r), res); }) // Get from DB
			else if (req.url.match(/q=save&/)) {											// SAVE
				let body="";																// Hold body
				req.on('data', function(data) {	body+=data;	});								// ON data
				req.on('end', function() {													// On done
					let title=JSON.parse(body).title;										// Get title
					Save(e[1], pw[1], title, body, "PA", (r)=>{ SendResponse(r, res); });	// Save to DB
					});
				}
		}
		catch(e) { console.log(e); }
	}

	let server;
	if (!local) {																		// If on web
		server=https.createServer({														// Create an https server
			cert: fs.readFileSync("/opt/bitnami/apache/conf/agileteacher.org.crt"),		// Point at cert
			key: fs.readFileSync("/opt/bitnami/apache/conf/agileteacher.org.key")		// And key
			},OnRequest);																// Add listener
		}
	else server=http.createServer(OnRequest);											// Create an http server
	server.listen(8081);																// Listen on port 8081
	trace("SQL nodeJS Server running on "+os.hostname()+":"+server.address().port);		// Log server stats

// SQL ////////////////////////////////////////////////////////////////////////////////////////////////////////

	var db;																				// Holds database
	const dbPath=local ? "../agileSQL/agile.db" : "../db/agile.db";						// Set path

	function Open()																	// OPEN DB
	{
		db=new sqlite3.Database(dbPath, (err)=> {										// Open DB
			if (err) console.error(err.message);										// If err
			else	 console.log('Connected to the AgileTeacher database');				// Good open
			});
		}

	function Close()																// CLOSE DB
	{
		db.close((err)=>{																// Close			
			if (err)  console.error(err.message);										// If err
			//else	  console.log('Close the database connection.');					// Good close				
			});
	}
	
	function SendResponse(msg, res)													// SEND RESPONSE
	{
		res.end(msg);																	// Send message
		console.log(msg.substring(0,128));												// Log
	}	

	function LogIn(email, password, type, callback)										// LOGIN
	{
		let role="";
		try {
			Open();																			// Open DB
			db.all(`SELECT * FROM db WHERE email = '${email}' AND type = '${type}' AND role = '${role}'`, (err, rows) => {	// Look for email
				if (err) console.error(err.message);										// An error
				else{																		// Good query
					if (!rows.length) {														// No emails matched, must be a new user
						db.run(`INSERT INTO db (email, password, date, type) VALUES('${email}','${password}',datetime("now"),'${type}')`, 
							function(err) {													// Add their LOGIN											
								if (err)	callback(err.message);							// Error
								else 		callback("REGISTER");							// Registered
								});
						return;																// Quit
						}
					if (rows[0] && rows[0].password &&	(rows[0].password == password))	callback("OK");			// A valid user
					else 																callback("PASSWORD");	// Bad password
					}
				});
			Close();																		// Close DB
		}
		catch(e) { console.log(e) }
	}

	function List(email, type, callback)												// GET LIST OF ROW(S) BY EMAIL
	{
		try{
			Open();																			// Open DB
			db.all(`SELECT * FROM db WHERE email = '${email}' AND type = '${type}'`, (err, rows) => { 	// Query
				if (err)	callback(err.message);											// Error
				else 		callback(rows);													// Registered
				});
			Close();																		// Close db
		}
		catch(e) { console.log(e) }
	}

	function Load(id, callback)															// GET ROW BY ID
	{
		try{
			Open();																			// Open DB
			db.all(`SELECT * FROM db WHERE id = '${id}'`, (err, row) => { 					// Query
				if (err)	callback(err.message);											// Error
				else 		callback(row);													// Registered
				});
			Close();																		// Close db
		}
		catch(e) { console.log(e) }
	}

	function Save(email, password, title, data, type, callback)							// SAVE ROW
	{
			try{
			Open();																		// Open DB
			db.run(`INSERT INTO db (email, password, date, type, title, data) 
					VALUES('${email}','${password}',datetime("now"),'${type}','${title}','${data}')`, 
					function(err) {														// Insert
						if (err)	callback(err.message);								// Error
						else 		callback(""+this.lastID);							// Return row id
				});
			Close();																	// Close db
			}
		catch(e) { console.log(e) }
	}


// HELPERS ////////////////////////////////////////////////////////////////////////////////////////////////////////

function trace(msg, p1, p2, p3, p4)																// CONSOLE 
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


