require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const isProduction = process.env.NODE_ENV === 'production';
const mongoose = require('mongoose');
const path = require('path');
const port = process.env.PORT || 8000;
const session = require('express-session');
const favicon = new Buffer(
	'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEefcABHj3AAR59wAEefcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUVFQAXFxcAFxAHEgdo0BoFevgZBXn1AAR59wAXFxcAFxcXBBcXFxIWFhYAFhYWAAAAAAAAAAAAAAAAABUVFQAXFxcAFxcXMhcWFZQLU6AnBXr3iQV59SQFefUAFxcXABcXFxAXFxeUFxcXLxcXFwAWFhYAAAAAABUVFQAXFxcAFxcXLxcXF88XFxeyGAcABwV59okFefW9BXn1IgpcsgAXFxcJFxcXthcXF8sXFxcrFxcXABYWFgAXFxcAFxcXLhcXF80XFxfKFxcXKwCV/wUFefVIBXn18wV59b0FefUjDkeFABcXFy8XFxfOFxcXyRcXFysXFxcAFxcXKhcXF8wXFxfTFxcXKg5IhgAFefVEBXn1xAV59fkFefX/BXn1vgV59SUOR4MAFxcXLhcXF9YXFxfJFxcXJxcXFyQXFxe/FxcX2RcXFzYSMlQABXr3BwV59XgFefX2BXn18AV59XwFefYwEjZdABcXFzcXFxfbFxcXvhcXFyIXFxcAFxcXIxcXF78XFxfWFxcXNxMwUAAFefcGBXn1eAV59fAFefVUCmC8ABcXFzgXFxfXFxcXvxcXFyIXFxcAFxcXABcXFwAXFxcjFxcXwRcXF7kWFhYJDkJ5AAV59QYFefV9BXn2lxIuSw0XFxe7FxcXwRcXFyMXFxcAFhYWAAAAAAAXFxcAFxcXABcXFyYXFxeHFhYWDxYWFgAFefUABXn1CQV6+FcMUZsnFxYViBcXFyYXFxcAFhYWAAAAAAAAAAAAAAAAABYWFgA2NjYAFhYWDBYWFgMVFRUAAAAAAAV59gAEff4FDFOfCRcUEQwWFhYAFxcXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD5/wAA4ccAAODHAADAQwAAgCEAAAgQAAAIEAAAhCEAAMIDAADjBwAA448AAP//AAD//wAA//8AAA==', 'base64',
);

app.get('/favicon.ico', function(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Length', favicon.length);
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=2592000'); // expires after a month
  res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());
  res.end(favicon);
});
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist'))); // Serve static files from the React app
app.use(
	session({
		secret: process.env.kryptoSecret,
		cookie: {maxAge: 60000},
		resave: false,
		saveUninitialized: false,
	})
);

if (!isProduction) {
	app.use(errorHandler());
}

mongoose.promise = global.Promise;
mongoose.connect('mongodb://koopdev:t3Ear525!@ds041177.mlab.com:41177/nodact-blog');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('DB CONNECTED');
});
mongoose.set('debug', true);

require('./db/models/Articles'); // Add models
// Add routes
app.use(require('./routes'));

app.use((req, res, next) => {
	const err = new Error('404 Not Found');
	err.status = 404;
	next(err);
});

if (!isProduction) {
	app.use((err, req, res) => {
		res.status(err.status || 500);

		res.json({
			errors: {
				message: err.message,
				error: err,
			},
		});
	});
}

app.use((err, req, res) => {
	res.status(err.status || 500);

	res.json({
		errors: {
			message: err.message,
			error: {},
		},
	});
});

const server = app.listen(port, () =>
	console.log(`Listening on port ${port}`)
);

