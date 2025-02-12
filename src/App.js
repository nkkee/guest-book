import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import AccountPointsView from './components/AccountPointsView';
import Form from './components/Form';
import ReferralLink from './components/ReferralLink';
import SignIn from './components/SignIn';
import Messages from './components/Messages';
import * as nearAPI from 'near-api-js';

import {
  addAccessKey,
  getAccessKeyFromURL,
  hasAccessKey
} from './near-utils';

const KeyPair = nearAPI.utils.KeyPairEd25519;

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setMessages] = useState([]);
  const [refLink, setReferralLink] = useState('');
  const [referralKey, setReferralKey] = useState('');
  const [isAccountOwner, setAaccountOwner] = useState('');
  const [refAccount, setReferralAccount] = useState('');
  const [points, setPoints] = useState('');

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    contract.getMessages().then(setMessages);
    contract.getAccountPoints({account_id: contract.account.accountId}).then(setPoints);
    const url_public_key = getAccessKeyFromURL();

    if ( url_public_key ) {
      hasAccessKey(contract.account, url_public_key).then( (status) => {
        if ( status ) {
          setAaccountOwner(true);
        } else {
          setAaccountOwner(false);
          setReferralKey(url_public_key);
          console.log(url_public_key, "ref_account");
          contract.getReferralAccountId({public_key: url_public_key}).then( (ref) => {
            console.log(ref);
            setReferralAccount(ref);
          });
        }
      });
    }
  
    contract.account.connection.signer.keyStore.getKey(
      nearConfig.networkId,
      nearConfig.contractName + "-referral-link"
    ).then( (key) => {
      console.log("It worked", key);
      if ( ! key ) {
        return null;
      }
      setReferralLink(window.location.origin + "?refkey=" + key.publicKey.toString());
    });
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const { fieldset, message, donation } = e.target.elements;

    fieldset.disabled = true;

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known
    contract.addMessage(
      { text: message.value },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    ).then(() => {
      contract.getMessages().then(messages => {
        setMessages(messages);
        message.value = '';
        donation.value = SUGGESTED_DONATION;
        fieldset.disabled = false;
        message.focus();
      });

      if ( !!refAccount ) {
        contract.signBookWithGuestKey({
          account_id: refAccount,
          referee_id: contract.account.accountId,
          public_key: referralKey
        });
      }

    });
  };

  const signIn = () => {
    wallet.requestSignIn(
      nearConfig.contractName,
      'NEAR Guest Book'
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  const generateReferralLink = async () => {
    const keyPair = KeyPair.fromRandom();
    const public_key = keyPair.publicKey.toString();
		implicitAccountId = Buffer.from(keyPair.publicKey.data).toString('hex');
    
    contract.account.connection.signer.keyStore.setKey(
      nearConfig.networkId,
      nearConfig.contractName + "-referral-link",
      keyPair
    );
    contract.addReferralKey({
      account_id: contract.account.accountId,
      public_key: public_key
    });
    contract.getReferralAccountId({public_key: public_key}).then( (ref) => {
      setReferralAccount(ref);
    });
    setReferralLink(window.location.origin + "?refkey=" + public_key);
    addAccessKey(
      contract,
      public_key
    );
  }


  return (
    <main>
      <header>
        <h1>NEAR Guest Book</h1>
        { currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>
      { !!currentUser && !!points && <AccountPointsView accountPoints={points} /> }
      { !!currentUser && !!messages.length && <button onClick={generateReferralLink}>Generate Referral Link</button> }
      { !!currentUser && !!refLink && <ReferralLink link={refLink}/> }
      { !!refAccount && <h2>Referer: {refAccount}</h2>}
      { currentUser
        ? <Form onSubmit={onSubmit} currentUser={currentUser} />
        : <SignIn/>
      }
      { !!currentUser && !!messages.length && <Messages messages={messages}/> }
    </main>
  );
};


App.propTypes = {
  contract: PropTypes.shape({
    addMessage: PropTypes.func.isRequired,
    getMessages: PropTypes.func.isRequired,
    addReferralKey: PropTypes.func.isRequired,
    getReferralAccountId: PropTypes.func.isRequired,
    signBookWithGuestKey: PropTypes.func.isRequired,
    getAccountPoints: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
};

export default App;
