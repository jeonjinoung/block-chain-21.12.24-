// 블록 구조가 유요한지
// 현재 블록의 인덱스가 이전블록의 인덱스보다 1만큼 큰지
// 이전 블록의 해시값과 현재 블록의 이전 해시가 같은지
// 데이터 필드로부터 계산한 머클루트와 블록 헤더의 머클루트가 동일한지
const merkle = require("merkle");
const {
    getVersion,
    createHash,
    Blocks,
    getLastBlock,
    nextBlock,
} = require("./chainedBlock");

function isValidBlockStructure(block) {
    //블럭에 형태가 맞는지 확인하는 함수
    return (
        typeof block.header.version === "string" && //버전이 스트링인지
        typeof block.header.index === "number" && //그리고 넘버인지
        typeof block.header.previousHash === "string" && //그전 해시값인지
        typeof block.header.timestamp === "number" && //만든시간
        typeof block.header.merkleRoot === "string" && //머클루트
        typeof block.body === "object"
    ); //body데이터
}

function isValidNewBlock(newBlock, previousBlock) {
    if (isValidBlockStructure(newBlock) === false) {
        //새로운블럭이 잘못만든 실패면
        console.log("invalid Block Structure");
        return false;
    } else if (newBlock.header.index !== previousBlock.header.index + 1) {
        //새로만든 블럭이랑 그전블럭에 인덱스가 같지않은면
        console.log("invalid index");
        return false;
    } else if (createHash(previousBlock) !== newBlock.header.previousHash) {
        //이전해시값 비교
        console.log("invalid previousHash");
        return false;
    } else if (
        (newBlock.body.length === 0 &&
            "0".repeat(64) !== newBlock.header.merkleRoot) ||
        (newBlock.body.length !== 0 &&
            merkle("sha256").sync(newBlock.body).root() !==
                newBlock.header.merkleRoot)
    ) {
        console.log("invalid merkleRoot");
        return false;
    }
    return true;
}

function addBlock(newBlock) {
    if (isValidNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock);
        return true;
    }
    return false;
}
const block = nextBlock(["상민이가 시켰는데요?"]);
addBlock(block);

console.log(Blocks);

module.exports = {
    Blocks,
    getLastBlock,
    createHash,
    addBlock,
    nextBlock,
    getVersion,
};
