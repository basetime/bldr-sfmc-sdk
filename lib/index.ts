import { SFMC } from './sfmc/index';
import { CLI } from './cli/index';
import { AuthObject } from './sfmc/types/sfmc_auth_object';
/*
 * Creates an instance of BLDR SDK.
 *
 * @param {object} authObject Auth Object for making requests
 */
class BLDR {
    sfmc: object;
    cli: object;
    constructor(authObject: AuthObject) {
        this.sfmc = new SFMC(authObject);
        this.cli = new CLI(this.sfmc)
        // this.asset = new Asset(this.client.rest);
        // this.account = new Account(this.client.soap);
        // this.describe = new Describe(this.client.soap);
        // this.dataExtension = new DataExtension(this.client.soap);
        // this.query = new QueryDefinition(this.client.rest, this.client.soap);
        // this.automation = new Automation(this.client.rest, this.client.soap);
    }
};

module.exports = BLDR
