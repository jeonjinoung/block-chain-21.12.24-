class txOut {
    constructor(address, amount){
        this.address = address
        this.amount = amount;
    }
}

class txIn{
    constructor(txout, txOutIndex, signature){
        this.txOutId = txOut d;
        this.txOutIndex = txOutId;
        this.signature = signature;
    }
}

class Transaction {
    constructor(id, txIns, txOuts){

    }
}