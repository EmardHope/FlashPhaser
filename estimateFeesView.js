var  ethers = require('ethers');
var   ABI  = require('./ABI.json');

async function main(){
let url = "https://rinkeby.arbitrum.io/rpc";
let targetContract_ABI = ABI.abi;
let targetContract_Address = '0x3C3D9646455AA99Dce44cDdBfD8413A82A5fEDb9';
let HttpProvider = new ethers.providers.JsonRpcProvider(url);

//const ethersWallet = ethers.Wallet.createRandom()
//let secret = ethersWallet.privateKey;
//let walletWithProvider = new ethers.Wallet(secret, HttpProvider);
let TargetContract = new ethers.Contract(targetContract_Address, targetContract_ABI, HttpProvider);
let TargetContractWithSigner = TargetContract.connect(HttpProvider);//or walletWithProvider

let _chainId = '10001'
let _tokenId = '5017'
let crossGas = await TargetContractWithSigner.estimateFeesView(_chainId,_tokenId);
console.log(ethers.utils.formatEther(crossGas.mul(1.2)))
}

main()