// 블록 구조가 유요한지
// 현재 블록의 인덱스가 이전블록의 인덱스보다 1만큼 큰지
// 이전 블록의 해시값과 현재 블록의 이전 해시가 같은지
// 데이터 필드로부터 계산한 머클루트와 블록 헤더의 머클루트가 동일한지
const merkle = require('merkle')
const { getVersion, createHash, Blocks, getLastBlock, nextBlock } = require('./chainedBlock');

//22.01.04
function isValidBlockStructure(block) {                     //블럭에 형태가 맞는지 확인하는 함수
    return typeof (block.header.version) === 'string'      //버전이 스트링인지
        && typeof (block.header.index) === 'number'         //그리고 넘버인지
        && typeof (block.header.previousHash) === 'string'  //그전 해시값인지
        && typeof (block.header.timestamp) === 'number'     //만든시간
        && typeof (block.header.merkleRoot) === 'string'    //머클루트
        && typeof (block.header.difficulty) === 'number'    //난이도
        && typeof (block.header.nonce) === 'number'         //넌스
        && typeof (block.body) === 'object'                 //body데이터
}
// 22.01.04
function isValidNewBlock(newBlock, previousBlock) {
    if (isValidBlockStructure(newBlock) === false) {        //새로운블럭이 잘못만든 실패면
        console.log("invalid Block Structure")
        return false
    }
    else if (newBlock.header.index !== previousBlock.header.index + 1) {  //새로만든 블럭이랑 그전블럭에 인덱스가 같지않은면
        console.log("invalid index")
        return false
    }
    else if (createHash(previousBlock) !== newBlock.header.previousHash) {  //이전해시값 비교
        console.log("invalid previousHash")
        return false
    }
    else if ((newBlock.body.length === 0 && '0'.repeat(64) !== newBlock.header.merkleRoot) ||
        newBlock.body.length !== 0 && (merkle("sha256").sync(newBlock.body).root() !== newBlock.header.merkleRoot)) {
        console.log('invalid merkleRoot')
        return false;
    // 22.01.04 //시간관련된것    
    }else if(!isValidTimestamp(newBlock, previousBlock)) {
        console.log("invalid Timestamp")
        return false;
        //첫번째인자의 해쉬같은경우에는 두번째인자는 
    }else if(!hashMatcheDifficulty(createHash(newBlock), newBlock.header.difficulty)){
        console.log("invalid hash")
        return false;
    }
     // 22.01.04
    return true;
}

//블록원장을 하나하나 돌아가면서 위엥있는 isValidnewBlock을 써서 확인을 해볼것이다.
//
function isVaildChain(newBlocks){
    //내블록중에서 제네시스 블록 가져오는함수
    if(JSON.stringify(newBlocks[0]) !== JSON.stringify(Blocks[0])){
        return false;
    }
    //확인할 때 쓸 코드
    //위에있는 블록
    //하나씩 증가하며 확인
    // 0  1  1  2  2  3
    var tempBlocks = [newBlocks[0]];
    for(var i = 1; i < newBlocks.length; i++){ //포문을 사용하여 검사문 선언
        if(isValidNewBlock(newBlock[i], tempBlocks[i - 1])){
            //tempBlocks를 하나씩 늘려줌
            tempBlocks.push(newBlocks[i]);
        }else{
            return false; //이블록은 문제가 있다.
        }
    }
    return true; //이 블록이 아무 문제 없는 블록이다.
}

function addBlock(newBlock) {
    if (isValidNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock)
        return true;
    }
    return false;
}
const block = nextBlock(['상민이가 시켰는데요?'])
addBlock(block)

console.log(Blocks)

module.exports = {
	Blocks, getLastBlock, createHash, addBlock, nextBlock, getVersion,
}
/*
블록새성하고 블록체인 업데이트까지하는것을 만들었는데
지금까지는 블록을 만드는데 비용이 안든다.
실제로 비용을 낸다. 라는것뿐만아니라 시간 컴퓨터자원 기회비용??
금전도 안들어가고 시간도 안들어가고 컴퓨터자원도 거의 안쓰지?

이렇게되어있으면 누구나 블록을 언제든지 생성할 수 잇으면??
원장불일치가 심해지는 시간이? 원장이 일치되는시간보다 더 길겠지??
그래서 이제 악의적인 활동을 방지하기위해 블록을 생성할 때 비용을 첨구할것이다.
금전을 요구하는것이 아니라 시간이나 컴퓨터자원을 쓰게한다.
특정 노드한테만 블록생성 권한 부여 -> 합의알고리즘 구현 어떤 노드가 블록을 생성하게 할것이다.
bitcoin에서는 pow pos등 

작업증명하려면 2가지가 추가로 필요
난이도와
nonce값이 필요

*/