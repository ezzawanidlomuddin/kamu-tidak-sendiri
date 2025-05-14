var express = require("express");
var app = express();
var path = require("path");
require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/bdc-key", function (req, res) {
    res.json({ key: process.env.BDC_API_KEY || "" });
});

var server = app.listen(5000, function () {
    console.log("Express App running at http://127.0.0.1:5000/");
});
