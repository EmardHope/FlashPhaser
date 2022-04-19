import ABI from 'ABI.json'

const env = "mainnet";
const chainId = 421611;//42161;//A4B1
const price = 0.006;
let address;

const contractAddress = "0x3C3D9646455AA99Dce44cDdBfD8413A82A5fEDb9";
const etherscanUrl = "https://testnet.arbiscan.io/tx/";
let provider = null;

const abi = ABI.abi

window.onload = () => {
  var animateButton = function (e) {
    e.preventDefault;
    //reset animation
    e.target.classList.remove("animate");

    e.target.classList.add("animate");
    setTimeout(function () {
      e.target.classList.remove("animate");
    }, 700);
  };

  var bubblyButtons = document.getElementsByClassName("bubbly-button");

  for (var i = 0; i < bubblyButtons.length; i++) {
    bubblyButtons[i].addEventListener("click", animateButton, false);
  }

  window?.ethereum?.on("disconnect", () => {
    window.location.reload();
  });

  window?.ethereum?.on("networkChanged", () => {
    window.location.reload();
  });

  window?.ethereum?.on("chainChanged", () => {
    window.location.reload();
  });

  const connectWallet = async () => {
    await window.ethereum.enable();
    if (Number(window.ethereum.chainId) !== chainId) {
      return failedConnectWallet();
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts");
    document.getElementById("button").innerHTML = accounts[0];
  };

  const failedConnectWallet = () => {
    document.getElementById("button").innerHTML = "Error Network";
  };

  const switchNetwork = async () => {
    if (env === "test") {
      window?.ethereum
        ?.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x61",
              chainName: "BSC Testnet",
              nativeCurrency: {
                name: "BSC",
                symbol: "BNB",
                decimals: 18,
              },
              rpcUrls: ["https://data-seed-prebsc-1-s2.binance.org:8545"],
              blockExplorerUrls: ["https://testnet-explorer.binance.org/"],
            },
          ],
        })
        .then(() => {
          connectWallet();
        })
        .catch(() => {
          failedConnectWallet();
        });
    } else {
      window?.ethereum
        ?.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "421611",
              chainName: "Arbitrum Testnet",
              nativeCurrency: {
                name: "ArbETHx",
                symbol: "ArbETHxs",
                decimals: 18,
              },
              rpcUrls: ["https://rinkeby.arbitrum.io/rpc"],
              blockExplorerUrls: ["https://testnet.arbiscan.io/"],
            },
          ],
        })
        .then(() => {
          connectWallet();
        })
        .catch(() => {
          failedConnectWallet();
        });
    }
  };

  document.getElementById("button").addEventListener("click", switchNetwork);

  connectWallet();

  const handleMint = async () => {
    $.toast().reset("all");
    if (!provider) {
      connectWallet();
    } else {
      try {
        document.getElementById("mint").innerHTML = "Minting...";
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        const inputValue = document.getElementById("tokenId").value;
        if (!inputValue || Math.round(inputValue) !== Number(inputValue)) {
          document.getElementById("mint").innerHTML = "Mint";
          return $.toast({
            heading: "Error",
            text: "Enter an integer！",
            position: "top-center",
            showHideTransition: "fade",
            icon: "error",
          });
        } else if (inputValue > 10) {
          document.getElementById("mint").innerHTML = "Mint";
          return $.toast({
            heading: "Error",
            text: "Max amount 10！",
            position: "top-center",
            showHideTransition: "fade",
            icon: "error",
          });
        }
        const ImageContract = new ethers.Contract(contractAddress, abi, signer);
        const amountRaw = ethers.utils.parseUnits(`${price * inputValue}`, 18).toString();
        const balanceRaw = await provider.getBalance(account);
        const balance = ethers.utils.formatUnits(balanceRaw, 18);
        if (Number(balance) < price * inputValue) {
          document.getElementById("mint").innerHTML = "Mint";
          return $.toast({
            heading: "Error",
            text: "Insufficient balance！",
            showHideTransition: "fade",
            position: "top-center",
            icon: "error",
          });
        }
        const estimateGas = await ImageContract.estimateGas.mint(inputValue, {
          value: amountRaw,
        });
        const gasLimit = Math.floor(estimateGas.toNumber() * 2);

        const response = await ImageContract.mint(inputValue, {
          value: amountRaw,
          gasLimit,
        });
        $.toast({
          heading: "Minting",
          text: "Start to minting！",
          position: "top-center",
          showHideTransition: "fade",
          hideAfter: 10000,
          icon: "info",
        });
        const result = await response.wait();
        $.toast().reset("all");
        $.toast({
          heading: "Success",
          text: "Minted Success!",
          showHideTransition: "slide",
          position: "top-center",
          icon: "success",
        });
        document.getElementById("mint").innerHTML = "Mint";
        window.open(`${etherscanUrl}/${result.transactionHash}`);
      } catch (e) {}
    }
  };



  const handleCross = async () => {
    $.toast().reset("all");
    if (!provider) {
      connectWallet();
    } else {
      try {
        document.getElementById("cross").innerHTML = "Crossing...";
        const signer = await provider.getSigner();
        const account = await signer.getAddress();


        const _chainId = document.getElementById("_chainId").value;
        const _tokenId = document.getElementById("_tokenId").value;


        const ImageContract = new ethers.Contract(contractAddress, abi, signer);

        const crossGas = await ImageContract.estimateFeesView(_chainId,_tokenId);
        document.getElementById("fee").innerHTML = `Cross Chain Fee:${ethers.utils.formatEther(crossGas)}`;
        console.log(crossGas.toString())

        const estimateGas = await ImageContract.estimateGas.traverseChains(_chainId,_tokenId, {
          value: crossGas,
        });
        const gasLimit = Math.floor(estimateGas.toNumber() * 2);

        const response = await ImageContract.traverseChains(_chainId,_tokenId, {
          value: crossGas,
          gasLimit,
        });
        $.toast({
          heading: "Crossing",
          text: "Start to crossing",
          position: "top-center",
          showHideTransition: "fade",
          hideAfter: 10000,
          icon: "info",
        });
        const result = await response.wait();
        $.toast().reset("all");
        $.toast({
          heading: "Success",
          text: "Crossed Success!",
          showHideTransition: "slide",
          position: "top-center",
          icon: "success",
        });
        document.getElementById("cross").innerHTML = "Cross";
        window.open(`${etherscanUrl}/${result.transactionHash}`);
      } catch (e) {}
    }
  };




  const handleShow = async () => {
    $.toast().reset("all");
    if (!provider) {
      connectWallet();
    } else {
      try {
        document.getElementById("show").innerHTML = "Checking...";
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        const inputValue = document.getElementById("tokenId").value;

        const ImageContract = new ethers.Contract(contractAddress, abi, signer);
        const tokenBalance =  await ImageContract.balanceOf(account);//account token Balance
        $.toast({
          heading: "Loading...",
          text: "Start to load your NFT！",
          position: "top-center",
          showHideTransition: "fade",
          hideAfter: 10000,
          icon: "info",
        });

        let count = tokenBalance.toNumber();
        console.log(count)//
        let images=[];
        for(i=0;i<count;i++){
          let tokenId = await ImageContract.tokenOfOwnerByIndex(account,i);
          console.log(tokenId)//
          let tokenUri = await ImageContract.tokenURI(tokenId.toNumber());
          console.log(tokenUri)//
          let json = atob(tokenUri.substring(29));
          let result = JSON.parse(json);
          images.push(result.image);
        }
        let html =`<h2>You Minted:</h2>
        <div class="row" style="width:1200px" >`;
        for(let image of images){
          html +=`<div class="column" style="float:left;width:350px;margin-right:20px;">
          <img src="${image}" width="350" height="350">
          </div>`;
        }
        html +='</div>';
        $('div#minted').html(html);

        $.toast().reset("all");
        $.toast({
          heading: "Success",
          text: "Please check your NFTs!",
          showHideTransition: "slide",
          position: "top-center",
          icon: "success",
        });
        document.getElementById("show").innerHTML = "Show my NFT";
        window.open(`${etherscanUrl}/${result.transactionHash}`);
      } catch (e) {}
    }
  };
  document.getElementById("mint").addEventListener("click", handleMint);
  document.getElementById("show").addEventListener("click", handleShow);
  document.getElementById("cross").addEventListener("click", handleCross);
};