const p2p_port = process.env.P2P_PORT || 6001

const WebSocket = require("ws")

function initP2PServer(test_port) {
   const server = new WebSocket.Server({ port: test_port })
   //console.log(server);
   server.on("connection", (ws) => { initConnection(ws); })
   console.log("Listening webSocket port : " + test_port)
}

initP2PServer(6001);
initP2PServer(6002);
initP2PServer(6003);

let sockets = []

function initConnection(ws) {
   //console.log(ws._socket.remotePort)
   sockets.push(ws)
   initMessageHandler(ws)
   initErrorHandler(ws)
}

function getSockets() {
   return sockets;
}

function write(ws, message) {
   ws.send(JSON.stringify(message))
}

function broadcast(message) {
   sockets.forEach(
      // function (socket) {
      //    write(socket, message);
      // }
      (socket) => {
         write(socket, message);
      }
   )
}

function connectToPeers(newPeers) {
   newPeers.forEach(
      (peer) => {
         const ws = new WebSocket(peer)
         console.log(ws);
         ws.on("open", () => { console.log("open"); initConnection(ws); })
         ws.on("error", (errorType) => { console.log("connetion Failed!" + errorType) })
      }
   )
}

// Message Handler
const MessageType = {
   //가장최근받은블럭
   QUERY_LATEST: 0,
   //모든블록을 요청
   QUERY_ALL: 1,
   //데이터 필드에 하나이상의 블록을 가지고 메세지를 보낼때
   RESPONSE_BLOCKCHAIN: 2
}

//
function initMessageHandler(ws) {
   //웹소켓을 온으로 메세지라는 이벤트 발생했을때 데이터를 가지고 처리해보자
   ws.on("message", (data) => {
      //메세지는 제이슨타입으로 분석을 해준다.
      const message = JSON.parse(data)
      //스위치문 인자로 메세지타입을
      switch (message.type) {
         //최근받은블럭
         case MessageType.QUERY_LATEST:
            //내가가지고있는 마지막블록체인
            //wirte ws라는 변수가 message를 보낸거다.
            write(ws, responseLatestMsg());
            break;
         //모든블럭
         case MessageType.QUERY_ALL:
            write(ws, responseAllChainMsg());
            break;
         //데이터 필드에 하나이상의 블록
         case MessageType.RESPONSE_BLOCKCHAIN:
            handleBlockChainResponse(message);
            break;
      }
   })
}


function responseLatestMsg() {
   //리턴해서 타입과 데이터를
   return ({
      "type": RESPONSE_BLOCKCHAIN,
      //내가가지고있는것중에 제일 마지막블럭
      //제이슨형태로 바꿔서 
      "data": JSON.stringify([getLastBlock()])
   })
}
function responseAllChainMsg() {
   return ({
      //응답하는 타입은 똑같다 하나이상이라는것이니까
      "type": RESPONSE_BLOCKCHAIN,
      //getBlocks는 배열로 들어가있어서
      //"data": JSON.stringify([getLastBlock()]) 배열로만들어줄 필요가없다.
      "data": JSON.stringify(getBlocks())
   })
}

function handleBlockChainResponse(message) {
   const receiveBlocks = JSON.parse(message.data)
   const latestReceiveBlock = receiveBlocks[receiveBlocks.length - 1]
   const latestMyBlock = getLastBlock()

   //1. 데이터로 받은 블럭 중에 마지막 블럭의 인덱스가 내가 보유 중인 마지막 블럭의 인덱스보다 클 때 / 작을 때
   //내가 가진 것 보다 짧은 것은 의미가 없음
   if (latestReceiveBlock.header.index > latestMyBlock.header.index) {
      //받은 마지막 블록의 이전 해시값이 내 마지막 블럭일 때 : addBlock
      if (createHash(latestMyBlock) === latestReceiveBlock.header.previousHash) {
         if (addBlock(latestReceiveBlock)) {
            //나를 아는 주변 노드에게 변경사항을 전파
            //서로의 피어을 다 공유하고 있는 상황? 
            broadcast(responseLastestMsg())
         }
         else {
            console.log("Invaild Block!!");
         }
      }
      //받은 블럭의 전체 크기가 1일 때(제네시스 블럭 인 경우와 같다)
      else if (receiveBlocks.length === 1) {
         //블럭을 전체 다 달라고 요청하기
         broadcast(queryAllMsg())
      }
      else {
         //내 전체 블럭이 다른 블럭들보다 동기화가 안된 상황이므로 갈아끼우기
         //내 원장이랑 다른 원장들과의 차이가 매우 큰 경우 : 원장간의 불일치를 해소해야 하는 상황
         replaceChain(receiveBlocks)
      }
   }
   else {
      console.log("Do nothing.");
   }

}

////////////////////////////////////////////////////////////////////////////////
//요청을 보내는함수

//요청을 보내는함수
//요청보내는함수또한 요청을받는함수도 타입은 똑같다.
function queryAllMsg() {
   return ({
      "type": QUERY_ALL,
      //요청을 보내는거라 데이터는 없다.
      "data": null
   })
}

function queryLatestMsg() {
   return ({
      "type": QUERY_LATEST,
      "data": null
   })
}

function initErrorHandler(ws) {
   ws.on("close", () => { closeConnection(ws) })
   ws.on("error", () => { closeConnection(ws) })
}

function closeConnection(ws) {
   console.log(`Connection close${ws.url}`);
   //소켓을 복사하는 데, 뒤에 있는 데이터를 넣어서 복사 : 즉 , 초기화 하는 것임 
   sockets.splice(sockets.indexOf(ws), 1)
}

module.exports = {
   connectToPeers, getSockets
}
// function (socket) {
//     write(socket, message)
// }

/*
메세지에 어떤내용을 넣을지 메세지핸들러를 통해 알아보자

개이때 비트코인 넷트워크 숫자가? 9642

이거를 요런사이트에 들엉가면 
https://bitnodes.io/
실제 비트를 가지고 있는 참여자 사용자의 수 nodes
전세계적으로 블록체인이 퍼져있다보니까

가장멀리있는 노드가 최신화된 데이터를 가지고 있을 수 있다.
가장 가까있는 노드랑 일체화가 되있겠지?
그래서 이런 과정을 어떤과정을 통해서 원장을 정하게할지 -> 체인선택규칙
다양한 방법으로 체인선택을 정의할 수 있는데?
가장 간단한 규칙을 통해서 만들거고 가장 긴 체인 -> 많은 노드들이 최신화가 되있다?
체인 붙일때 나름 적합하다는 블록 -> 가장 최신의 원장이다.
*/