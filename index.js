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
server.post('/', function (request, response) {
let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
let parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
let inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts
let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
let _Query =request.body.result.resolvedQuery;
console.log("action: "+action+""+"inputContexts: "+inputContexts);
});
server.post('/getUberDetails', function (req, res) {
    let _query ='';
    let movieToSearch = req.body.result && req.body.result.parameters && req.body.result.parameters.location ? _query=req.body.result.parameters.location : _query=req.body.result.parameters.location ;
    console.log(_query);
    let reqUrl = encodeURI('http://api.openweathermap.org/data/2.5/weather?q=' + _query + '&appid=c8608c37f0247f5a563aa6b7cc7d0dac');

    requestAPI(reqUrl)
        .then(function (data) {
              console.log( data)
            res.json({
                speech: "data",
                displayText: data[0].coord,
                source: 'getUberDetails'
            });
        })
        .catch(function (err) {
            console.error(err);
            return res.json({
                speech: err,
                displayText: 'Something went wrong!',
                source: 'getUberDetails'
            });
        })
    
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});