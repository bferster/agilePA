
/* NODEJS SQLITE SERVER

	npm install sqlite3 -g
	npm install https
	npm install forever
	open port:8081
	localhost: node sql.js
	server: cd /opt/bitnami/wordpress/pa | forever stop sql.js | forever start sql.js 

*/

	const sqlite3 = require('sqlite3').verbose();
	var db;

	Open();
	Insert('a@b.com','666',"new one","{someData:123}")
	GetByEmail("a@b.com");

	Close();

	function Open()																	// OPEN DB
	{
		db=new sqlite3.Database('./db/agilePA.db', (err)=> {							// Open DB
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
