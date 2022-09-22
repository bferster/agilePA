
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  NODEJS SQLITE SERVER

//	resides in sql folder under web access root
//	npm install sqlite3
//	npm install forever
//	npm install os
//	npm install fs
///	open port:8081
//	localhost: node sql.js
//	server: cd /opt/bitnami/wordpress/pa | forever stop sql.js | forever start sql.js 
//	admin with sqlStudio.exe in c:/cc

////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const sqlite3 = require('sqlite3').verbose();
	const os = require("os");	
	const https = require('https');
	const http = require('http');
	const fs = require('fs');

	var db;																				// Holds database
	const local=os.hostname().match(/^bill|desktop/i);									// Running on localhost?
	const dbPath=local ? "../agileSQL/agile.db" : "./db/agile.db";						// Set path

//	Save('a@b.com','666',"new one","{someData:123}")
//	Load("a@b.com","PA",(r)=>{trace(r)})


// SERVER /////////////////////////////////////////////////////////////////////////////////////////////////////

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Hello, World!');
  trace(123)
}

const server = http.createServer(requestListener);
server.listen(8081);

/*


	function OnRequest(req, res) {
		try{
			if (req.url.match(/q=login&/)) {
			let e=(req.url.match(/email=(.*)&/))[1];
			let pw=(req.url.match(/password=(.*)/))[1];
			LogIn(e, pw, "PALOGIN",(r)=>{ SendResponse(r, res); });	
			}
		else if (req.url.match(/q=load&/)) {
			Load("a@b.com","PA",(r)=>{ SendResponse(JSON.stringify(r), res); })
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
*/

	trace("Server running")
// SQL ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
			else	  console.log('Close the database connection.');					// Good close				
			});
	}
	
	function SendResponse(msg, res)													// SEND RESPONSE
	{
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(msg);																	// Send JSON
		console.log(msg);																// Log
	}	

	function LogIn(email, password, type, callback)										// LOGIN
	{
		try {
			Open();																			// Open DB
			db.all(`SELECT * FROM db WHERE email = '${email}' AND type = '${type}'`, (err, rows) => {	// Look for email
				if (err) console.error(err.message);										// An error
				else{																		// Good query
					if (!rows.length) {														// No emails matched, must be a new user
						db.run(`INSERT INTO db (email, password, date, type) VALUES('${email}','${password}',datetime("now"),'${type}')`, 
							function(err) {													// Add their LOGIN											
								if (err)	callback(err.message);							// Error
								else 		callback("REGISTER");							// Registered
								return;														// Quit
								});
							}
					if (rows[0] && rows[0].password &&	(rows[0].password == password))	callback("OK");			// A valid user
					else 																callback("PASSWORD");	// Bad password
					}
				});
			Close();																		// Close DB
		}
		catch(e) { console.log(e) }
	}

	function Load(email, type, callback)												// GET ROW(S) BY EMAIL
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

	function Save(email, password, title, data, type)								// SAVE ROW
	{
			try{
			Open();																		// Open DB
			db.run(`INSERT INTO db (email, password, date, type, title, data) 
					VALUES('${email}','${password}',datetime("now"),'${type}','${title}','${data}')`, 
					function(err) {														// Insert
						if (err)	SendResponse(err.message);							// Error
						else 		SendResponse(this.lastID);							// New row
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


