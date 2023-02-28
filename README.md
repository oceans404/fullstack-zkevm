# zkEVM Counter
- Walk through the instructions in this README (main branch) to build a Counter dapp and deploy to the Polgon zkEVM testnet.
- Check out the completed code branch here: https://github.com/oceans404/fullstack-zkevm/tree/complete

First things first...
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

Initialize a hardhat project WITHOUT A README!

```shell
npx hardhat
```

Open the hardhat.config.js and paste in this code

```js
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    zkEVM: {
      url: `https://rpc.public.zkevm-test.net`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
    },
  },
};
```

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

Compile your contract code

```shell
npx hardhat compile
```

```shell
npx hardhat run scripts/deploy-counter.js --network zkEVM
```

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Verify the contract by following [my verification instructions](https://explorer.public.zkevm-test.net/address/0xF6C5DDd37F0203100030E79EEF6397D37767Be1E)



## Update the Frontend to turn it into a dapp

Copy the Counter.json file into your src folder
```shell
cp ./artifacts/contracts/Counter.sol/Counter.json ./src/Counter.json;
```

In App.js, import the ethers, the Counter file and log the contract's abi. Update the counterAddress to your deployed address.
```js
import Counter from "./Counter.json";
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






This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

#### Available Scripts

In the project directory, you can run:

##### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

##### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

##### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

##### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

#### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

##### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

##### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

##### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

##### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

##### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

##### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
