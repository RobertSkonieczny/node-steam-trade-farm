/*
 * Written by Robbie Skonieczny
 * Any question send to me via steam. www.steamcommunity.com/id/koncealedcsgo
 * Any issues make an issue on github.
 * Github.com/Koncealed/node-steam-trade-farm
 */

// Apis
var SteamUser = require('steam-user');
var SteamCommunity = require('steamcommunity');
var SteamTotp = require('steam-totp');
var TradeOfferManager = require('steam-tradeoffer-manager'); // use require('steam-tradeoffer-manager') in production
var fs = require('fs');
var sleep = require('sleep');
// Clients
var mainClient = new SteamUser();
var botClient = new SteamUser();

// Managers
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

// Communities
var mainCommunity = new SteamCommunity();
var botCommunity = new SteamCommunity();

// Config
var config = JSON.parse(fs.readFileSync('./config.json'));

// Security Code
const SECURITY_CODE = Math.floor((Math.random() * 99999) + 1);


var counter = 0;
// Log On Options
var mainLogonOptions = {
   "accountName": config.accounts.account1.username,
   "password": config.accounts.account1.password,
   "twoFactorCode": SteamTotp.getAuthCode(config.accounts.account1.shared_secret)
};
var botLogonOptions = {
   "accountName": config.accounts.account2.username,
   "password": config.accounts.account2.password,
   "twoFactorCode": SteamTotp.getAuthCode(config.accounts.account2.shared_secret)
};

// Logging in...
mainClient.logOn(mainLogonOptions);
botClient.logOn(botLogonOptions);


/*
 *
 * Main Client Events!
 *
 */
mainClient.on('loggedOn', () => {
   console.log('Main Client Logged In!');
});


mainClient.on('webSession', function(sessionID, cookies) {
   mainManager.setCookies(cookies, function(err) {
      if (err) { // Handle Error.
         console.log(err);
         process.exit(1); // Exit, if we cannot connect, since we can't do anything.
         return;
      }
      mainManager.getInventoryContents(730, 2, true, function(err, inv) { // Load Inventory
         if (err) { // Handle Error.
            console.log('Error, in loading our inventory.')
            return;
         }
         var firstOffer = mainManager.createOffer(config.accounts.account2.tradelink); // Intialize Trade Offer
         for (var i = 0; i < inv.length; ++i) { // For a strange reason I couldn't pass this to a function. It would not work correctly
            var itemname = inv[i].market_hash_name.toLowerCase();
            if (itemname.includes('case')) {
               console.log('The item in which we are using is a/an ' + itemname)
               firstOffer.addMyItem(inv[i]);
               break;
            } else if (i == inv.length - 1) {
               console.log('We could not find a case.');
            }
         } // Wants to find a case typically around .03 cents. Don't want to use an expensive item.
         firstOffer.setMessage(SECURITY_CODE.toString()); // Set a message, so no one can slip in a trade, and try to steal your items.
         firstOffer.send((err, status) => { // Send offer.
            if(err) {
                console.log(err);
            } else {
                if (status == 'pending') { // Check if it needs to be confirmed.
               mainCommunity.acceptConfirmationForObject(config.accounts.account1.identity_secret, firstOffer.id, function(err) { // Try to accept Trade
                  if (err) { // Handle, any accepting errors.
                     console.log('Error accepting Trade.');
                     return;
                  } else { // It worked fine, Now the farm begins.
                     console.log('Trade offered. Counter is at : ' + counter);
                  }
               });
            }
            }
         });
      });
   });
   // Set Cookies.
   mainCommunity.setCookies(cookies);
});

mainManager.on('pollData', (pollData) => {
   fs.writeFile('polldata.json', JSON.stringify(pollData), function() {});
});

mainManager.on('newOffer', function(offer) {
   if (offer.message.toString() == SECURITY_CODE.toString() && offer.itemsToGive.length == 0) {
      console.log('Found our trade. #' + ++counter);
      offer.accept(function(err) {
         var identity_secret = config.accounts.account1.identity_secret;
         console.log('Main Account, has accepted trade. Now sending it back.');
         var newOffer = mainManager.createOffer(config.accounts.account2.tradelink);
         mainManager.getInventoryContents(730, 2, true, (err, inv) => {
            if (err) {
               console.log('Error getting our inventory.');
               return;
            } else {
               newOffer.addMyItem(inv[0]);
               newOffer.setMessage(SECURITY_CODE.toString());
               newOffer.send((err, status) => {
                  if (err) {
                    console.log(err);
                     console.log('Error, sending send back trade.');
                     return;
                  } else {
                     mainCommunity.acceptConfirmationForObject(config.accounts.account1.identity_secret, newOffer.id, () => {
                        console.log('Trade sent back!');
                     })
                  }
               })
            }
         });
      });
   } else {
      console.log('Ignorning trade.');
   }
});

/*
 *
 * Second Account Events!
 *
 */
botClient.on('loggedOn', () => {
   console.log('Bot Client Logged In!');
});

botClient.on('webSession', function(sessionID, cookies) {
   botManager.setCookies(cookies, function(err) {
      if (err) {
         return;
      }
   });
   botCommunity.setCookies(cookies);
});

botManager.on('newOffer', function(offer) {
   console.log('Trade #' + ++counter)
   console.log('Second Account found an Offer!');
   if (offer.message.toString() == SECURITY_CODE.toString() && offer.itemsToGive.length == 0) {
      offer.accept(function(err) {
         if(config.sleep_time > 0) {
           sleep.sleep(config.sleep_time);
         }
         var identity_secret = config.accounts.account2.identity_secret;
         console.log('Second Account, has accepted trade. Now sending it back.');
         var newOffer = botManager.createOffer(config.accounts.account1.tradelink);
         botManager.getInventoryContents(730, 2, true, (err, inv) => {
            if (err) {
               console.log('Error getting our inventory.');
               return;
            } else {
               newOffer.addMyItem(inv[0]);
               newOffer.setMessage(SECURITY_CODE.toString());
               newOffer.send((err, status) => {
                  if (err) {
                    console.log(err);
                     console.log('Error, sending send back trade.');
                     return;
                  } else {
                     botCommunity.acceptConfirmationForObject(config.accounts.account2.identity_secret, newOffer.id, (err) => {
                        if (err) {
                           console.log('Could not accept trade.');
                           return;
                        } else {
                           console.log('Trade sent back, Second account should recieve it in a few seconds.');
                        }
                     });
                  }
               });
            }
         });
      });
   } else {
      console.log('We found a trade, that has not been made by bot.');
   }
});

botManager.on('pollData', function(pollData) {
   fs.writeFile('polldata.json', JSON.stringify(pollData), function() {});
});
