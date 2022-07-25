
//TODO Separate out SFMC functions into its own package
//TODO Explore possibility of sfmc-sdk to allow oAuth token
const sfmc_client = require('../sfmc/api/index')

interface AuthObject {
    client_id: String,
    client_secret: String,
    auth_url: string,
    account_id: number
}

/**
   * Creates an instance of BLDR SDK.
   *
   * @param {object} authObject Auth Object for making requests
   */
module.exports = class SFMC {
    authObject: AuthObject;
    client: Object;

    constructor(authObject:AuthObject) {
        this.client = sfmc_client.init(authObject);
        // this.folder = new Folder(this.client.soap);
        // this.asset = new Asset(this.client.rest);
        // this.account = new Account(this.client.soap);
        // this.describe = new Describe(this.client.soap);
        // this.dataExtension = new DataExtension(this.client.soap);
        // this.query = new QueryDefinition(this.client.rest, this.client.soap);
        // this.automation = new Automation(this.client.rest, this.client.soap);
    }
};
