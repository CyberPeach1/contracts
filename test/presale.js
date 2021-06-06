const PreSale = artifacts.require("PreSale");
const Peach = artifacts.require("Peach");

contract('PreSale', ([minter, john]) => {
    beforeEach(async () => {
        this.preSale = await PreSale.new({from: minter});
        this.peach = await Peach.new({from: minter});
    });

    it("PreSale isn't started yet", async () => {
        assert.equal(
            await this.preSale.funding(),
            false,
            "Funding is started."
        );
        assert.equal(
            await this.preSale.isClosed(),
            false,
            "PreSale is closed."
        );
    });
    it("PreSale is configured and started", async () => {
        await this.preSale.setup(this.peach.address, minter);
        await this.peach.setPreSaleAddress(this.preSale.address);
        assert.equal(
            await this.preSale.funding(),
            true,
            "Funding is not started yet"
        );
        assert.equal(
            await this.peach.preSaleAddress(),
            this.preSale.address,
            "PreSale Address isn't set"
        );
    });
    it("Transaction min value", async () => {
        await this.preSale.setup(this.peach.address, minter);
        await this.peach.setPreSaleAddress(this.preSale.address);
        return this.preSale.sendTransaction({from: john, value: web3.utils.toWei('0.09'), gas: "471234"}).then(async (test)=> {
            const balanceAfter = await this.peach.balanceOf(john);
            assert.equal(
                web3.utils.toWei(balanceAfter.toString()),
                0,
                "Amount wasn't correctly taken from the sender"
            );
        }).catch(async (test)=> {
            const balanceAfter = await this.peach.balanceOf(john);
            assert.equal(
                web3.utils.toWei(balanceAfter.toString()),
                0,
                "Amount wasn't correctly taken from the sender"
            );
        });
    });
    it("Token flow test - Received BNB/PEACH and burn 2% fee", async () => {
        await this.preSale.setup(this.peach.address, minter);
        await this.peach.setPreSaleAddress(this.preSale.address);
        const beforeMinterBalance = await web3.eth.getBalance(minter);
        const val = web3.utils.toWei('0.1');
        return this.preSale.sendTransaction({from: john, value: val, gas: "471234"}).then(async (tx) => {
            const balanceAfter = await this.peach.balanceOf(john);
            const exchangeRate = await this.preSale.exchangeRate();
            const afterMinterBalance = await web3.eth.getBalance(minter);
            assert.equal(
                await web3.utils.fromWei(balanceAfter.toString()) * 1,
                await exchangeRate.toString() * 1 * 0.1,
                "Token Amount wasn't correctly taken from the sender"
            );
            assert.equal(
                beforeMinterBalance * 1 + val * 1,
                afterMinterBalance * 1,
                "BNB Amount wasn't correctly taken from the sender"
            );
        }).then(async () => {
            const beforeSupply = await this.peach.totalSupply();
            return this.peach.transfer(minter, web3.utils.toWei('100')).then(async (tx) => {
                const afterSupply = await this.peach.totalSupply();
                assert.equal(
                    await web3.utils.fromWei(beforeSupply.toString()) * 1,
                    await web3.utils.fromWei(afterSupply.toString()) * 1 + 2,
                    "2% fee wasn't burned"
                );
            });
        })
    });

});
