// sign-nonce.ts
import { Wallet } from 'ethers';
import * as readline from 'readline';

// Set up readline to get user input from terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const PRIVATE_KEY =
  '0x745242fae5ef62eed71ac91cfcaaea9f866b8140787843af0abf8d4ebfeb7e45';
// 0x0000000000000000000000000000000000000007ffffffffffffffffffffffff
// 0xb361acc614e4d65c6ba1018bb010c81e7d937f0e4274567d46874c15664ace95

// Create wallet using private key
const wallet = new Wallet(PRIVATE_KEY);
console.log('Wallet Address:', wallet.address);

rl.question('Enter nonce to sign: ', async (nonce) => {
  try {
    // Sign the nonce with the wallet's private key
    const signature = await wallet.signMessage(nonce);
    console.log('Signature:', signature);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    rl.close();
  }
});
