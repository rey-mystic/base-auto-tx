# base-auto-tx

An automation script for sending ETH transactions on the **Base Mainnet** using TypeScript + Ethers.js.  
Designed for micro-transactions with configurable intervals via the `.env` file.

---

## 🚀 Features
- Automatically send ETH to a target address (`TO_ADDRESS`)
- Custom interval between transactions (`INTERVAL_MS`)
- Low-fee mode (`LOW_FEE_MODE`)
- Automatic retries for failed transactions (`MAX_RETRIES`)
- Transaction limit (`TOTAL_TX`)
- Fully configurable through `.env`

---

## 📦 Installation

Clone the repository and install dependencies:

```
git clone https://github.com/rey-mystic/auto-tx-base.git
cd base-auto-tx
npm install
```

## ⚙️ Configuration

Create a .env file in the project root:
```
# 🔑 Sender account private key
PRIVATE_KEY=0x....

# 🌐 RPC endpoint (Base Mainnet)
RPC_URL=https://mainnet.base.org

# 🎯 Target address
TO_ADDRESS=0x....

# 💸 ETH amount per TX
AMOUNT_ETH=0.00000001

# ⏱ Interval between TX (ms) → 60000ms = 60 seconds
INTERVAL_MS=30000

# ⚡️ Gas multiplier if LOW_FEE_MODE=false
GAS_MULTIPLIER=1.1

# 🔁 Max retries if TX fails
MAX_RETRIES=3

# 🏷 Low gas fee mode
LOW_FEE_MODE=true

# 📊 Total number of transactions to execute
TOTAL_TX=300
```

## ▶️ Running the Script
```
npm run start
```
Run automatically without type npm run start with:
`auto_start.bat`

## ⚠️ Disclaimer

Use this script responsibly.
Any asset loss is the sole responsibility of the user.
For educational and experimental purposes only.
