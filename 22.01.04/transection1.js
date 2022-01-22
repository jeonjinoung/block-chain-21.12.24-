class TxOut {
   constructor(address, amount) {
      this.address = address;
      this.amount = amount;
   }
}

class TxIn {
   constructor(txOutId, txOutIndex, signature) {
      this.txOutId = txOutId;
      this.txOutIndex = txOutIndex;
      this.signature = signature;
   }
}

class Transaction {
   constructor(id, txIns, txOuts) {
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