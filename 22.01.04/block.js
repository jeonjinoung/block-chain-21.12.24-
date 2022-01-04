const fs = require('fs')
const merkle = require('merkle')

class Block{
	constructor(header, body){
		this.header = header
		this.body = body
	}
}
class BlockHeader{
	constructor(version, previousHash, timestamp, merkleRoot, bit, nonce){
		this.version = version
		this.previousHash = previousHash
		this.timestamp = timestamp
		this.merkleRoot = merkleRoot
		this.bit = bit
		this.nonce = nonce
	}
}

function getVersion(){
	const package = fs.readFileSync("package.json")
	console.log(JSON.parse(package).version)
	return JSON.parse(package).version
}

//getVersion()
function createGenesisBlock(){
	const version = getVersion()
	const previousHash = '0'.repeat(64)
	//0을64자치 채워넣는다.
	const timestamp = parseInt(Date.now()/1000)
	//함수가 실행된 시간 1000으로 나눠줘야 초단위로 들어감
	const body = ['hello block']
	const tree = merkle('sha256').sync(body)
	//암호화 해서 머클에 넣어주는것을 나타냄
	const merkleRoot = tree.root() || '0'.repeat(64)
	//머클루트를 계산하려면 바디가 있어야한다.
	const bit = 0
	const nonce = 0

	console.log("version : %s, timestamp : %d, body : %s", version, timestamp, body)
	console.log("previousHash : %d", previousHash)
	console.log(tree)
	console.log("merkleRoot : %d", merkleRoot)

	
	const header = new BlockHeader(version, previousHash, timestamp, merkleRoot, bit, nonce)
	return new Block(header, body)
	}

const block = createGenesisBlock()
console.log(block)
