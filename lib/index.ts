import { SFMC } from './sfmc/index';
import { AuthObject } from './types/sfmc_auth_object';
/*
 * Creates an instance of BLDR SDK.
 *
 * @param {object} authObject Auth Object for making requests
 */
module.exports = class BLDR {
    sfmc: {
        client: Object;
    };

    constructor(authObject: AuthObject) {
        this.sfmc = new SFMC(authObject);
        // this.asset = new Asset(this.client.rest);
        // this.account = new Account(this.client.soap);
        // this.describe = new Describe(this.client.soap);
        // this.dataExtension = new DataExtension(this.client.soap);
        // this.query = new QueryDefinition(this.client.rest, this.client.soap);
        // this.automation = new Automation(this.client.rest, this.client.soap);
    }
};
