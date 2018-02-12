const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const requestAPI = require('request-promise');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

var dataToSend = "";
server.post('/get-movie-details', function (req, res) {
    let movieToSearch = req.body.result && req.body.result.parameters && req.body.result.parameters.movie ? req.body.result.parameters.movie : 'The Godfather';
    let reqUrl = encodeURI('http://api.openweathermap.org/data/2.5/weather?q=' + movieToSearch + '&appid=c8608c37f0247f5a563aa6b7cc7d0dac');

    requestAPI(reqUrl)
        .then(function (data) {
            //   console.log( data)
            res.json({
                speech: "data",
                displayText: data[0].coord,
                source: 'get-movie-details'
            });
        })
        .catch(function (err) {
            console.error(err);
            return res.json({
                speech: err,
                displayText: 'Something went wrong!',
                source: 'get-movie-details'
            });
        })
    
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});