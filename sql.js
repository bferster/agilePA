
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
//	Insert('a@b.com','666',"new one","{someData:123}")
//	GetById(0)
	LogIn("a@b.com","999","PALOGIN");
	Register("a@c.com","999","PALOGIN");
Close();

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
	
	function Insert(email, password, title, data)									// INSERT ROW
	{
		db.run(`INSERT INTO pa (email, password, date, deleted, type, title, data) 
				VALUES('${email}','${password}',datetime("now"),'0','PA','${title}','${data}')`, 
				function(err) {
					if (err) console.error(err.message);
					else console.log(`A row has been inserted with rowid ${this.lastID}`);
					});
	}

	function GetById(id)															// GET ROW BY ID
	{
		db.serialize(() => {
			db.all(`SELECT * FROM pa WHERE id = '${id}'`, (err, row) => {
			if (err) console.error(err.message);
			else 	 console.log(row);
			});
		});
	}

	function GetByEmail(email)														// GET ROW(S) BY EMAIL
	{
		db.serialize(() => {
			db.all(`SELECT * FROM pa WHERE email = '${email}'`, (err, row) => {
			if (err) console.error(err.message);
			else 	 console.log(row);
			});
		});
	}

// ACTIONS /////////////////////////////////////////

	function LogIn(email, password, type)
	{
		db.all(`SELECT * FROM pa WHERE email = '${email}' AND password = '${password}' AND type = '${type}'`, (err, row) => {
			if (err) console.error(err.message);
			else 	 console.log(row.length);
			});
	}

	function Register(email, password, type)
	{
		db.run(`INSERT INTO pa (email, password, date, type) 
				VALUES('${email}','${password}',datetime("now"),'${type}')`, 
				function(err) {
					if (err) console.error(err.message);
					else console.log(1);
					});
	}


	function trace(msg) { console.log(msg); }