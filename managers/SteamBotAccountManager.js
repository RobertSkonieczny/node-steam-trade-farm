import SteamInventoryItem from '../response_models/SteamInventoryItem';

var TradeOfferManager = require('steam-tradeoffer-manager'); // use require('steam-tradeoffer-manager') in production

export default class SteamBotAccountManager {
    async constructor(client, credentials) {
        this.tradeOfferBot = new TradeOfferManager({
            "steam" : client,
            "domain" : "google.com",
            "language" : "en"
        });
        this.client = client; // Steam User
        this.community = this.community;
        this.inventory = [];
        this.credentials = credentials;
    }
    /*
     * Pubic Functions
     */
    async getAndFetchInventory() {
        _fetchInventory();
        return this.inventory;
    }

    async getItemIncludingName(name) {
        var inventoryItems = await this.getAndFetchInventory();
        var listOfItems = [];

        for (item in inventoryItems) {
            if (item.getName().contains(name)) {
                listOfItems.append(item);
            }
        }
        return listOfItems;
    }

    async sendTradeOffer(tradelink, message, steamInventoryItemList) {
        // Create offer and set the messsage
        var offer = await this.tradeOfferBot.createOffer(tradelink);
        offer.setMessage(message);

        // Add all items to the trade offer.
        steamInventoryItemList.forEach(item => offer.addMyItem(item.getRawData()));

        await offer.send();
    }

    async acceptTradeOffer(offer) {
        await this.community.acceptConfirmationForObject(credentials.getIdentitySecret(), offerId);
        await offer.accept();
    } 


    /*
     * Private Functions
     */
    async _fetchInventory() {
        this.inventory = [];
        this.tradeOfferBot.getInventoryContents().forEach(response => new SteamInventoryItem(response));
    }

}