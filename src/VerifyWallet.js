import React, { useState } from 'react';
import Web3 from 'web3';

const VerifyWallet = ({ user }) => {
  const [signed, setSigned] = useState(false);
  const [address, setAddress] = useState(null);

  const handleSignMessage = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature.');
      return;
    }

    try {
      await window.ethereum.enable();
      const web3 = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      setAddress(address);

      const message = 'This is a message to verify ownership of your wallet.';
      const signature = await web3.eth.personal.sign(message, address, '');
      console.log('Signature:', signature);
      setSigned(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {user ?
        <div>
          <p>Hello {user.username}! Please verify your wallet address:</p>
          {signed ?
            <div>
              <p>Wallet address: {address}</p>
              <p>Message signed successfully!</p>
              <p>Wallet linked to {user.username}!</p>
            </div>
            :
            <button onClick={handleSignMessage}>Verify Wallet with Web3</button>
          }
        </div>
        :
        <p>Please log in with Discord first.</p>
      }
    </div>
  );
};

export default VerifyWallet;
