const fs = require('fs')
const merkle = require('merkle')
const cryptojs = require('crypto-js')
const random = require('random')

//22.01.04
const BLOCK_GENERATION_INTERVAL = 10 ////단위는 초 난이도가 조정되는 간격
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10 // in blocks 블록이 생성되는 간격
//난이도는 10개의 블록이 생성될때마다 / 블록은 10초마다 생성이됨
//블록생성이되는시간이 우리가 기대하는 시간보다  / 실제로 생성되는시간 조정필요
//일단은 우리가 기대하는시간은 블록생성이랑 난이도선정 시간을 곱한값을 정의함 -> 실제 or 기대 차이가 크면 재조정
//22.01.04

class Block{
	constructor(header, body){
		this.header = header
		this.body = body
	}
}
class BlockHeader{
	constructor(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce){
		this.version = version
		this.index = index
		this.previousHash = previousHash
		//해쉬만들때 하나의 요소로 들어가는것 시간간격도 올바르다증명해야함
		//1분안쪽으로 다음블록이 생성되면 잘못된블록이라고 판명되게끔
		// 잉전블록의 /새로운 타임스템프 / 검증시간 / 1분안쪽 
		this.timestamp = timestamp
		this.merkleRoot = merkleRoot
		//비트는 우리가 맞춰야되는 값
		this.difficulty = difficulty
		//
		this.nonce = nonce
	}
}

function getVersion(){
	const package = fs.readFileSync("package.json")
//console.log(JSON.parse(package).version)
	return JSON.parse(package).version
}

//getVersion()
function createGenesisBlock(){
	const version = getVersion()
	const index = 0
	const previousHash = '0'.repeat(64)
	//0을64자치 채워넣는다.
	//12311006505 = 2009년 1월 3일 6:15pm(UTC) 가장 최초로 만들어진 시간
	const timestamp = 1231006505 //parseInt(Date.now()/1000)
	//함수가 실행된 시간 1000으로 나눠줘야 초단위로 들어감
	const body = ['The Times 03/Jan/2009 Chancellor on brink of second bailout for banks']
	const tree = merkle('sha256').sync(body)
	//암호화 해서 머클에 넣어주는것을 나타냄
	const merkleRoot = tree.root() || '0'.repeat(64)
	//머클루트를 계산하려면 바디가 있어야한다.
	const difficulty = 0
	const nonce = 0

//	console.log("version : %s, timestamp : %d, body : %s", version, timestamp, body)
//	console.log("previousHash : %d", previousHash)
//	console.log(tree)
//	console.log("merkleRoot : %d", merkleRoot)

	
	const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce)
	return new Block(header, body)
}

//const block = createGenesisBlock()
//console.log(block)

let Blocks = [createGenesisBlock()]

function getBlocks(){
	return Blocks
}

function getLastBlock(){
	return Blocks[Blocks.length - 1]
}

//블럭을 받아와서 헤더에서 
function createHash(data){
	const {version, index, previousHash, timestamp, merkleRoot, difficulty, nonce} = data.header
	const blockString = version + index + previousHash + timestamp + merkleRoot + difficulty + nonce
	const hash = cryptojs.SHA256(blockString).toString()
	return hash
}
//하나하나를 다받아오는 함수를 선언
function calculateHash(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce){
	//내용은 위와같지만 블록이아닌 하나의 값을 그대로가져옴
	//const {version, index, previousHash, timestamp, merkleRoot, difficulty, nonce} = data.header
	//전부다 blockString으로 합한다음에
	const blockString = version + index + previousHash + timestamp + merkleRoot + difficulty + nonce
	const hash = cryptojs.SHA256(blockString).toString()
	return hash
}

//const block = createGenesisBlock()
//const testHash = createHash(block)
//console.log(testHash)


