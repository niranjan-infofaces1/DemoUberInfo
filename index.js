const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const requestAPI = require('request-promise');
const DialogflowApp = require('actions-on-google').DialogflowApp;
//const API_KEYS = require('/Key/API_KEY')
const googleAssistantRequest = 'google';
const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

var dataToSend = "";
let action = "";
server.post('/', function (request, response) {
    console.log(' Request headers: ' + JSON.stringify(request.headers));
    console.log(' Request body: ' + JSON.stringify(request.body));

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
    const app = new DialogflowApp({ request: req, response: res });
    const actionHandlers = {
        'input.welcome': () => {
            // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
            if (requestSource === googleAssistantRequest) {
                sendGoogleResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
            } else {
                sendResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
            }
        },
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

                    if (requestSource === googleAssistantRequest) {
                        sendGoogleResponse(_DisplayName.toString()); // Send simple response to user
                    } else {
                        sendResponse(_DisplayName.toString()); // Send simple response to user
                    }
                    // res.json({ data: _DisplayName.toString() })
                  /*  return res.json({
                        speech: _DisplayName.toString(),
                        displayText: _DisplayName.toString(),
                        source: 'getProductDetails'
                    });
                    */
                })
                .catch(function (err) {
                    console.error(err);
                    //    res.json({ Error: err })
                    if (requestSource === googleAssistantRequest) {
                        sendGoogleResponse(err); // Send simple response to user
                    } else {
                        sendResponse(err); // Send simple response to user
                    }/*
                    return res.json({
                        speech: "Sorry no data found",
                        displayText: "Sorry no data found",
                        source: 'getProductDetails'
                    });
                    */
                })
        },
        'default': () => {
            // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
            if (requestSource === googleAssistantRequest) {
                let responseToUser = {
                    //googleRichResponse: googleRichResponse, // Optional, uncomment to enable
                    //googleOutputContexts: ['weather', 2, { ['city']: 'rome' }], // Optional, uncomment to enable
                    speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
                    text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
                };
                sendGoogleResponse(responseToUser);
            } else {
                let responseToUser = {
                    //data: richResponsesV1, // Optional, uncomment to enable
                    //outputContexts: [{'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}}], // Optional, uncomment to enable
                    speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
                    text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
                };
                sendResponse(responseToUser);
            }
        }
    };
    if (!actionHandlers[action]) {
        action = 'default';
    }
    actionHandlers[action]();

    // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
    function sendGoogleResponse(responseToUser) {
        if (typeof responseToUser === 'string') {
            app.ask(responseToUser); // Google Assistant response
        } else {
            // If speech or displayText is defined use it to respond
            let googleResponse = app.buildRichResponse().addSimpleResponse({
                speech: responseToUser.speech || responseToUser.displayText,
                displayText: responseToUser.displayText || responseToUser.speech
            });
            // Optional: Overwrite previous response with rich response
            if (responseToUser.googleRichResponse) {
                googleResponse = responseToUser.googleRichResponse;
            }
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            if (responseToUser.googleOutputContexts) {
                app.setContext(...responseToUser.googleOutputContexts);
            }
            console.log('Response to Dialogflow (AoG): ' + JSON.stringify(googleResponse));
            app.ask(googleResponse); // Send response to Dialogflow and Google Assistant
        }
    }
    // Function to send correctly formatted responses to Dialogflow which are then sent to the user
    function sendResponse(responseToUser) {
        // if the response is a string send it as a response to the user
        if (typeof responseToUser === 'string') {
            let responseJson = {};
            responseJson.speech = responseToUser; // spoken response
            responseJson.displayText = responseToUser; // displayed response

            res.json(responseJson); // Send response to Dialogflow
            res.append("Google-Assistant-API-Version", "v1");
        } else {
            // If the response to the user includes rich responses or contexts send them to Dialogflow
            let responseJson = {};
            // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;
            // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
            responseJson.data = responseToUser.data;
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            responseJson.contextOut = responseToUser.outputContexts;
            console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
             
            res.append("Google-Assistant-API-Version", "v1");
        }
    }

}
server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});