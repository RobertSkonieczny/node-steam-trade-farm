const SteamInventoryItem = require('../response_models/SteamInventoryItem.js');
var sleep = require('system-sleep');

const GAME_CODE = require('../config.js').gameCode;

class SteamBotAccountManager {
    constructor(client, community, tradeOfferManager ,credentials) {
        this.tradeOfferBot = tradeOfferManager;
        this.client = client; // Steam User
        this.community = community;
        this.inventory = [];
        this.credentials = credentials;
    }

    async getAndFetchInventory() {
        await this.#fetchInventory();
        return this.inventory;
    }

    getTradeOfferBot() {
        return this.tradeOfferBot;
    }

    getSteamCommunity() {
        return this.community;
    }

    getClient() {
        return this.client;
    }

    async getFirstItemInInventory() {
        var inventoryItems = await this.getAndFetchInventory();

        if (inventoryItems.length == 0) {
            throw new Error("Inventory for " + GAME_CODE + " appId is empty.");
        }
     
        return inventoryItems[0];
    }

    async sendTradeOffer(tradelink, message, steamInventoryItemList, maxRetries) {
        return new Promise(async (resolve, reject) => {
            let offer = this.tradeOfferBot.createOffer(tradelink);
            offer.setMessage(message);

            // Add all items to the trade offer.
            steamInventoryItemList.forEach(item => offer.addMyItem(item.getRawData()));

            offer.send(async (err, status) => {
                if (err) {
                    // Servers are non-consistant. Some trade offers can fail even though nothing is wrong with the trade offer.
                    // So we cna use simple recursion to try to resend the offer. It will retry N amount of times before fully crashing.
                    if (maxRetries == 0) return reject(err);
                    this.sendTradeOffer(tradelink, message, steamInventoryItemList, maxRetries-1)
                } else if (status == 'pending') {
                    this.printMessage('ABOUT TO CONFIRM THE CONFIRMATION');
                    await this.#acceptConfirmation(offer);
                    return resolve(1);
                }
            });
        });
    }

    async acceptIncomingSafeTradeOffer(offer) {
        return new Promise(async (resolve, reject) => {
            offer.accept((acceptanceErr) => {
                if (acceptanceErr) {
                    return reject(acceptanceErr);
                } else {
                    this.printMessage('Accepted trade');
                    return resolve(1);
                }
            });
        });   
    }

    printMessage(message) {
        console.log("[" + this.credentials.getUsername() + "] " + message);
    }


    /*
     * Private Function
     */
    async #fetchInventory() {
         this.inventory = await new Promise(async (resolve, reject) => {
             this.tradeOfferBot.getInventoryContents(GAME_CODE, 2, true, (err, inventory) => {
                 if (err) return reject(err);
                 return resolve(inventory.map(item => new SteamInventoryItem(item)));
            });
        });
    }

    async #acceptConfirmation(offer) {
        return await new Promise(async (resolve, reject) => {
            this.community.acceptConfirmationForObject(this.credentials.getIdentitySecret(), offer.id, (err) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(1);
                }
            });
        });
    }
}

module.exports = SteamBotAccountManager;