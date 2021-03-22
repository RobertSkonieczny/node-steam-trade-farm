var SteamUser = require('steam-user');
var SteamCommunity = require('steamcommunity');
var SteamTotp = require('steam-totp');

const { default: SteamBotAccountManager } = require('./managers/SteamBotAccountManager');
const { default: SteamAccountCredentials } = require('./utils/SteamAccountCredentials');
const { default: SteamTradeOffer } = require('./response_models/SteamTradeOffer');

var mainClient = new SteamUser();
var botClient = new SteamUser();

var account1Credentials = new SteamAccountCredentials(config.accounts.account1.identity_secret, 
   config.accounts.account1.shared_secret, 
   config.accounts.account1.username, 
   config.accounts.account1.password
 );

 var account2Credentials = new SteamAccountCredentials(config.accounts.account2.identity_secret, 
   config.accounts.account2.shared_secret, 
   config.accounts.account2.username, 
   config.accounts.account2.password
 );

var mainCommunity = new SteamCommunity();
var botCommunity = new SteamCommunity();

var config = JSON.parse(fs.readFileSync('./config.json'));

const SECURITY_CODE = Math.floor((Math.random() * 99999) + 1);

var counter = 0;

// Logging in...
mainClient.logOn({
   "accountName": account1.getUsername(),
   "password": account1.getPassword(),
   "twoFactorCode": SteamTotp.getAuthCode(account1.getSharedSecret())
});

botClient.logOn({
   "accountName": account2.getUsername(),
   "password": account2.getPassword(),
   "twoFactorCode": SteamTotp.getAuthCode(account2.getSharedSecret())
});

var account1 = new SteamBotAccountManager(mainClient, account1Credentials);
var account2 = new SteamBotAccountManager(botClient, account2Credentials);



mainClient.on('loggedOn', () => {
   console.log('Main Client Logged In!');
});
botClient.on('loggedOn', () => {
   console.log('Bot Client Logged In!');
});

botClient.on('webSession', function(sessionID, cookies) {
   botManager.setCookies(cookies);
   botCommunity.setCookies(cookies);
});
mainClient.on('webSession', async function(sessionID, cookies) {
   await mainManager.setCookies(cookies);
   await mainCommunity.setCookies(cookies);
   // Get the Item we want to trade.
   var targetItem = (await account1.getItemIncludingName('case'))[0];
   
   // Log the item we will be sending/receiving
   console.log("The item in which we are using is/an " + targetItem.getName());

   // Send the trade offer.
   await account1.sendTradeOffer(account2Credentials.getTradelink(), SECURITY_CODE.toString());
});

mainManager.on('newOffer', async function(offerResponse) {
   console.log('Trade #' + ++counter)
   console.log('First Account found an Offer!');
   var offer = new SteamTradeOffer(offerResponse);
   if (!offer.isSafeTrade()) break;

   await account1.acceptTradeOffer(offerResponse);

   await account1.sendTradeOffer(account2Credentials.getTradelink(), SECURITY_CODE.toString());
});

botManager.on('newOffer', async function(offer) {
   console.log('Trade #' + ++counter)
   console.log('Second Account found an Offer!');
   var offer = new SteamTradeOffer(offerResponse);
   if (!offer.isSafeTrade()) break;

   await account2.acceptTradeOffer(offerResponse);

   await account2.sendTradeOffer(account1Credentials.getTradelink(), SECURITY_CODE.toString());
});
