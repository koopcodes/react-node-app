const express = require('express');
const app = express();

app.use('/', (req, res, next) => {
	res.send('Welcome to Nodact C.R.U.D.');
});

module.exports = app;
