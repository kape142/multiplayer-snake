let express = require("express");
const http = require('http');
let bodyParser = require("body-parser");
let app = express();
let expressWs = require('express-ws');

app.use(bodyParser.json());
'use strict';

app.use(express.static(__dirname + '/public'));

let port = process.env.PORT || 80;

const httpServer = http.createServer(app);

let expressWsServer = expressWs(app, httpServer);

//Client

app.get("/data", (req, res)=>{
    res.send({data: "test"});
});

app.post("/data/:id", (req, res)=>{
    let id = req.params.id; //henter fra url
    let direction = req.body.direction; //henter body i request
    let action = req.body.action;
    res.status(200).send({success: "true"}) //sender respons til klienten med status 200
    sendToScreen({
        id,
        direction,
        action
    }); //sender til frontend for skjermen
});

//Host

let hostWS;

app.ws("/hostWS/", (ws, req)=>{
    ws.on("message",msg=>{
        console.log (msg);
    });
    ws.on("close", (code, reason)=>{
        hostWS = undefined
    });
    hostWS = ws
});

function sendToScreen(data){
    console.log(data);
    if(hostWS){
        hostWS.send(JSON.stringify(data))
    }
}

/*setInterval(()=>{
    sendToScreen({
        id: Math.floor(Math.random()*2),
        direction: Math.random()>0.5?"right":"left"     ,
        action: Math.random()>0.5?"pressed":"released",
    })
}, 500)*/


httpServer.listen(port);

console.log("Server started " + new Date().toISOString());

process.on('SIGINT', function() {
    process.exit();
});
