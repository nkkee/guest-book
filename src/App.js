import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import Form from './components/Form';
import ReferralLink from './components/ReferralLink';
import SignIn from './components/SignIn';
import Messages from './components/Messages';
import * as nearAPI from 'near-api-js';

import { 
	// contractName,
	// createAccessKeyAccount,
  addAccessKey,
  getAccessKeyFromURL,
  hasAccessKey,
  checkAccessKey,
	postJson,
	// postSignedJson
} from './near-utils';

const KeyPair = nearAPI.utils.KeyPairEd25519;

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setMessages] = useState([]);
  const [refLink, setReferralLink] = useState('');
  const [referralKey, setReferralKey] = useState('');
  const [isAccountOwner, setAaccountOwner] = useState('');

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    contract.getMessages().then(setMessages);


    
    window.nearConfig = nearConfig;
    window.nearConfig = nearConfig;
    window.keystore = contract.account.connection.signer.keyStore;
    window.nearAPI = nearAPI;
    window.wallet = wallet;
    window.contract = contract;
    window.nearConfig = nearConfig;
    // nearConfig.contractName + "-referral-link"

    const url_public_key = getAccessKeyFromURL();

    
    window.getAccessKeyFromURL = getAccessKeyFromURL;
    window.hasAccessKey = hasAccessKey;
    if ( url_public_key ) {
      hasAccessKey(contract.account, url_public_key).then( (status) => {
        if ( status ) {
          setAaccountOwner(true);
        } else {
          setAaccountOwner(false);
          setReferralKey(url_public_key);
        }
      });
    }
  
    contract.account.connection.signer.keyStore.getKey(
      nearConfig.networkId,
      nearConfig.contractName + "-referral-link"
    ).then( (key) => {
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
    // console.log(contract);
    // console.log(KeyPair.fromRandom());
    // const key1 = nearAPI.KeyPair.fromRandom();
    const keyPair = KeyPair.fromRandom();
    // console.log(keyPair);
    const public_key = keyPair.publicKey.toString();
		implicitAccountId = Buffer.from(keyPair.publicKey.data).toString('hex');
    // const contractName = contract.account.accountId;
    // console.log(wallet);
    // console.log(nearConfig)
    // window.wallet = wallet;
    // window.contract = contract;
    // window.nearConfig = nearConfig;
    
    contract.account.connection.signer.keyStore.setKey(
      nearConfig.networkId,
      nearConfig.contractName + "-referral-link",
      keyPair
    );
    contract.addReferralKey({
      account_id: contract.account.accountId,
      public_key: public_key,
      amount: '1.0'
    });
    contract.getReferralAccountId({public_key: public_key});
    setReferralLink(window.location.origin + "?refkey=" + public_key);
    // addAccessKey(
    //   contract,
    //   public_key
    // );

		// WARNING NO RESTRICTION ON THIS ENDPOINT
		// const result = await postJson({
		// 	url: `${nearConfig.walletUrl}/add-key`,
		// 	data: { publicKey: keyPair.publicKey.toString() }
    // });

		// if (result && result.success) {
		// 	const isValid = await checkAccessKey(keyPair);
		// 	if (isValid) {
    //     contract.account.connection.signer.keyStore.setKey(
    //       nearConfig.networkId,
    //       nearConfig.contractName + "-referral-link",
    //       keyPair
    //     );
    //     setReferralLink(window.location.origin + "?refkey=" + key.publicKey.toString());
		// 	}
		// }
		return null;

    setReferralLink(window.location.origin + "/reflink/" + public_key);

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
      { !!currentUser && !!messages.length && <button onClick={generateReferralLink}>Generate Referral Link</button> }
      { !!currentUser && !!refLink && <ReferralLink link={refLink}/> }
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
    getReferralAccountId: PropTypes.func.isRequired
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
