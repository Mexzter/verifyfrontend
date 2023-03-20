import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import axios from 'axios';

const DiscordLogin = () => {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const hashParams = window.location.hash.substring(1).split('&').reduce((acc, param) => {
      const [key, value] = param.split('=');
      acc[key] = value;
      return acc;
    }, {});

    if (hashParams.access_token) {
      localStorage.setItem('discordAccessToken', hashParams.access_token);
      window.location.hash = '';
    }

    const accessToken = localStorage.getItem('discordAccessToken');
    if (!accessToken) return;

    fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
      .then(response => response.json())
      .then(data => setUser(data))
      .catch(error => console.error(error));
  }, []);

  const handleDiscordLogin = () => {
    const clientId = '416905838788083712';
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = 'identify';

    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  };

  const handleDiscordLogout = () => {
    localStorage.removeItem('discordAccessToken');
    setUser(null);
  };

  const handleWalletVerification = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      const address = await web3.eth.requestAccounts()
      console.log(address[0])


      axios.post('https://api.mexzter.dev/api/address', {
        address: address[0]
      })
        .then(async response => {
          setWalletAddress(`Requesting token for ${address}`);
          console.log(response.data);
          const { message, uuid } = response.data
          const token = message + uuid

          const signature = await web3.eth.personal.sign(token, accounts[0], '');
          const recovered = web3.eth.accounts.recover(token, signature);

          console.log(user.id)

          const userid = await user.id

          axios.post('https://api.mexzter.dev/api/verify', {
          userid: userid,
          uuid: uuid,
          message: message,
          signature: signature,
          wallet: recovered
          })
          .then(response => {
            console.log(response.data);
            setWalletAddress(`Succesfully verified - ${recovered}`);
          })
          .catch(error => {
            setWalletAddress(`Signatures do not match, please try again`);
          });


        })
        .catch(error => {
          console.error(error);
        });

      // console.log(signature)
      // setWalletAddress(recovered);
    } catch (error) {
      console.error(error);
    }
  };

  return (
<div className="center-container">
<div className="profile-container">
  {user ? (
    <>
      <img className="profile-image" src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Discord profile" />
      <span className="profile-username">{user.username}#{user.discriminator}</span>
      <button className="verify-button" onClick={handleWalletVerification}>Verify Wallet</button>
      <p>{walletAddress}</p>
      <button className="logout-button" onClick={handleDiscordLogout}>Logout</button>
    </>
  ) : (
    <button className="login-button" onClick={handleDiscordLogin}>Login with Discord</button>
  )}
</div>
</div>
  );
};

export default DiscordLogin;
