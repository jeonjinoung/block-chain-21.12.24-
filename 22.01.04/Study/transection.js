const CryptoJS = require('crypto-js')


//트랜잭션 출력
class TxOut {
    constructor(address, amount){
        //받을사람의 주소 == 퍼블릭키 보내는사람의 키니까 모두 알고있다?
        //실제로 정당하게 받은사람이 아닌사람 퍼블릭키의 정당성 알수없다.
        this.address = address
        //보내는 코인의 양
        this.amount = amount;
    }
}

//입력쪽을 봐보자
class TxIn{
    constructor(txOutId, txOutIndex, signature){
        //스트링으로 되어있는 txOutid => 
        this.txOutId = txOutId;
        //넘버로 되어있는 인덱스
        this.txOutIndex = txOutId;
        //시그니처 == 프라이빗키로 만든 시그니처
        this.signature = signature;
    }
}
//시그니처와 보낸사람의 퍼블릭키를 알 수 있다??!!!!!
/*
트랜잭션이 인풋 아웃풋
인풋 -> 코인 억류??
아웃풋 -> 새로운 주소를 보낼때 막을해서 보낸다?
*/


class Transaction {
    constructor(id, txIns, txOuts){
        this.id = id;//string
        this.txIns = txIns; 
        this.txOuts = txOuts;
    }
}

//거래아이디
const getTransactionId = (transaction) => {
    //transaction 매개변수
    const txInContent = transaction.txIns
    
/*
    const txInContent = transaction.txIns
    트랜잭션 변수안에있는 input값들 txoutid랑 txindex txins배열만큼 다합친만큼
    다합친게 하나의 a가되고 이다음 값이 하나의 b가되서
    string number string number  string number 다합친값이 된다.
*/

    //txIns 배열  값들을 하나씩 가져와서 매개변수로 가져와서 함수로 돌아간다?
       .map((txIn) => txIn.txOutId + txIn.txOutIndex) // 합쳐서 계산한다?
       .reduce((a, b) => a + b, "");//reduce 첫번째인자 a,b를 두개를 합친거를 결과로 리턴
    const txOutContent = transaction.txOuts
       .map((txOut) => txOut.address + txOut.amount)
       .reduce((a, b) => a + b, "");
 
    return CryptoJS.SHA256(txInContent + txOutContent).toString();
 };

