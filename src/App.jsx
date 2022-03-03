import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  /**
   * Create a varaible here that holds the contract address after you deploy!
   */
  const [allWaves, setAllWaves] = useState([]);
   const [tweetValue, setTweetValue] = React.useState("");
  const contractAddress = "0x09be1Ea98b3AAA3a77Db12EbC7cfec11566fc6De";
  const contractABI = abi.abi;
  
  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

/**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)         
    
      //useEffect(() => {
    getAllWaves();
  //}, [])
 
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();      
        console.log("Retrieved total wave count...", count.toNumber());

            //const waveTxn =  await wavePortalContract.wave({gasLimit:300000});
       // const waveTxn = await wavePortalContract.wave();
      //const waveTxn = await wavePortalContract.wave("this is a message")
      const waveTxn = await wavePortalContract.wave(tweetValue,{gasLimit:300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
              //useEffect(() => {
    getAllWaves();
  //}, [])
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 gm say it back
        </div>

        <div className="bio">
          connect your ethereum wallet and say gm
        </div>

        <div className="bio">
                  built by sj
                </div><p></p><p></p>

        {
          currentAccount ? (<textarea name="tweetArea" class="textinput"
            placeholder="gm"
            type="text"
            id="tweet"
            value={tweetValue}
            onChange={e => setTweetValue(e.target.value)} />) : null
        }
        <button className="waveButton" onClick={wave}>
          gm
        </button>
        

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            connect wallet
          </button>
        )} <p></p>

        
        {allWaves.slice(0).reverse().map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "White", marginTop: "16px", padding: "26px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App