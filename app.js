// TODO : sanitize sql statements
// TODO : check if person was already added
// check for commas in csv
// handle empty fields server side
// sometimes doesn't return all data for table
// add admin access

var express = require("express");
var fs = require('fs');
var pg = require('pg');

var latestVersion = 'v0.1';
var db_url = process.env.DATABASE_URL;
var client = new pg.Client(db_url);
client.connect();

var createRegTable = "CREATE TABLE IF NOT EXISTS Registrants2013 ( \
		lastname 				varchar(255),	\
		firstname 				varchar(255),	\
		address 				varchar(255),	\
		phonenumber				varchar(255),	\
		amountpaid				integer,	\
		emergencycontactname	varchar(255),	\
		emergencycontactnumber	varchar(255),	\
		legalsignaturerequired	integer \
	);";
client.query(createRegTable);

var createEvalTable = "CREATE TABLE IF NOT EXISTS Evaluation2013 ( \
		question1 				varchar(255),	\
		question2 				varchar(255),	\
		question3 				varchar(255) 	\
	);";
client.query(createEvalTable);

var app = express();

app.use(express.bodyParser());
app.use(express.logger());
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
	res.sendfile('views/retreat-forms.html');
});

app.get('/evaluation', function(req, res) {
	res.sendfile('views/evaluation.html');
});

app.get('/' + latestVersion + '/retreat/evaluations', function(req, res) {
	var sqlStmt = "SELECT * FROM Evaluation2013";
	var payload = [];
	var query = client.query(sqlStmt);
	query.on('row', function(row) {
		console.log("ROW: "+ JSON.stringify(row));
		payload.push(row);
	});
	query.on('error', function(error) {
		console.error(error);
		res.send(500);
	});
	query.on('end',function(result) {
		res.send(payload);
	});
});

app.get('/' + latestVersion + '/retreat/evaluations/export', function(req, res) {
	var sqlStmt = "SELECT * FROM Evaluation2013";
	var payload = "What was good about the retreat?, What did you learn? , What suggestions do you have for future retreat?\n";
	var query = client.query(sqlStmt);
	query.on('row',function(row) {
		var temp = "";
		temp += row.question1 + ',';
		temp += row.question2 + ',';
		temp += row.question3;
		payload += temp + '\n';
	});
	query.on('error', function(error) {
		console.error(error);
		res.send(500);
	});
	query.on('end', function(result) {
		var today = new Date();
		var fileName = "evaluation" + (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear() + ".csv";
		fs.writeFile(fileName, payload,function(err){
			if(err) {
				console.error(err);
		        res.send(500);
		    } else {
		        res.send({fileName: fileName});
		    }
		});
	});
});

app.get('/evaluation/view', function(req, res) {
	res.sendfile('views/evaluation-admin.html');
});

app.post('/' + latestVersion + '/retreat/evaluations/submit', function(req, res) {
	console.log(JSON.stringify(req.body));
	if (req.body.question1.trim() == '' &&
		req.body.question2.trim() == '' &&
		req.body.question3.trim() == '') {
		res.sendfile('views/evaluation-typ.html');
		return;
	}

	var escape = function(str) {
		return str.replace(/'/g, "''");
	};

	console.log(escape(req.body.question1));

	var sqlStmt = "INSERT INTO Evaluation2013 VALUES ('"
		+ escape(req.body.question1) + "','"
		+ escape(req.body.question2) + "','"
		+ escape(req.body.question3)
		+ "');";

	client.query(sqlStmt, 
		function(err) {
			if (err) {
				console.log(err);
				res.send(500);
			}else {
				res.sendfile('views/evaluation-typ.html');
			}
		}
	);
});

app.get('/download/:filename', function(req, res) {
	res.sendfile(req.params.filename);
});

app.post('/' + latestVersion + '/retreat/registrants', function(req, res) {
	var sqlStmt = "INSERT INTO Registrants2013 VALUES ('"
		+ req.body.lastName + "','"
		+ req.body.firstName + "','"
		+ req.body.address + "','"
		+ req.body.phoneNumber + "',"
		+ req.body.amountPaid + ",'"
		+ req.body.emName + "','"
		+ req.body.emNumber + "',"
		+ req.body.under18
		+ ");";

	client.query(sqlStmt, 
		function(err) {
			var code = err?500:200;
			res.send(code);
		}
	);
});

app.get('/' + latestVersion + '/retreat/registrants/delete', function(req,res) {
	if (req.query.lastName && req.query.firstName) {
		var sqlStmt = "DELETE FROM Registrants2013 WHERE firstname='" + req.query.firstName + "' AND lastname='" + req.query.lastName + "';";
		client.query(sqlStmt,function(err){
			var code = err?500:200;
			res.send(code);
		});
	}else {
		// retreatFormDB.serialize(function() {
		// 	var sqlStmt = "DELETE FROM Registrants2013";
		// 	retreatFormDB.run(sqlStmt);
		// 	retreatFormDB.run(createStmt,function(err){
		// 		var code = err?500:200;
		// 		res.send(code);
		// 	});
		// });
	}
});

app.get('/' + latestVersion + '/retreat/registrants', function(req, res) {
	var sqlStmt = "SELECT * FROM Registrants2013";
	var payload = [];
	var query = client.query(sqlStmt);
	query.on('row', function(row) {
		console.log("ROW: "+ JSON.stringify(row));
		payload.push(row);
	});
	query.on('error', function(error) {
		console.error(error);
		res.send(500);
	});
	query.on('end',function(result) {
		res.send(payload);
	});
});

app.get('/' + latestVersion + '/retreat/registrants/export', function(req,res) {
	var sqlStmt = "SELECT * FROM Registrants2013";
	var payload = "Last Name, First Name,Address,Phone Number,Amount Paid, Emergency Contact Name, Emergency Contact Number, Legal Signature Required\n";
	var query = client.query(sqlStmt);
	query.on('row',function(row) {
		var temp = "";
		temp += row.lastname + ',';
		temp += row.firstname + ',';
		temp += row.address + ',';
		temp += row.phonenumber + ',';
		temp += row.amountpaid / 100 + ',';
		temp += row.emergencycontactname + ',';
		temp += row.emergencycontactnumber + ',';
		temp += row.legalsignaturerequired?'Yes':'No';

		payload += temp + '\n';
	});
	query.on('error', function(error) {
		console.error(error);
		res.send(500);
	});
	query.on('end', function(result) {
		var today = new Date();
		var fileName = "registrants" + (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear() + ".csv";
		fs.writeFile(fileName, payload,function(err){
			if(err) {
				console.error(err);
		        res.send(500);
		    } else {
		        res.send({fileName: fileName});
		    }
		});
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});



