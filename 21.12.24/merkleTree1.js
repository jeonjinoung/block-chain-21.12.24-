const { MerkleTree } = require("merkletreejs");

const SHA256 = require("crypto-js/sha256");
//console.log(SHA256('a'))

console.log(SHA256("a").toString());

const testSet = ["a", "b", "c", "d", "e"];
const testArray = testSet.map((v) => SHA256(v).toString());
//console.log(testArray)

const testMerkleTree = new MerkleTree(testArray, SHA256);
//console.log(testMerkleTree)

const merkleRoot = testMerkleTree.getRoot();
//console.log(merkleRoot.toString('hex'))

const testValue = "a";
const leaf = SHA256(testValue);
const proof = testMerkleTree.getProof(leaf);
console.log(proof);

const result = testMerkleTree.verify(proof, leaf, merkleRoot);
console.log(result);
