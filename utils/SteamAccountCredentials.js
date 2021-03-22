export default class SteamAccountCredentials {

    constructor (identitySecret, sharedSecret, username, password, tradelink) {
        this.identitySecret = identitySecret
        this.sharedSecret = sharedSecret;
        this.username = username;
        this.password = password;
        this.tradelink = tradelink;
    }

    getIdentitySecret() {
        return this.identitySecret;
    }

    getSharedSecret() {
        return this.sharedSecret;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getTradelink() {
        return this.tradelink;
    }
}