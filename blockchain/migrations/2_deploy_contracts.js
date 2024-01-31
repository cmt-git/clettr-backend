const Ettr = artifacts.require("Ettr");
const CLTRNFT = artifacts.require("CLTRNFT");
const SUSDC = artifacts.require("SUSDC");

module.exports = function (deployer) {
  deployer.deploy(Ettr);
  deployer.deploy(SUSDC);
  deployer.deploy(CLTRNFT);
};
