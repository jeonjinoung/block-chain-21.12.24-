const fs = require('fs')
//fs모듈 호출
const merkle = require('merkle')
//merkle모듈 호출
const cryptojs = require('crypto-js')

//블록 구조체선언
class Block{
    //해더와 바디인자 받음
	constructor(header, body){
        //그안에 값으로 헤더와
		this.header = header
        //바디를 가르킴
		this.body = body
	}
}
//블록해더 구조체 생성
class BlockHeader{
    //구조체 안에 인자로 버전, 해쉬 , 머클루스, 비트, 넌스를 받음
	constructor(version, previousHash, timestamp, merkleRoot, bit, nonce){
		//각 인자들 가르킴
        this.version = version
		this.previousHash = previousHash
		this.timestamp = timestamp
		this.merkleRoot = merkleRoot
		this.bit = bit
		this.nonce = nonce
	}
}

//함수호출 겟 버젼
function getVersion(){
    //호출해줌 fs모듈 파일을 packge.json
	const package = fs.readFileSync("package.json")
    console.log(JSON.parse(package).version)
	return JSON.parse(package).version
}

//맨처음 호출한 블록을 선언해줌
function createGenesisBlock(){
    //version이라는 상수 선언 안에 값으로 버젼함수 선언
	const version = getVersion()
	//0을64자치 채워넣는다.
	const previousHash = '0'.repeat(64)
	//함수가 실행된 시간 1000으로 나눠줘야 초단위로 들어감
	const timestamp = parseInt(Date.now()/1000)
	const body = ['hello block']
	//암호화 해서 머클에 넣어주는것을 나타냄
	const tree = merkle('sha256').sync(body)
	//머클루트를 계산하려면 바디가 있어야한다.
	const merkleRoot = tree.root() || '0'.repeat(64)
	const bit = 0
	const nonce = 0

	console.log("version : %s, timestamp : %d, body : %s", version, timestamp, body)
	console.log("previousHash : %d", previousHash)
	console.log(tree)
	console.log("merkleRoot : %d", merkleRoot)

	
	const header = new BlockHeader(version, previousHash, timestamp, merkleRoot, bit, nonce)
	return new Block(header, body)
	}
    
    //상수 블록선언 그값을 createGenesisBlock을 주고
    const block = createGenesisBlock()
    console.log(block)
    //그안에 블록 콘솔로 찍어서 확인

    //blocks 변수 선언 그안값으로  createGenesisBlock함수호출을 배열로 호출
    let Blocks = [createGenesisBlock()]

    //getBlocks 함수선언
    function getBlocks(){
        return Blocks
    }

    //getLastBlocks 함수선언
    function getLastBlock(){
        //블록들을 값으로 리턴 블록 길이만큼 1씩 빼준다.
        return Blocks[Blocks.length - 1]
    }
    //새로운 해쉬값들을 선언 인자로는 데이터를 받는다.
    function createHash(data){
        //상수를 선언해주고 그값으로 해더의 데이터에 넣어준다.
        const {version, index, previousHash, timestamp, merkleRoot, bit, nonce} = data.header	
        //블록단어 상수 선언 = 값을들 더해준다.
        const blockString = version + index + previousHash + timestamp + merkleRoot + bit + nonce
        //상수 해쉬 선언 값으로는 cryptojs.해쉬값으로 표현해준다.
        const hash = cryptojs.SHA256(blockString).toString()
        return hash
    }

    //const block = createGenesisBlock()
    //const testHash = createHash(block)
    //console.log(testHash)


    //내용을 추가하기위한 블럭
    //함수를 불러오기전에 let의로 이전 블록들이 있어야된다.
    function nextBlock(bodyData){
        const prevBlock = getLastBlock()
        const version = getVersion()
        const index = prevBlock.header.index + 1
        const previousHash = createHash(prevBlock)
        //이전블록의 정보를 불러넣어서 이전블록의값이된다.
        const timestamp = parseInt(Date.now()/1000)
        const tree = merkle('sha256').sync(bodyData)
        const merkleRoot = tree.root() || '0'.repeat(64)
        const bit = 0
        const nonce = 0

        const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot, bit, nonce)
        return new Block(header, bodyData)
    }

    //const block1 = nextBlock(["tranjaction1"])
    //console.log(block1)

    function addBlock(bodyData){
        const newBlock = nextBlock(bodyData)
        Blocks.push(newBlock)
    }

    addBlock(['transection1'])
    addBlock(['transection2'])
    addBlock(['transection3'])
    addBlock(['transection4'])
    addBlock(['transection5'])
    console.log(Blocks)
    //우리가 const를 쓰잖아 const랑 let이라는게 나왔는데 var차이가 뭔지 오늘 첫번째 과제
    //

