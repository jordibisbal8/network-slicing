# Network Slicing

<p align="center">		
  <img src="./network-slicing-prototype/src/assets/img/kom_logo.png">		
 </p>		
 	
 ------------------------		

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.3.0.

An angular2 + [truffle](https://github.com/trufflesuite/truffle) starter app. Write, compile & deploy smart contracts for Ethereum.

## Demo

Coming soon ...

## How to use

To successfully run this project two parts need to be configured: the front-end + middleware and the back-end.

### Front-end + Middleware

1. Download the project localy on your computer: `git clone https://dev.kom.e-technik.tu-darmstadt.de/gitlab/aoc-theses/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing.git`
2. Access the folder `cd network-slicing-prototype`
3. Install all the packages and dependencies of the project `npm install`
4. Run front-end `npm start`, which starts the application in [locahost](http://localhost:8000). The app will automatically reload if you change any of the source files.
5. Open a new tab and in the same folder, run the following command to execute the middleware in port 3001 `gulp serve`

### Back-end

For the second part, we will use GETH to build our own private chain. After having defined the genesis file [genesis.json](https://lightrains.com/blogs/genesis-json-parameter-explained-ethereum), one Ethereum node must build it in order to start running the blockchain. For instance:

1. Go to to the geth folder `cd geth`
2. To initialize the node with the defined genesis block in the specified data directory.
`geth --datadir <path-to-directory> init genesis.json`
3. Run the node from the previous created data directory. More information on the meaning of each command line parameter can be found here [Go-ethereum](https://github.com/ethereum/go-ethereum/wiki/Command-Line-Options)
`geth --port 3000 --networkid 58342 --datadir="<path-to-directory>" --maxpeers=3 --rpc --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain "http://localhost:8000" --rpcapi "eth,net,web3,personal" --gasprice "0" --nodiscover console`
4. Create a mining address and unlock it.
`personal.newAccount('password')`
`web3.personal.unlockAccount(web3.personal.listAccounts[0],"password", 0)`
To create multiple clients into the blockchain this process should be repeated for the different actors. Thus, after executing these commands for each of the Ethereum clients, which should have the same genesis file and network ID but different domains, ports and data directories, these nodes need to be synchronized. To achieve this, Geth supports a feature called static nodes, which can be configured into \textit{<path-to-directory>/static-nodes.json}. These static nodes are added through the so-called \textbf{Enodes}, which are Ethereum nodes written in a URL scheme.

In our project, we have defined 5 clients privchain1, ..., privchain5, which perform the mining together. In addition, we run these clients with an extra parameter in command 3 `--preload "poetSimulation.js"`, which allow us to simulate the Proof of Elapsed Time (PoET) consensus protocol by preloading a Javascript file.

## Compile contracts

If a contract is modified, it should be compiled and uploaded on the Blockchain.

1. `truffle compile` to compile your contracts.
2. `truffle migrate` to deploy those contracts to the BC.


## Contributors
1. [Jordi Bisbal](https://dev.kom.e-technik.tu-darmstadt.de/gitlab/jb64lori)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
You can also contact me by: jordi.bisbalansaldo@stud.tu-darmstadt.de

## Technologies & Languages Used
1. Angular2 (HTML/Typescript)
2. Node.js
3. Truffle
4. Web3.js
5. GETH
6. Solidity

