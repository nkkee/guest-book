import { context, u128, PersistentVector, PersistentMap, MapEntry } from "near-sdk-as";

/** 
 * Exporting a new class PostedMessage so it can be used outside of this file.
 */
@nearBindgen
export class PostedMessage {
  premium: boolean;
  sender: string;
  constructor(public text: string) {
    this.premium = context.attachedDeposit >= u128.from('10000000000000000000000');
    this.sender = context.sender;
  }
}
/**
 * collections.vector is a persistent collection. Any changes to it will
 * be automatically saved in the storage.
 * The parameter to the constructor needs to be unique across a single contract.
 * It will be used as a prefix to all keys required to store data in the storage.
 */
export const messages = new PersistentVector<PostedMessage>("m");


/** 
 * Exporting a new class AccountPoints so it can be used outside of this file.
 * This class is used to track the points accumulated by the referer for each 
 * referral.
 */
 @nearBindgen
 export class AccountPoints {
   
   constructor(public points: u16, public senders: Array<string>) {
   }
 }


 /**
  * collections.map is a persistent collection. Any changes to it will
  * be automatically saved in the storage.
  * The parameter to the constructor needs to be unique across a single contract.
  * It will be used as a prefix to all keys required to store data in the storage.
  */
 export const referralByPubKey = new PersistentMap<string, string>("ReferralLink");

 
 /**
  * collections.map is a persistent collection. Any changes to it will
  * be automatically saved in the storage.
  * The parameter to the constructor needs to be unique across a single contract.
  * It will be used as a prefix to all keys required to store data in the storage.
  */
 export const accountPoints = new PersistentMap<string, AccountPoints>("Points");
