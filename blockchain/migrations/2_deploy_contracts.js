const Ettr = artifacts.require("Ettr");
const CLTRNFT = artifacts.require("CLTRNFT");

module.exports = function(deployer) {
  deployer.deploy(Ettr);
  deployer.deploy(CLTRNFT);
};
