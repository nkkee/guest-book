import { PostedMessage, messages, referralByPubKey, AccountPoints, accountPoints} from './model';

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



/**
 * Get the account Id for the given public key.
 * @param public_key  Base58 public key
 * @returns string | null
 */
export function getReferralAccountId(public_key: string): string  | null {
  const refAccount = referralByPubKey.get(public_key);
  if ( ! refAccount ) {
    return '';
  }
  return refAccount;
}


/**
 * Add referral key to the referrer account.
 * @param account_id 
 * @param public_key 
 */
export function addReferralKey(account_id: string, public_key: string): void {
  referralByPubKey.set(public_key, account_id);
}


/**
 * Get the referral points earned by the given referrer
 * @param account_id  The account id for referrer.
 * @returns AccountPoints
 */
export function getAccountPoints(account_id: string): AccountPoints {
  const ap = accountPoints.get(account_id);
  if ( ! ap ) {
    return new AccountPoints(0, new Array<string>());
  }
  return ap;
}


/**
 * Sign guest book with the given referrer public key.
 * Each time the guest book is signed by the referrer's public key, the referrer earns 1 point.
 * @param account_id  Referrer account Id.
 * @param referee_id  Referrer Id
 * @param public_key  Referrer public key.
 */
export function signBookWithGuestKey(account_id: string, referee_id: string, public_key: string): void {

  if ( account_id != referee_id ) {
    let ap = accountPoints.get(account_id);
    if ( ! ap ) {
      ap = new AccountPoints(1, new Array<string>());
    } else {
      ap = new AccountPoints(ap.points + 1, ap.senders);
    }
    ap.senders.push(referee_id);
    accountPoints.set(account_id, ap);
  }
}