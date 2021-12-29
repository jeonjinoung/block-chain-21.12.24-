const express = require("express");
const bodyParser = require("body-parser");
const { getVersion, getBlocks, nextBlock } = require("./chainedBlock.js");
const { addBlock } = require("./checkVaildBlock");
const { connectionToPeers, getSockets } = require("./p2pServer.js");

const http_port = process.env.HTTP_PORT || 3001;
//env | gerp HTTP_PORT 는 포트를 확인하는것 node창에 실행명령어

function initHttpServer() {
    const app = express();
    app.use(bodyParser.json());

    // curl -H "Content-type:application/json" --data "{\"data\" : [ \"ws://localhost:6002\", \"ws://localhost:6003\"] }"

    app.post("/addPeers", (req, res) => {
        const data = req.body.data || [];
        connectionToPeers(data);
        res.send(data);
    });

    app.get("/peers", (req, res) => {
        let sockInfo = [];
        getSockets().forEach((s) => {
            sockInfo.push(s._socket.remoteAddress + ":" + s._socket.remotePort);
        });
        res.send(sockInfo);
    });

    app.get("/blocks", (req, res) => {
        res.send(getBlocks());
    });

    app.post("/mineBlock", (req, res) => {
        const data = req.body.data || [];
        const block = nextBlock(data);
        addBlock(block);

        res.send(block);
    });

    app.get("/version", (req, res) => {
        res.send(getVersion());
    });

    app.post("/stop", (req, res) => {
        res.send({ msg: "Stop Server!" });
        process.exit();
    });

    app.listen(http_port, () => {
        console.log("Listening Http Port : " + http_port);
    });
}
initHttpServer();

/*
누구나 서버가 되기도하고 클라이언트가 되기도하면서 메세지를 보내고 받아야되는 소켓형태가 되어야한다.
*/