// 트랜잭션 개념이라 이런건어렵지 않으니까 map reduce를 이해할 수 있는
//예제코드를 짜보자
function generateTransaction() {
    //새로운 트랜잭션을 선언
    const trans = new Transaction;
    //id는 임의로 1을 넣어주고
    trans.id = 1;
    //출력과 호출은 빈배열로 선언
    trans.txIns = [];
    trans.txOuts = [];
    //for문을 사용한 인덱스는 5개만 넣어보자
    for (let i = 0; i < 5; i++) {
        //새로운 트랜잭션 호출 구조체 선언
       const txIn = new TxIn;
       //id type string 
       txIn.txOutId = `Id: ${i+1}`;
       txIn.txOutIndex = i;
       //배열을 추가하는 문법 push
       trans.txIns.push(txIn);
       //trans : Transaction : 트랜잭션
       //txIns : [] :  반뱌욜
       //txIn : 새로운 트랜잭션 호출 구조체 선언
       const txOut = new TxOut;
       txOut.address = `address: ${i+1}`;
       txOut.amount = 10;
       trans.txOuts.push(txOut)
    }
    return trans
 }
 
 const newTransaction = generateTransaction();
 console.log(1111111111111111111111)
 console.log(newTransaction);
 /*
 Transaction {
  id: 1,
  txIns:
   [ TxIn { txOutId: 'Id: 1', txOutIndex: 0, signature: undefined },
     TxIn { txOutId: 'Id: 2', txOutIndex: 1, signature: undefined },
     TxIn { txOutId: 'Id: 3', txOutIndex: 2, signature: undefined },
     TxIn { txOutId: 'Id: 4', txOutIndex: 3, signature: undefined },
     TxIn { txOutId: 'Id: 5', txOutIndex: 4, signature: undefined } ],
  txOuts:
   [ TxOut { address: 'address: 1', amount: 10 },
     TxOut { address: 'address: 2', amount: 10 },
     TxOut { address: 'address: 3', amount: 10 },
     TxOut { address: 'address: 4', amount: 10 },
     TxOut { address: 'address: 5', amount: 10 } ] }
 */
 console.log(1111111111111111111111)

 console.log(2222222222222222222222)
 console.log(getTransactionId(newTransaction));
 /*
    암호화 전 값
    { txInContent: 'Id: 10Id: 21Id: 32Id: 43Id: 54',
    txOutContent:
    
    'address: 110address: 210address: 310address: 410address: 510' }

    암호화 후 값
    f5a90452e6533c82341ffe25dbc49b8b5f9559526e8095ab20249eed1b439df3 
   */
 console.log(2222222222222222222222)



  ////////////////////////////////// 거래서명 //////////////////////////////////
  /*
  거래서명이란?
  거래가 서명된 후에는 거래 내용을 변경할 수 없다는것
  거래가 공개되기 때문에 블록체인에 포함되기 전에도 누구나 거래에 액서스할 수 있다.
  트랜잭션 입력에 서명할 때 txid만 서명가능
  txid가 변경되어 트랜잭션과 서명이 무효화
  */
    //트랜잭션, 인덱스 공개키 출력 매개변수
 const signTxIn = (transaction, txInIndex, privateKey, aUnspentTxOuts) => {
     //트랜잭션안에 입력변수 안에 인덱스입력을준다.
    const txIn = transaction.txIns[txInIndex];
    //
    const dataToSign = transaction.id;
    const referencedUnspentTxOut = findUnspentTxOut(
      txIn.txOutId,
      txIn.txOutIndex,
      aUnspentTxOuts
    );
    const referencedAddress = referencedUnspentTxOut.address;
    const key = ec.keyFromPrivate(privateKey, "hex");
    const signature = toHexString(key.sign(dataToSign).toDER());
    return signature;
  };
  
    ////////////////////////////////////////////////////////////////////

    ///////////////////////////////// 미사용 거래 출력 ///////////////////////////////////
    /*
    미사용 거래 출력이란?
    트랜잭션 입력은 항상 사용되지 않는 트랜잭션 출력을 참조 = uTxO
    블록체인에서 일부 코인을 소유할 때 
    실제로 공개 키가 소유한 개인 키와 일치하는 사용되지 않은 트랜잭션 출력 목록이 있다
    */
  class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
      this.txOutId = txOutId;
      this.txOutIndex = txOutIndex;
      this.address = address;
      this.amount = amount;
    }
  }
  
  let unspentTxOuts = [];
  // 이거 확인할 수 있는 예제 만들기 주말숙제
  
  function UnspentTxOuts(newTransactions) {
    // console.log(newTransactions[0].id);
    // console.log(newTransactions[0].txOuts);
    const newUnspentTxOut = newTransactions
    .map((t) => {
        return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount));
    })
    .reduce((a, b) => a.concat(b), []);

    const consumedTxOuts = newTransactions
    .map((t) => t.txIns)
    .reduce((a, b) => a.concat(b), [])
    .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

    const resultingUnspentTxOuts = aUnspentTxOuts
    .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
    .concat(newUnspentTxOuts);
      //return이 한번더들어가??
    return unspentTxOuts.push(newUnspentTxOuts);
}
  UnspentTxOuts(newTransactions);
  console.log(unspentTxOuts);


/*

트랜잭션 ID는 트랜잭션 내용에서 해시를 가져와서 계산함
txIds의 서명은 나중에 트랜잭션에 추가되므로 트랜잭션 해시에 포함되지 않는다.


*/