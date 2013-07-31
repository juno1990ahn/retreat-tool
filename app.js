// TODO : sanitize sql statements
// TODO : check if person was already added
// check for commas in csv
// sometimes doesn't return all data for table

var express = require("express");
var fs = require('fs');
var pg = require('pg');

var latestVersion = 'v0.1';
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5000'
var client = new pg.Client(connectionString);
client.connect();

var createStmt = "CREATE TABLE IF NOT EXISTS Registrants2013 ( \
		LastName 				TEXT,	\
		FirstName 				TEXT,	\
		Address 				TEXT,	\
		PhoneNumber				TEXT,	\
		AmountPaid				INTEGER,	\
		EmergencyContactName	TEXT,	\
		EmergencyContactNumber	TEXT,	\
		LegalSignatureRequired	INTEGER \
	);";
client.query(createStmt);

var app = express();

app.use(express.bodyParser());
app.use(express.logger());
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
	res.sendfile('views/retreat-forms.html');
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
		var sqlStmt = "DELETE FROM Registrants2013 WHERE FirstName='" + req.query.firstName + "' AND LASTNAME='" + req.query.lastName + "';";
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
		temp += row.LastName + ',';
		temp += row.FirstName + ',';
		temp += row.Address + ',';
		temp += row.PhoneNumber + ',';
		temp += row.AmountPaid / 100 + ',';
		temp += row.EmergencyContactName + ',';
		temp += row.EmergencyContactNumber + ',';
		temp += row.LegalSignatureRequired?'Yes':'No';

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



