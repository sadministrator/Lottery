const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
require('dotenv').config();

const mnemonic = process.env.MNEMONIC;
const provider = new HDWalletProvider(
    mnemonic,
    'https://rinkeby.infura.io/v3/0771c92c5c6c42669665a80daa68b848'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    const inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ['Hello Rinkeby!'] })
        .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to', inbox.options.address);
};
deploy();