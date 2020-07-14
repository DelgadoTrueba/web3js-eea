const fs = require("fs");
const path = require("path");

const Web3 = require("web3");
const EEAClient = require("../../src");

const createGroup = require("../privacyGroupManagement/createPrivacyGroup");

const { orion, besu } = require("../keys.js");

const binary = fs.readFileSync(
  path.join(__dirname, "../solidity/EventEmitter/EventEmitter.bin")
);

const web3 = new EEAClient(new Web3(besu.node1.url), 2018);

const createGroupId = () => {
  return createGroup.createPrivacyGroup();
};

const createPrivateEmitterContract = privacyGroupId => {
  const contractOptions = {
    data: `0x${binary}`,
    privateFrom: orion.node1.publicKey,
    privacyGroupId,
    privateKey: besu.node1.privateKey
  };
  const address = "6ad6F24f1E3f90F75A8794De887ce5bc81E79500";
  web3.eea
    .createTransactionObject({ ...contractOptions, address })
    .then(resul => {
      console.log("tx object : !!!!!!!!!!!!");
      console.log(resul);
      return resul;
    })
    .catch(console.error);
  return web3.eea.sendRawTransaction(contractOptions);
};

const getPrivateContractAddress = transactionHash => {
  console.log("Transaction Hash ", transactionHash);
  return web3.priv
    .getTransactionReceipt(transactionHash, orion.node1.publicKey)
    .then(privateTransactionReceipt => {
      console.log("Private Transaction Receipt\n", privateTransactionReceipt);
      return privateTransactionReceipt.contractAddress;
    });
};

module.exports = async () => {
  const privacyGroupId = await createGroupId();
  const contractAddress = await createPrivateEmitterContract(privacyGroupId)
    .then(getPrivateContractAddress)
    .catch(console.error);
  return { contractAddress, privacyGroupId };
};

if (require.main === module) {
  module.exports();
}
