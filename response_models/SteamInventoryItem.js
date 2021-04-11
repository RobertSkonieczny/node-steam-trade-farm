class SteamInventoryItem {
    constructor(response) {
        this.steamInventoryItemResponse = response;
    }
    // Add more names and things here on an as needed basis
    getName() {
        return this.steamInventoryItemResponse.market_hash_name;
    }


    /*
     * In the future we may want to start checking to see if we can get the lowest valued item and send that item instead.
     */
    getMarketPrice() {
        return null;
    }

    getRawData() {
        return this.steamInventoryItemResponse;
    }
}

module.exports = SteamInventoryItem;