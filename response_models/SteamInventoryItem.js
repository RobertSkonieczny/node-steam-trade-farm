export default class SteamInventoryItem {
    constructor(response) {
        this.steamInventoryItemResponse = response;
    }
    // Add more names and things here on an as needed basis
    getName() {
        return this.steamInventoryItemResponse.market_hash_name;
    }

    getMarketPrice() {
        
    }

    getRawData() {
        return this.steamInventoryItemResponse;
    }
}