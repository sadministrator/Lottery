const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows first player to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('.01', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(1, players.length);
        assert.strictEqual(accounts[0], players[0]);
    });

    it('allows multiple players to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('.01', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('.01', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('.01', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(3, players.length);
        for(let i = 0; i < players.length; i++) {
            assert.strictEqual(accounts[i], players[i]);
        }
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('.0001', 'ether')
            });

            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('disallows non-managers from picking a winner', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('.01', 'ether')
        });

        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });

            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('allows the manager to pick a winner', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('.01', 'ether')
        });

        try {
            await lottery.methods.pickWinner().send({
                from: accounts[0]
            });

            assert(true);
        } catch (err) {
            assert(false);
        }
    });

    it('sends money to the winner and resets the array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        });
        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('.8', 'ether'));

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.strictEqual(0, players.length);

        const balance = await lottery.methods.getBalance().call({
            from: accounts[0]
        });
        assert.strictEqual(0, Number(balance));
    });
});