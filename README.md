# Network Slicing

<p align="center">		
  <img src="./network-slicing-prototype/src/assets/img/kom_logo.png">		
 </p>		
 	
 ------------------------		

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

An angular2 + [truffle](https://github.com/trufflesuite/truffle) starter app. Write, compile & deploy smart contracts for Ethereum.

## Demo
Coming soon

## How to use
There are 2 small parts to successfully running this project.

### Part 1

1. `git clone https://dev.kom.e-technik.tu-darmstadt.de/gitlab/aoc-theses/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing.git`
2. `cd network-slicing-prototype`
3. `npm install`

### Part 2
For the second part, be sure you're connected to an Ethereum client before running the commands below. If you're new, install [testrpc](https://github.com/ethereumjs/testrpc) to run a local blockchain RPC server. After that, simply run `testrpc` in a new tab. You can also use geth to create your own private chain.

And then in the original tab, run:

4. `truffle compile` to compile your contracts
5. `truffle migrate` to deploy those contracts to the network
6. `npm start`. Navigate to `http://localhost:8080/`. The app will automatically reload if you change any of the source files.
7. Make sure there are no errors in browser console


## Running unit tests

1. Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
2. Run `truffle test` to run tests associated with your solidity smart contracts. The test folder for this can be found in the `test` directory at the root level of this project



## Contributors
1. [Jordi Bisbal](https://dev.kom.e-technik.tu-darmstadt.de/gitlab/jb64lori)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Technologies & Languages Used
1. Angular4 (Typescript/Javascript)
2. Truffle (Solidity)