//내용을 추가하기위한 블럭
//함수를 불러오기전에 let의로 이전 블록들이 있어야ㅎ된다.
function nextBlock(bodyData){
	const prevBlock = getLastBlock()
	const version = getVersion()
	const index = prevBlock.header.index + 1
	const previousHash = createHash(prevBlock)
	//이전블록의 정보를 불러넣어서 이전블록의값이된다.
	const timestamp = parseInt(Date.now()/1000)
	const tree = merkle('sha256').sync(bodyData)
	const merkleRoot = tree.root() || '0'.repeat(64)
	//여기서 getDiifficulty 함수로 처리는 내일하자
	const difficulty = 0
	//const nonce = 0

	//const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce)
	//아래에 있는 findBlock을 통해 새로은 BlockHeader를 만들것이다.
	//문제를 해결하는 과정을 거쳐서 새로운 블럭이 생성되는 것을 나타낸다.
	const header = findBlock(version, index, previousHash, timestamp, merkleRoot, difficulty)
	return new Block(header, bodyData)
	//뒷부분을 좀 바꿀꺼다.
	
}

//const block1 = nextBlock(["tranjaction1"])
//console.log(block1)

//

function addBlock(bodyData){
	const newBlock = nextBlock(bodyData)
	Blocks.push(newBlock)
}

addBlock(['transection1'])
addBlock(['transection2'])
addBlock(['transection3'])
// addBlock(['transection4'])
// addBlock(['transection5'])
//console.log(Blocks)
//우리가 const를 쓰잖아 const랑 let이라는게 나왔는데 var차이가 뭔지 오늘 첫번째 과제


//리플레스체인 
// 체인선택규칙 중에 가장 긴것을 선택을하고 그내용을 리플레스 체인에다가 넣어준것
//새로운 블럭을 검사를 해준다. 
function replaceChain(newBlocks){
	//길면 바꾸고 길이가 새로운 블럭의
	if (isVaildChain(newBlocks)){
		if((newBlocks.length > Blocks.length) || 
		//길잉가 같으면 랜덤으로 트루 및 false를 뽑아서 값을 true 와 false로 나오게끔한다.
		(newBlocks.length === Blocks.length) && random.boolean()){
			Blocks = newBlocks;
			Broadcast(responseLatestMsg());
		}
	//같으면? 바꿀지말지 랜덤으로 정한다.
	}else{
		console.log("받은 원장에 문제가 있음")
	}
}

//16진수의 값을 2진수로 쉽게 바꾸기위해 함수를 만드는거고
//실제로는 계산해도되는데 16진수를 2진수로 바꾸는건 6각테이블이라는것을 만들것이다.
//6각테이블 이미 매칭이되어있는테이블 16진수는 0부터 15까지 0부터 f까지 0을 2진수로 바꿨을때 000 미리만든다는것이다.
//값을바꿀때는 테이블에서 가져와서 바꾸겠다. 계산을 안하겠다.
function hexTobinary(s){
	const lookupTable = {
		'0' : '0000', '1' : '0001' , '2' : '0010', '3' : '0011',
		'4' : '0100', '5' : '0101' , '6' : '0110', '7' : '0111',
		'8' : '1000', '9' : '1001' , 'A' : '1010', 'B' : '1011',
		'C' : '1100', 'D' : '1101' , 'E' : '1110', 'F' : '1111',
	}
	//여기에 이제 16진수로 64자리짜리 값이 들어왔을때 2진수로 바꾸는 것을 해본다 .반복문을 써서
	var ret = "";
	for(var i = 0; i < s.length; i++){
		//lookupTable s배열의 i와 매칭되는것이있다면
		if(lookupTable[s[i]]){
			ret += lookupTable[s[i]];
		}
		//문제가있다면 return null
		else {return null; }
	}
	return ret;
}

//아까 얘기했던걸 시전할건데 뭘 미리 만들어놓고하자(위에꺼)
//위에 변경을 완료하였으면 돌아와서
function hashMatcheDifficulty(hash, difficulty){
	//toUppercase는 대문자로 바꾸는것을 처리해주는것
	const hashBinary = hexTobinary(hash.toUpperCase())
	//난이도를 따라서 앞자리 몇개를 0으로 시작하게 할것인가.?
	const requirePrefix = '0'.repeat(difficulty)
	//startWith 앞자리가 hashBinary == requirePrefix true를 같으면 반환하고 다르면 리턴을하는 함수
	return hashBinary.startsWith(requirePrefix)
}
//이런식으로 해서 문제를 만들어 내는것까지 구현을 해놨고

