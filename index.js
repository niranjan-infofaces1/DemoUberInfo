const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const requestAPI = require('request-promise');
//const API_KEYS = require('/Key/API_KEY')
const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

var dataToSend = "";
let action = "";
server.post('/', function (request, response) {
    ProcessRequest(request, response)
});
function ProcessRequest(req, res) {
    action = req.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
    let parameters = req.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
    let inputContexts = req.body.result.contexts; // https://dialogflow.com/docs/contexts
    let requestSource = (req.body.originalRequest) ? req.body.originalRequest.source : undefined;
    let _Query = req.body.result.resolvedQuery;
    //console.log("action: "+action);
    console.log("inputContexts: " + inputContexts);
    console.log("parameters :" + JSON.stringify(parameters));
    console.log("requestSource :" + requestSource);
    const actionHandlers = {
        'getUberDetails': () => {
            let _query = '';
            _query = req.body.result.parameters.location;
            console.log(_query);
            let reqUrl = encodeURI('http://api.openweathermap.org/data/2.5/weather?q=' + _query + '&appid=c8608c37f0247f5a563aa6b7cc7d0dac');

            requestAPI(reqUrl)
                .then(function (data) {
                    console.log(data)
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

        },
        'getProductDetails': () => {
            let Url = 'https://api.uber.com/v1.2/products?';    // #1
            let latitude = '13.0827';                           // #2
            let longitude = '80.2707'                           // #3
        //    let token = API_KEYS.UBER_API_KEYS.SERVER_TOKEN;    // #4
            //https://api.uber.com/v1.2/products?latitude=13.0827&longitude=80.2707&server_token=heroku logs --app demouber --tailheroku logs --app demouber --tail
            let reqUrl = encodeURI(Url + 'latitude=' + latitude + '&' + 'longitude=' + longitude + "&" + "server_token=9q6z4n75sEhTzekU0eEXIo8_e1yePXOZ47SSVEeD")
            console.log(reqUrl);
            requestAPI(reqUrl)
                .then(function (data) {
                    let _productsData = JSON.parse(data);
                    var _DisplayName = [];
                    var _productsCount = Object.keys(_productsData.products).length;
                    for (var i = 0; i < _productsCount; i++) {
                        _DisplayName.push(_productsData.products[i].display_name)
                    }
                   // res.json({ data: _DisplayName.toString() })
                    return res.json({
                        speech: _DisplayName.toString(),
                        displayText:_DisplayName.toString(),
                        source: 'getProductDetails'
                    });
                })
                .catch(function (err) {
                    console.error(err);
                //    res.json({ Error: err })
                return res.json({
                    speech: "Sorry no data found",
                    displayText: "Sorry no data found",
                    source: 'getProductDetails'
                });
                })
        }
    };
    if (!actionHandlers[action]) {
        action = 'default';
    }
    actionHandlers[action]();
}
server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});