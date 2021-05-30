import { PostedMessage, messages, ReferralAccount, referralByPubKey } from './model';

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addMessage(text: string): void {
  // Creating a new message and populating fields with our data
  const message = new PostedMessage(text);
  // Adding the message to end of the the persistent collection
  messages.push(message);
}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getMessages(): PostedMessage[] {
  const numMessages = min(MESSAGE_LIMIT, messages.length);
  const startIndex = messages.length - numMessages;
  const result = new Array<PostedMessage>(numMessages);
  for(let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}



// method for owner
export function getReferralAccountId(public_key: string): string {
  const refAccount = referralByPubKey.get(public_key);
  if ( ! refAccount ) {
    return '';
  }
  return refAccount.account_id;
}

export function addReferralKey(account_id: string, public_key: string, amount: string): void {
  const refAccount = new ReferralAccount(account_id, amount);
  referralByPubKey.set(public_key, refAccount);
}