class TxOut {
    constructor(address, amount){
        this.address = address
        this.amount = amount;
    }
}

class TxIn{
    constructor(txOutId, txOutIndex, signature){
        this.txOutId = txOutId;
        this.txOutIndex = txOutId;
        this.signature = signature;
    }
}

class Transaction {
    constructor(id, txIns, txOuts){
        this.id = id;
        this.txIns = txIns;
        this.txOuts = txOuts;
    }
}


const getTransactionId = (transaction) => {
    const txInContent = transaction.txIns
       .map((txIn) => txIn.txOutId + txIn.txOutIndex)
       .reduce((a, b) => a + b, "");
    const txOutContent = transaction.txOuts
       .map((txOut) => txOut.address + txOut.amount)
       .reduce((a, b) => a + b, "");
 
    return {txInContent, txOutContent}
 };

// 트랜잭션 개념이라 이런건어렵지 않으니까 map reduce를 이해할 수 있는
//예제코드를 짜보자
function generateTransaction() {
    const trans = new Transaction;
    trans.id = 1;
    trans.txIns = [];
    trans.txOuts = [];
    for (let i = 0; i < 5; i++) {
       const txIn = new TxIn;
       txIn.txOutId = `Id: ${i+1}`;
       txIn.txOutIndex = i;
       trans.txIns.push(txIn);
 
       const txOut = new TxOut;
       txOut.address = `address: ${i+1}`;
       txOut.amount = 10;
       trans.txOuts.push(txOut)
    }
    return trans
 }
 
 const newTransaction = generateTransaction();
 console.log(newTransaction);
 console.log(getTransactionId(newTransaction));




/*

트랜잭션 ID는 트랜잭션 내용에서 해시를 가져와서 계산함
txIds의 서명은 나중에 트랜잭션에 추가되므로 트랜잭션 해시에 포함되지 않는다.


*/