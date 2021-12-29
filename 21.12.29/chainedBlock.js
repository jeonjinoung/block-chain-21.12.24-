const fs = require("fs");
const merkle = require("merkle");
const cryptojs = require("crypto-js");

class Block {
    constructor(header, body) {
        this.header = header;
        this.body = body;
    }
}
class BlockHeader {
    constructor(
        version,
        index,
        previousHash,
        timestamp,
        merkleRoot,
        bit,
        nonce
    ) {
        this.version = version;
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.merkleRoot = merkleRoot;
        this.bit = bit;
        this.nonce = nonce;
    }
}

function getVersion() {
    const package = fs.readFileSync("package.json");
    console.log(JSON.parse(package).version);
    return JSON.parse(package).version;
}

//getVersion()
function createGenesisBlock() {
    const version = getVersion();
    const index = 0;
    const previousHash = "0".repeat(64);
    //0을64자치 채워넣는다.
    const timestamp = parseInt(Date.now() / 1000);
    //함수가 실행된 시간 1000으로 나눠줘야 초단위로 들어감
    const body = ["hello block"];
    const tree = merkle("sha256").sync(body);
    //암호화 해서 머클에 넣어주는것을 나타냄
    const merkleRoot = tree.root() || "0".repeat(64);
    //머클루트를 계산하려면 바디가 있어야한다.
    const bit = 0;
    const nonce = 0;

    //	console.log("version : %s, timestamp : %d, body : %s", version, timestamp, body)
    //	console.log("previousHash : %d", previousHash)
    //	console.log(tree)
    //	console.log("merkleRoot : %d", merkleRoot)

    const header = new BlockHeader(
        version,
        index,
        previousHash,
        timestamp,
        merkleRoot,
        bit,
        nonce
    );
    return new Block(header, body);
}

const block = createGenesisBlock();
console.log(block);

let Blocks = [createGenesisBlock()];

function getBlocks() {
    return Blocks;
}

function getLastBlock() {
    return Blocks[Blocks.length - 1];
}

function createHash(data) {
    const { version, index, previousHash, timestamp, merkleRoot, bit, nonce } =
        data.header;
    const blockString =
        version + index + previousHash + timestamp + merkleRoot + bit + nonce;
    const hash = cryptojs.SHA256(blockString).toString();
    return hash;
}

//const block = createGenesisBlock()
//const testHash = createHash(block)
//console.log(testHash)

//내용을 추가하기위한 블럭
//함수를 불러오기전에 let의로 이전 블록들이 있어야ㅎ된다.
function nextBlock(bodyData) {
    const prevBlock = getLastBlock();
    const version = getVersion();
    const index = prevBlock.header.index + 1;
    const previousHash = createHash(prevBlock);
    //이전블록의 정보를 불러넣어서 이전블록의값이된다.
    const timestamp = parseInt(Date.now() / 1000);
    const tree = merkle("sha256").sync(bodyData);
    const merkleRoot = tree.root() || "0".repeat(64);
    const bit = 0;
    const nonce = 0;

    const header = new BlockHeader(
        version,
        index,
        previousHash,
        timestamp,
        merkleRoot,
        bit,
        nonce
    );
    return new Block(header, bodyData);
}

//const block1 = nextBlock(["tranjaction1"])
//console.log(block1)

function addBlock(bodyData) {
    const newBlock = nextBlock(bodyData);
    Blocks.push(newBlock);
}

// addBlock(['transection1'])
// addBlock(['transection2'])
// addBlock(['transection3'])
// addBlock(['transection4'])
// addBlock(['transection5'])
console.log(Blocks);
//우리가 const를 쓰잖아 const랑 let이라는게 나왔는데 var차이가 뭔지 오늘 첫번째 과제
//

module.exports = {
    Blocks,
    getLastBlock,
    createHash,
    nextBlock,
    getVersion,
    getBlocks,
    addBlock,
};
