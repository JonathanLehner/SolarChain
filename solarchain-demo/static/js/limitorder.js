/**
 * NFT Offer Smart Contract
 * @module limitorder
 */

module.exports = function () {
  // let's import the needed modules
  const algosdk = require('algosdk');
  const fs = require('fs').promises;
  const limitTemplate = require("algosdk/src/logicTemplates/limitorder");
  var algoutils = require("./algoutils");

  // constants to use for the Algod client
  const token = {
    'X-API-Key': `LVLfUG208O9sYkHCCrq9z99CCCXghD49OQETIEF9`
  }

  const server = 'https://testnet-algorand.api.purestake.io/ps2';
  const port = '';

  // private key mnemonic to reconstitute the account that owns the PV asset
  let PVAccountMnemonic = "oyster chalk fan net shoot grocery board sample abuse asset host plug lift term manual noble rookie rescue goddess own essay oval false absent fortune";

  /**
   * Creates a NFT Offer smart contract
   *
   * @memberof limitorder
   * @async
   * @param {string} contractOwner The wallet address of the contract owner
   * @returns {string} The address of the created offer contract
   */
  this.createPVLimitContract = async function (contractOwner, price) {
    console.log("createPVLimitContract")
    console.log(price)
    console.log(contractOwner)

    // create the client
    let algodClient = new algosdk.Algodv2(token, server, port);

    let txParams = await algodClient.getTransactionParams().do();

    // INPUTS

    let ratn = parseInt(1); // 1 PV
    let ratd = parseInt(1000000*parseInt(price)/100); // for 1 Algo -- divided by 100 for demo due to limited Algos from faucet
    let assetID = 42004617; // ID of the PV asset
    let minTrade = 9999; // minimum number of microAlgos to accept
    let expiryRound = txParams.lastRound + parseInt(10000);
    let maxFee = 2000; // we set the max fee to avoid account bleed from excessive fees

    console.log(`Creating limit order contract...`);
    // create the limit contract template
    let limit = new limitTemplate.LimitOrder(contractOwner, assetID, ratn, ratd,
      expiryRound, minTrade, maxFee);

    // store the TEAL program and the address of the contract
    let program = limit.getProgram();
    let address = limit.getAddress();

    // at this point you can write the contract to storage in order to reference it later
    // we're going to do that right now
    console.log(`Contract created at address ${address}.`);
    console.log(`Writing contract to file at static/contracts/${address}...`);

    try {
      await fs.access(`static/contracts/`);
    } catch (e) {
      await fs.mkdir(`static/contracts/`);
    }

    await fs.writeFile(`static/contracts/${address}`, program);

    // next, we fund the contract account with the minimum amount of microAlgos required
    // this is 100,000 microAlgos (account minimum) plus two suggested fee amounts, one for
    // the contract funding transaction and one for the asset swap transaction
    // sender pays fee to send the required amount of Algos to the contract
    // so that's a total of 102,000 microAlgos

    console.log(`Reconstituting PV owner account from private key...`);
    let assetOwner = algosdk.mnemonicToSecretKey(PVAccountMnemonic);


    console.log(`Funding contract with the minimum amount of ??Algos required...`);
    let note = algosdk.encodeObj("Contract funding transaction");
    let fundingTx = algosdk.makePaymentTxnWithSuggestedParams(assetOwner.addr,
      address, 100000 + (1000 * 2), undefined, note, txParams);
    let signedFundingTx = fundingTx.signTxn(assetOwner.sk);
    let resultTx = (await algodClient.sendRawTransaction(signedFundingTx).do());
    await algoutils.waitForConfirmation(algodClient, resultTx.txId);
    console.log(`Transaction confirmed. Funding transaction ID: ${resultTx.txId}`);

    // return the NFT Offer's address on the blockchain
    return address;
  }

  /**
   * Executes a NFT Offer smart contract
   *
   * @memberof limitorder
   * @async
   * @param {string} contractAddress The address of a limit contract
   * @returns {string} The ID of the transaction that performed the asset swap
   */
  this.executePVLimitContract = async function (contractAddress, price) {
    // read the TEAL program from local storage
    const data = await fs.readFile(`static/contracts/${contractAddress}`);
    let limitProgram = data;

    // create the client
    let algodClient = new algosdk.Algodv2(token, server, port);

    // set the proper amounts
    let assetAmount = parseInt(1);
    let microAlgoAmount = parseInt(1000000*parseInt(price)/100);

    let txParams = await algodClient.getTransactionParams().do();

    // swap 1 PV for 1,000,000 microAlgos (+fee)
    let assetOwner = algosdk.mnemonicToSecretKey(PVAccountMnemonic);
    let secretKey = assetOwner.sk;

    console.log(`Attempting to execute contract...`);
    let txnBytes = limitTemplate.getSwapAssetsTransaction(limitProgram, assetAmount,
      microAlgoAmount, secretKey, txParams.fee, txParams.firstRound,
      txParams.lastRound, txParams.genesisHash);
    let tx = (await algodClient.sendRawTransaction(txnBytes).do());
    await algoutils.waitForConfirmation(algodClient, tx.txId);
    console.log(`Execution transaction ID: ${tx.txId}`);

    // return the transaction ID
    return tx.txId;
  }
}
