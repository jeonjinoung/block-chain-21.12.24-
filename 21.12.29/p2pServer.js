const p2p_port = process.env.P2P_PORT || 6001;
//p2p_port상수 선언 그값의로 환경변수에 p2p_PoRT의 6001번 포트를 연다.

const WebSocket = require("ws");
//ws npm install ws를 하여 WebSocket을 가져와준다.

//initP2PServer함수 만들어주고
function initP2PServer(test_port) {
    //서버라는 상수 선언 새로운 소켓서버가 열릴때 포트 숫자는 p2p_port다
    const server = new WebSocket.Server({ port: test_port });
    //서버가 열리면 컨넥션 웹소켓이 적힌다.
    server.on("connection", (ws) => {
        initConnection(ws);
    });
    //그리고 콘솔창으로 p2p 웹소켓 포트 번호는 + 번호가나온다.
    console.log("Listening p2p webSocket port : " + test_port);
}

initP2PServer(6001);
initP2PServer(6002);
initP2PServer(6003);

let sockets = [];

function initConnection(ws) {
    sockets.push(ws);
}

function getSockets() {
    return sockets;
}

//메세지형태로
//message
//내가가지고있는 블록체인이 올바르지 않다라고 판단이되면 너꺼를줘봐??
//다른사람께 옳다고 판단이되면 다른사름꺼를 검증해보는 메시지가 나올것이다.
//이블록이 이블록이 맞는블록이야 라고 하나추가해
//합의알고리즘을 통해서 요청할 수 있다라는것

function write(ws, message) {
    ws.send(JSON.stringify(message));
}

//브로드케스트 = 전파? 방송? / 통신해야되는 애들에게 전부다 보낸다는것
function broadcast(message) {
    sockets.forEach((socket) => {
        write(socket, message);
    });
}

function connectionToPeers(newPeers) {
    newPeers.forEach((peer) => {
        const ws = new WebSocket(peer);
        ws.on("open", () => {
            initConnection(ws);
        });
        ws.on("error", () => {
            console.log("connection Failed!");
        });
    });
}

module.exports = { connectionToPeers, getSockets };

// function (socket) {
//     write(socket, message)
// }
