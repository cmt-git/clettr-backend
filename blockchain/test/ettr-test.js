const { assert } = require('chai');

const Ettr = artifacts.require("Ettr");
const CLTRNFT = artifacts.require("CLTRNFT");

require('chai')
.use(require('chai-as-promised'))
.should();

contract('Ettr', (accounts) => {
    let token;

    before(async () => {
        token = await Ettr.deployed();
    });
    
    describe('deployment', async () => {
        it('Deploys successfully.', async() => {
            token = await Ettr.deployed();
            const address = token.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('Token has the right name and symbol.', async() => {
            const token_name = await token.name()
            const token_symbol = await token.symbol()          
            assert.equal(token_name, "Ettr");
            assert.equal(token_symbol, "ETTR");
        })
    });

    describe('CLTRNFT mint', async() => {
        it('CLTRNFT mint successful', async() => {
            token = await CLTRNFT.deployed();
            const address = "0xe8265e5A7983a0A6C24b2d725726ebb0F58f3a18";

            const mint = await token.cltrnft_mint("123456789",5,address);
            const balance = await token.balanceOf(accounts[0]);
            assert.equal(balance, 1);
        });
    })
});
