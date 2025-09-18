// autotx.js
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Ambil variabel dari .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const TO_ADDRESS = process.env.TO_ADDRESS;
const AMOUNT_ETH = process.env.AMOUNT_ETH;
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || "60000");
const GAS_MULTIPLIER = parseFloat(process.env.GAS_MULTIPLIER || "1.1");
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "3");
const LOW_FEE_MODE = process.env.LOW_FEE_MODE === "true";
const TOTAL_TX = parseInt(process.env.TOTAL_TX || "0"); // 0 = infinite loop

// Setup provider dan wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

let successCount = 0;
let failCount = 0;
let totalGasSpent = 0n;
let totalEthSent = 0n;
let txCounter = 0;

// Fungsi kirim sekali
async function sendEthOnce() {
  const nonce = await provider.getTransactionCount(wallet.address, "latest");
  const amountWei = ethers.parseEther(AMOUNT_ETH);

  // Ambil gasPrice dari feeData (ethers v6)
  const feeData = await provider.getFeeData();
  let gasPrice = feeData.gasPrice;

  if (!gasPrice) throw new Error("Gas price not available from RPC provider");

  if (!LOW_FEE_MODE) {
    gasPrice = (gasPrice * BigInt(Math.floor(GAS_MULTIPLIER * 100))) / 100n;
  }

  const tx = {
    to: TO_ADDRESS,
    value: amountWei,
    gasLimit: 21000n,
    gasPrice: gasPrice,
    nonce: nonce,
  };

  const balanceBefore = await provider.getBalance(wallet.address);

  console.log(`\n🚀 TX #${txCounter + 1} starting...`);
  console.log(`💰 Balance before: ${ethers.formatEther(balanceBefore)} ETH`);
  console.log(`📤 Sending ${AMOUNT_ETH} ETH to ${TO_ADDRESS} ...`);

  const sentTx = await wallet.sendTransaction(tx);
  console.log(`⏳ Waiting confirmation: ${sentTx.hash}`);

  const receipt = await sentTx.wait();

  // Balance after diambil pada block yang sama biar konsisten
  const balanceAfter = await provider.getBalance(wallet.address, receipt.blockNumber);
  const gasCost = receipt.gasUsed * receipt.gasPrice;

  successCount++;
  totalGasSpent += gasCost;
  totalEthSent += amountWei;

  console.log(`✅ Confirmed: ${receipt.hash}`);
  console.log(`📦 Block: ${receipt.blockNumber}`);
  console.log(`⛽ GasUsed: ${receipt.gasUsed}`);
  console.log(`💸 GasCost: ${ethers.formatEther(gasCost)} ETH`);
  console.log(`💰 Balance after: ${ethers.formatEther(balanceAfter)} ETH`);

  return true;
}

// Fungsi retry kalau gagal
async function sendWithRetries() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await sendEthOnce();
    } catch (err) {
      console.log(`⚠️ Attempt ${attempt} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        const delay = 2000 * attempt;
        console.log(`🔄 Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.log("❌ Max retries reached. Giving up for this tx.");
        failCount++;
        return false;
      }
    }
  }
}

// Main loop
async function mainLoop() {
  console.log(
    `Autotx started. From ${wallet.address} -> ${TO_ADDRESS}\nEvery ${INTERVAL_MS}ms, amount=${AMOUNT_ETH} ETH, lowFee=${LOW_FEE_MODE}`
  );

  while (TOTAL_TX === 0 || txCounter < TOTAL_TX) {
    txCounter++;
    await sendWithRetries();
    console.log(
      `📊 Stats so far → Success: ${successCount}, Failed: ${failCount}, Total Sent: ${ethers.formatEther(
        totalEthSent
      )} ETH, Total Gas Spent: ${ethers.formatEther(totalGasSpent)} ETH`
    );
    console.log(`⏸ Waiting ${INTERVAL_MS / 1000}s before next tx...`);
    await new Promise((res) => setTimeout(res, INTERVAL_MS));
  }

  console.log("\n🏁 Finished all scheduled transactions!");
  console.log(
    `📊 Final Stats → Total TX: ${txCounter}, Success: ${successCount}, Failed: ${failCount}, Total Sent: ${ethers.formatEther(
      totalEthSent
    )} ETH, Total Gas Spent: ${ethers.formatEther(totalGasSpent)} ETH`
  );
}

mainLoop().catch(console.error);
