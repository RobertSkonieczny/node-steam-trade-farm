export default class SteamTradeOffer {
    constructor(incomingOffer, securityCode) {
        this.offer = incomingOffer;
        this.SECURITY_CODE = securityCode;
    }

    getMessage() {
        return this.offer.message;
    }

    getItemsToGive() {
        return this.offer.itemsToGive;
    }

    acceptTrade() {
        
    }

    isSafeTrade() {
        return this.getMessage() == SECURITY_CODE.toString() && this.getItemsToGive().length == 0;
    }

}