// TODO : sanitize sql statements

var express = require("express");
var sqlite3 = require("sqlite3").verbose();
var retreatFormDB = new sqlite3.Database('retreat.db');

var latestVersion = 'v0.1';

retreatFormDB.run("CREATE TABLE IF NOT EXISTS Registrants2013 ( \
		LastName 				TEXT,	\
		FirstName 				TEXT,	\
		Address 				TEXT,	\
		PhoneNumber				TEXT,	\
		AmountPaid				INTEGER,	\
		EmergencyContactName	TEXT,	\
		EmergencyContactNumber	TEXT,	\
		LegalSignatureRequired	INTEGER \
	);");

var app = express();

app.use(express.bodyParser());
app.use(express.logger());
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
	res.sendfile('views/retreat-forms.html');
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

	retreatFormDB.run(sqlStmt, 
		function(err) {
			var code = err?500:200;
			res.send(code);
		}
	);
});

app.get('/' + latestVersion + '/retreat/registrants/delete', function(req,res) {
	var sqlStmt = "DROP TABLE IF EXISTS Registrants2013";
	retreatFormDB.run(sqlStmt,function(err){
		var code = err?500:200;
		res.send(code);
	});
});

app.get('/' + latestVersion + '/retreat/registrants', function(req, res) {
	var sqlStmt = "SELECT * FROM Registrants2013";
	var payload = [];
	retreatFormDB.each(sqlStmt,
		function(err, row) {
			payload.push(row);
		},
		function(err, num) {
			console.log(num + ' rows retrieved');
			res.send(payload);
		}
	);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});



