# Create a Fullstack Counter Dapp on the Polygon zkEVM Testnet

- Walk through the instructions in this README (main branch) to build a Counter dapp and deploy to the Polgon zkEVM testnet.
- Check out the completed code branch here: https://github.com/oceans404/fullstack-zkevm/tree/complete

## General Setup

- add the Polygon zkEVM Testnet Network to your Metamask Networks: https://www.youtube.com/watch?v=Y1gOkTsXgSY
- Get some zkEVM testnet ETH: https://www.youtube.com/watch?v=eYZAPkTCgwg

Star this repo and clone it locally
```shell
git clone https://github.com/oceans404/fullstack-zkevm
```

Install dependencies and start react app

```shell
cd fullstack-zkevm
npm i
npm start
```

Install dependencies

```shell
npm install ethers hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers dotenv
```

```shell
cp .env.sample .env;
```

Update .env to set your ACCOUNT_PRIVATE_KEY environment variable. [Here's an article](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key#:~:text=On%20the%20account%20page%2C%20click,click%20%E2%80%9CConfirm%E2%80%9D%20to%20proceed) on how to get your private key from MetaMask.


## Hardhat Smart Contract

Before running npx hardhat, rename your README.md file temporarily. (README.md -> README-tutorial.md) Hardhat can't initialize a sample project if there's an existing README file.

```shell
npx hardhat
```
What do you want to do? … 
❯ Create a JavaScript project

Hardhat project root: default

Do you want to add a .gitignore? y

Open the hardhat.config.js and paste in this code:

```js
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  paths: {
    artifacts: "./src",
  },
  networks: {
    zkEVM: {
      url: `https://rpc.public.zkevm-test.net`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
    },
  },
};
```

Notice that we've added a different path to artifacts so that the React app will be able to read the contract ABI within the src folder

Create a new file in the contracts folder `Counter.sol`

```shell
touch contracts/Counter.sol
```

Copy paste in the Counter contract code

```solidity
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Counter {
  string greeting;

  uint256 currentCount = 0;

    function increment() public {
        currentCount = currentCount + 1;
    }

    function retrieve() public view returns (uint256){
        return currentCount;
    }
}
```


Create a new file in the scripts folder `deploy-counter.js` 


```shell
touch scripts/deploy-counter.js
```

and add the following code to the `deploy-counter.js`  file

```js
const hre = require("hardhat");

async function main() {
  const CounterContractFactory = await hre.ethers.getContractFactory("Counter");
  const counterContract = await CounterContractFactory.deploy();

  await counterContract.deployed();

  console.log(
    `Counter contract deployed to https://explorer.public.zkevm-test.net/address/${counterContract.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


```

Compile your contract code

```shell
npx hardhat compile
```

```shell
npx hardhat run scripts/deploy-counter.js --network zkEVM
```


Verify the contract by following [my verification instructions](https://github.com/oceans404/zkevm-hardhat-demo#verify-your-polygon-zkevm-testnet-contract)


## Update the Frontend to turn it into a dapp

In App.js, import the ethers, the Counter file and log the contract's abi. Update the counterAddress to your deployed address.
```js
import { ethers } from "ethers";
import Counter from "./contracts/Counter.sol/Counter.json";
const counterAddress = "your-contract-address"
console.log(counterAddress, "Counter ABI: ", Counter.abi);
```

Update frontend counter to read from blockchain

```js
useEffect(() => {
    // declare the data fetching function
    const fetchCount = async () => {
      const data = await readCounterValue();
      return data;
    };

    fetchCount().catch(console.error);
}, []);

  async function readCounterValue() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("provider", provider);
      const contract = new ethers.Contract(
        counterAddress,
        Counter.abi,
        provider
      );
      console.log("contract", contract);
      try {
        const data = await contract.retrieve();
        console.log(data);
        console.log("data: ", parseInt(data.toString()));
        setCount(parseInt(data.toString()));
      } catch (err) {
        console.log("Error: ", err);
        alert(
          "Switch your MetaMask network to Polygon zkEVM testnet and refresh this page!"
        );
      }
    }
  }
```

Let's track a loader. Add this to your state

```js
const [isLoading, setIsLoading] = useState(false);
```

Let frontend counter write to the blockchain by adding the following 2 functions.

```js
async function requestAccount() {
  await window.ethereum.request({ method: "eth_requestAccounts" });
}

async function updateCounter() {
  if (typeof window.ethereum !== "undefined") {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log({ provider });
    const signer = provider.getSigner();
    const contract = new ethers.Contract(counterAddress, Counter.abi, signer);
    const transaction = await contract.increment();
    setIsLoading(true);
    await transaction.wait();
    setIsLoading(false);
    readCounterValue();
  }
}
```

Update the incrementCounter function to

```js
const incrementCounter = async () => {
  await updateCounter();
};
```

Update the increment button code to

```js
<Button
  onClick={incrementCounter}
  variant="outlined"
  disabled={isLoading}
>
  {isLoading ? "loading..." : "+1"}
</Button>
```

You did it! 🚀 Want to deploy your dapp to Fleek for decentralized hosting? [Follow my instructions here](https://github.com/oceans404/fullstack-sockets-demo#deploy-your-frontend)
