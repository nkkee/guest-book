import getConfig from './config.js';
import * as nearAPI from 'near-api-js';

const {
    keyStores: { InMemoryKeyStore },
	Near, Account, Contract, KeyPair,
	utils: {
		format: {
			parseNearAmount
		}
	}
} = nearAPI;


export const addAccessKey = (contract, public_key) => {
	const contractMethods = getConfig('contractMethods')
	contract.account.addKey(
		public_key,
		// contract.contractId,
		// contractMethods.changeMethods,
		// parseNearAmount('0.1')
	);
}

export const getAccessKeyFromURL = () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	return urlParams.get('refkey');
}

export const hasAccessKey = async (account, accessKey) => {
	try {
		const accessKeys = await account.getAccessKeys();
		if (accessKeys.length > 0 && accessKeys.find(({ public_key }) => public_key === accessKey)) {
			return true;
		}
	} catch (e) {
		console.warn(e);
	}
	return false;
};

export const postSignedJson = async ({ account, contractName, url, data = {} }) => {
	return await fetch(url, {
		method: 'POST',
		headers: new Headers({ 'content-type': 'application/json' }),
		body: JSON.stringify({
			...data,
			accountId: account.accountId,
			contractName,
			...(await getSignature(account))
		})
	}).then((res) => res.json());
};

export const postJson = async ({ url, data = {} }) => {
	return await fetch(url, {
		method: 'POST',
		headers: new Headers({
			'content-type': 'application/json',
			'Access-Control-Allow-Origin': "localhost"
		}),
		body: JSON.stringify({ ...data })
	}).then((res) => res.json());
};


export const checkAccessKey = async (key, contract) => {
	const account = contract.account;
	const contractName = contract.contractName;
	const result = await postSignedJson({
		url: contract.walletUrl,
		contractName,
		account
	});
	return result && result.success;
};

// export const createAccessKeyAccount = (near, key) => {
// 	key.toString = () => key.secretKey;
// 	near.connection.signer.keyStore.setKey(networkId, contractName, key);
// 	const account = new Account(near.connection, contractName);
// 	return account;
// };

/********************************
Not used
********************************/

export const hasKey = async (near, accountId, publicKey) => {
	const pubKeyStr = publicKey.toString();
	const account = new nearAPI.Account(near.connection, accountId);
	try {
		const accessKeys = await account.getAccessKeys();
		if (accessKeys.length > 0 && accessKeys.find(({ public_key }) => public_key === pubKeyStr)) {
			return true;
		}
	} catch (e) {
		console.warn(e);
	}
	return false;
};

export const isAccountTaken = async (near, accountId) => {
	if (accountId.indexOf(nameSuffix) > -1) {
		return true;
	}
	accountId = accountId + nameSuffix;
	const account = new nearAPI.Account(near.connection, accountId);
	try {
		await account.state();
		return true;
	} catch (e) {
		if (!/does not exist/.test(e.toString())) {
			throw e;
		}
	}
	return false;
};
