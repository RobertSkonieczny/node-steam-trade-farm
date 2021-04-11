class SteamTradeOffer {
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

    isSafeTrade() {
        return this.getMessage() == this.SECURITY_CODE.toString() && this.getItemsToGive().length == 0;
    }

}

module.exports = SteamTradeOffer;