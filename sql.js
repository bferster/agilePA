
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  NODEJS SQLITE SERVER

//	resides in sql folder under web access root
//	npm install sqlite3 -g
//	npm install forever
//	npm install os
//	open port:8081
//	localhost: node sql.js
//	server: cd /opt/bitnami/wordpress/sql/ws.js | forever stop ws.js | forever start ws.js 
//	admin with sqlStudio.exe in c:/cc

////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var db;
	const sqlite3 = require('sqlite3').verbose();
	const os = require("os");	
	let local=os.hostname().match(/^bill|desktop/i);									// Running on localhost?
	var dbPath=local ? "../agileSQL/agile.db" : "./db/agile.db";						// Set path

	Open()
//	Save('a@b.com','666',"new one","{someData:123}")
	LogIn("a@b.com","666","PALOGIN");
//Load("a@b.com","PA")
	Close();


// SERVER /////////////////////////////////////////////////////////////////////////////////////////////////////



	
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
	
	function SendResponse(resp)
	{
		console.log(resp);
	}

	function LogIn(email, password, type)											// LOGIN
	{
		db.all(`SELECT * FROM db WHERE email = '${email}' AND type = '${type}'`, (err, rows) => {	// Look for email
			if (err) console.error(err.message);										// An error
			else{																		// Good query
				if (!rows.length) {														// No emails matched, must be a new user
					db.run(`INSERT INTO db (email, password, date, type) VALUES('${email}','${password}',datetime("now"),'${type}')`, 
						function(err) {													// Add their LOGIN											
							if (err)	SendResponse(err.message);						// Error
							else 		SendResponse("REGISTER");						// Registered
							return;														// Quit
							});
						}
				if (rows[0].password &&	(rows[0].password == password))	SendResponse("OK");	// A valid user
				else 													SendResponse("PASSWORD");	// Bad password
				}
			});
	}

	function Load(email, type)														// GET ROW(S) BY EMAIL
	{
		db.all(`SELECT * FROM db WHERE email = '${email}' AND type = '${type}'`, (err, rows) =>{ // Query
			if (err)	SendResponse(err.message);										// Error
			else 		SendResponse(rows);												// Registered
			});
		}

	function Save(email, password, title, data, type)								// SAVE ROW
	{
		db.run(`INSERT INTO db (email, password, date, type, title, data) 
				VALUES('${email}','${password}',datetime("now"),'${type}','${title}','${data}')`, 
				function(err) {															// Insert
					if (err)	SendResponse(err.message);								// Error
					else 		SendResponse(this.lastID);								// New row
					});
	}


// HELPERS ////////////////////////////////////////////////////////////////////////////////////////////////////////

	function trace(msg) { console.log(msg); }