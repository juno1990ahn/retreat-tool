var express = require("express");
var sqlite3 = require("sqlite3").verbose();
var retreatFormDB = new sqlite3.Database('retreat.db');

var latestVersion = 'v0.1';

retreatFormDB.run("CREATE TABLE Registrants2013 ( \
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
app.use(express.logger());

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
	res.sendfile('views/retreat-forms.html');
});

app.post('/' + latestVersion + '/retreat/registrants', function(req, res) {
	retreatFormDB.run("INSERT INTO Registrants2013 VALUES ( \
			
		");
});

app.get('/' + latestVersion + '/retreat/registrants', function(req, res) {

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});