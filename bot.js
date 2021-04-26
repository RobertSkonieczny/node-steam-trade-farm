const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const SteamTotp = require('steam-totp');

const SteamBotAccountManager = require('./managers/SteamBotAccountManager.js');
const SteamAccountCredentials = require('./utils/SteamAccountCredentials.js');
const SteamTradeOffer = require('./response_models/SteamTradeOffer.js');
const TradeOfferManager = require('steam-tradeoffer-manager');
var config = require('./config.js');

const mainClient = new SteamUser();
const botClient = new SteamUser();

const account1Credentials = new SteamAccountCredentials(config.account1.identity_secret, 
   config.account1.shared_secret, 
   config.account1.username, 
   config.account1.password,
   config.account1.tradelink
 );

const account2Credentials = new SteamAccountCredentials(config.account2.identity_secret, 
   config.account2.shared_secret, 
   config.account2.username, 
   config.account2.password,
   config.account2.tradelink
 );


var mainCommunity = new SteamCommunity();
var botCommunity = new SteamCommunity();

const MAX_RETRIES = 3;

var mainManager = new TradeOfferManager({
   "steam": mainClient, // Polling every 30 seconds is fine since we get notifications from Steam
   "domain": "example.com", // Our domain is example.com
   "language": "en" // We want English item descriptions
});

var botManager = new TradeOfferManager({
   "steam": botClient, // Polling every 30 seconds is fine since we get notifications from Steam
   "domain": "example.com", // Our domain is example.com
   "language": "en" // We want English item descriptions
});

const SECURITY_CODE = Math.floor((Math.random() * 99999) + 1);

var account1 = new SteamBotAccountManager(mainClient, mainCommunity, mainManager, account1Credentials);
var account2 = new SteamBotAccountManager(botClient, botCommunity, botManager, account2Credentials);

try {
   account1.getClient().logOn({
      "accountName": account1Credentials.getUsername(),
      "password": account1Credentials.getPassword(),
      "twoFactorCode": SteamTotp.generateAuthCode(account1Credentials.getSharedSecret())
   });

   account2.getClient().logOn({
      "accountName": account2Credentials.getUsername(),
      "password": account2Credentials.getPassword(),
      "twoFactorCode": SteamTotp.generateAuthCode(account2Credentials.getSharedSecret())
   }); 
} catch {
   console.log('Something went wrong with the signon process. If a steam guard message appeared try again in 1 minute If not ' +
      'Your username, password, shared secret, or identity secret is incorrect and you need to update it in your config file (Please check for both account1 and account2)'
   )
}


account1.getClient().on('loggedOn', () => {
   account1.printMessage('Logged in!');
});

account2.getClient().on('loggedOn', () => {
   account2.printMessage('Logged in!');
});

account2.getClient().on('webSession', async function(sessionID, cookies) {
   account2.getTradeOfferBot().setCookies(cookies);
   await account2.getSteamCommunity().setCookies(cookies);
});

account1.getClient().on('webSession', async function(sessionID, cookies) {
   account1.getTradeOfferBot().setCookies(cookies);
   await account1.getSteamCommunity().setCookies(cookies);
   // Get the Item we want to trade.
   var targetItem = await account1.getFirstItemInInventory();
   
   // Log the item we will be sending/receiving
   account1.printMessage("The item in which we are using is/an " + targetItem.getName());

   // Send the trade offer.
   await account1.sendTradeOffer(account2Credentials.getTradelink(), SECURITY_CODE.toString(), [targetItem], MAX_RETRIES);
});

account1.getTradeOfferBot().on('newOffer', async (offerResponse) => {
   account1.printMessage('RECEIVED TRADE OFFER');
   var offer = new SteamTradeOffer(offerResponse, SECURITY_CODE);
   if (offer.isSafeTrade()) {
      account1.printMessage('Confirmed this is a safe trade, accepting the offer.'); 
      await account1.acceptIncomingSafeTradeOffer(offerResponse,MAX_RETRIES);
   
      var newItem = await account1.getFirstItemInInventory();

      account1.printMessage('Sending the offer with a ' + newItem.getName());
      await account1.sendTradeOffer(account2Credentials.getTradelink(), SECURITY_CODE.toString(), [newItem], MAX_RETRIES);

   } else {
      account2.printMessage('Found unsafe trade');
   }

});

account2.getTradeOfferBot().on('newOffer', async (offerResponse) => {
   account2.printMessage('RECEIVED TRADE OFFER');
   var offer = new SteamTradeOffer(offerResponse, SECURITY_CODE);
   if (offer.isSafeTrade()) {
      account2.printMessage('Confirmed this is a safe trade, accepting the offer.'); 
      await account2.acceptIncomingSafeTradeOffer(offerResponse,MAX_RETRIES);

      var newItem = await account2.getFirstItemInInventory();

      account1.printMessage('Sending the offer with a ' + newItem.getName());
      await account2.sendTradeOffer(account1Credentials.getTradelink(), SECURITY_CODE.toString(), [newItem], MAX_RETRIES);
   } else {
      account2.printMessage('Found unsafe trade');
   }
});