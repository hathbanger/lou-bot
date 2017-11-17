'use strict';
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const apiai = require('apiai');
const apiAiAccessToken = process.env.API_AI_ACCESS_TOKEN;
const apiAiService = apiai(apiAiAccessToken);
var cors = require('cors');
const url = require('url');

app.use(cors());
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }
    if (!obj) {
        return false;
    }
    return obj != null;
}  

wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    ws.on('message', function incoming(message) {
    let request = apiAiService.textRequest(message,
        {
            sessionId: 'test',
            contexts: [
                {
                    name: "generic",
                    parameters: {}
                }
            ]
        });

        request.on('response', (response) => {
            // console.log("response", response.result.fulfillment);
            if (isDefined(response.result)) {
                let responseText = response.result.fulfillment.speech;
                let responseData = response.result.fulfillment.data;
                if (isDefined(responseText)) {
                    response.result.fulfillment.messages.forEach(function(msg, index){
                        console.log(message, response.result.contexts[0].parameters);
                        setTimeout(function(){                 
                            ws.send(msg.speech);
                        }, index * 1500);     
                    })
                }
            }
        });

        request.on('error', (error) => console.error(error));
        request.end();         
  });
});

server.listen(process.env.LOU_PORT, function listening() {
  console.log('Listening on %d', server.address().port);
});