//문제를 해결할 수 있는 nonce값을 함수로 만들어줘야한다.
//전에했떤거랑 비슷하게 인자가 들어간다.
function findBlock(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty){
	//우리가 찾앙야되는건 nonce값
	var nonce = 0;

	//nonce값을 찾을때 까지 반복의 알고리즘을 돌릴꺼다
	while(true){
		//calculateHash 전에 만들었던 함수를 써서 hash를 하나 만들거고
		var hash = calculateHash(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty, nonce)
		if(hashMatcheDifficulty(hash, difficulty)){
			//정답이면 BlockHeader를 만들어주고
			return new BlockHeader(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty, nonce)
		}
		//정답이 아니면 nonce를 1씩 증가시켜주면서 값을 찾아준다.
		nonce++;
	}
}

//22.01.04
//난이도를 가져오는함수
function getDiifficulty(blocks){
	//마지막블록을 가져오면된다. / 이전블록을통해 가져오고있을꺼다 난이도를
	const lastBlock = blocks[blocks.length - 1]; //마지막블록가져오는거고
	if(lastBlock.header.index !== 0 &&
		//나머지연산을했을때 10으로 나누어 떨어지는에 0 10 20 30...등 
		 lastBlock.header.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0)
	{	//난이도조절을 해서 블록과 마지막블록을
		return getAdjustDifficulty(lastBlock, blocks)
	}		 
	//난이도를 리턴해준다.
	return lastBlock.header.difficulty;
}

//22.01.04
//마지막블록이랑 블록들을받아서 처리
function getAdjustDifficulty(lastBlock, blocks){
	//이전에 조정됐던 블럭을 가져와서 / 난이도 조절 인터벌 / -> 난이도조절만큼 블록단위로 조절
	const preAdjustmentBlock = blocks[blocks.length - DIFFICULTY_ADJUSTMENT_INTERVAL]
	//시간이 실제로 얼마나 걸렸는지를 계산
	const elapsedTime = lastBlock.header.timestamp - preAdjustmentBlock.header.timestamp
	//기대값
	const expectedTime = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
	//두배이상으로걸리면 난이도를 낮추고 조정하는것이 필요하다.

	//실제경과시간이 곱한값보다 크다면
	if(expectedTime / 2 > elapsedTime){
	return preAdjustmentBlock.header.difficulty + 1	
	//실제경과시간보다 곱한값이 더 작다면?
	}else if(expectedTime * 2 < elapsedTime){
	return preAdjustmentBlock.header.difficulty - 1
	//그밖에		
	}else{
	return preAdjustmentBlock.header.difficulty
	}
}

//타임스템프 구하는 시간 //22.01.04
function getCurrentTimestamp(){
	//보통은 쉐이더??만들때 많이쓰는함수??
	return Math.round(Date().getTime() / 1000)
}

//현재블록의 인덱스가 이전블록의 인덱스보다 1만큼커야되고
//유효한타임스템프를 가져야하고
//문제를 해결해야하는거지 / 해쉬가 문제의 난이동에 해당하는 값을 가져야하고
function isValidTimestamp(newBlock, prevBlock){
	if(prevBlock.header.timestamp - newBlock.header.timestamp > 60){
		return false;
	}
	//새로운블럭이 생성되는시간 /현재검증하고있는시간
	if(getCurrentTimestamp() - newBlock.header.timestamp > 60)
		return false;
	return true;
}



module.exports = {
	Blocks, getLastBlock, createHash, nextBlock, getVersion, getBlocks, addBlock, isValidTimestamp, hashMatcheDifficulty
}

//리플레스 체인 함수 만들기

/*
자바스크립트나 파이썬이나 쓸때마다 많은생각이 들게하는 언어
C++ 협업

22.01.04 chaindBlock , checkValidBlock 수정 및 추가
작업증명을 통해 블록을 생성하는것을 마이닝이라고한다.

블록이 문제를 해결하는 난이도가 올라가면 올라갈수록 속도가 빨라지겠지?
하지만 일정한시간마다 채굴되길원해서 예상되는 컨트롤되게끔했고
최종적으로 채굴되는 채굴량이 정해져있고
블록생성간격 / 난이도조절 간격


*/