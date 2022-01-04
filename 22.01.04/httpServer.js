const express = require("express")
const bodyParser = require("body-parser")
const { getVersion, getBlocks, nextBlock, } = require("./chainedBlock.js")
const { addBlock } = require("./checkVaildBlock")
const {connectionToPeers, getSockets} = require("./p2pServer.js")

const http_port = process.env.HTTP_PORT || 3001
//env | gerp HTTP_PORT 는 포트를 확인하는것 node창에 실행명령어

function initHttpServer(){
    const app = express()
    app.use(bodyParser.json())

    // curl -H "Content-type:application/json" --data "{\"data\" : [ \"ws://localhost:6002\", \"ws://localhost:6003\"] }"

    app.post("/addPeers", (req,res)=>{
        const data = req.body.data || []
        connectionToPeers(data);
        res.send(data)
    })

    app.get("/peers",(req,res)=>{
        let sockInfo = []
        getSockets().forEach(
            (s)=>{
                sockInfo.push(s._socket.remoteAddress + ":" +s._socket.remotePort)
            }
        )
        res.send(sockInfo)
    })

    app.get("/blocks", (req,res)=>{
        res.send(getBlocks())
    })

    app.post("/mineBlock", (req,res)=>{
        const data = req.body.data || []
        const block = nextBlock(data)
        addBlock(block)

        res.send(block)
    })

    app.get("/version", (req,res)=>{
        res.send(getVersion())
    })

    app.post("/stop", (req,res)=>{
        res.send({"msg":"Stop Server!"})
        process.exit()
    })

    app.listen(http_port, ()=>{
        console.log("Listening Http Port : " + http_port)
    })
}
initHttpServer();

/*
누구나 서버가 되기도하고 클라이언트가 되기도하면서 메세지를 보내고 받아야되는 소켓형태가 되어야한다.

여러 명령어가 필요 블록을 생성할때 쓰는 명령어
curl -H "Content-type:application/json" --data "{\"data\" : [\"Anyting1\", \"Anyting2\"]}" http://localhost:3001/mineBlock

만들어낸 블록을 보려면
curl -X GET http://localhost:3001/blocks\

json형태로 좀더 편하게 가지고오고싶다면
curl -X GET http://localhost:3001/blocks | python3 -m json.tool

그리고 우리의 버전을 확인하고싶다면
curl -X GET http://localhost:3001/version

그리고 우리가 추가의 피어를 만들어서 소켓을 만들어주려면 웹소켓을 만들어주고
curl -H "Content-type:application/json" --data "{\"data\" : [ \"ws://localhost:6002\", \"ws://localhost:6003\"] }" http://localhost:3001/addPeers

만들어준 웹소켓의 피어를 불러오려면
curl -X GET http://localhost:3001/peers
이렇게 하면된다는데?

서버를 ctrl + c 말고 원격으로 끄게만드려면? / server.js 코드 추가 -> server 쪽에 코드를 수정 or 추가할 시에는 꼭 server를 껐다가 켜야함 !!!!!!* 
curl http://localhost:3001/stop

소켓을 만들고 모듈을 사용하려면
npm i ws




리눅스 꿀팁
//  curl - http 통신을 할거다 ~ 라는 의미 
// 모든 리눅스 명령어는 - 는 옵션값
// -X : request method (ex. POST, GET,..)
// -H : "Content-Type:application/json"      // H : header
// -H 쓰고 header 더 쓸 수 있음              
// -d "{\"data\":[\"Helloooooo\"]}"      // D : data

*/