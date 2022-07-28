//TODO Separate out SFMC functions into its own package
//TODO Explore possibility of sfmc-sdk to allow oAuth token
const SDK = require('sfmc-sdk');
const client = require('../sfmc/api/Client');

// Class Imports
import { Account } from '../sfmc/api/Account';
import { Folder } from '../sfmc/api/Folder';
import { Automation } from '../sfmc/api/Automation';
import { ContentBuilderAsset } from '../sfmc/api/ContentBuilderAssets';
import { sfmc_context_mapping } from './utils/sfmcContextMapping';

// Type Definition Imports
import { AuthObject } from './types/sfmc_auth_object';

/**
 * Creates an instance of BLDR SDK.
 *
 * @param {object} AuthObject Auth Object for making requests
 */
export class SFMC {
    client: any;
    folder: object;
    asset: object;
    account: object;
    automation: object;

    constructor(AuthObject: AuthObject) {
        this.client = new SDK(
            {
                client_id: AuthObject.client_id,
                client_secret: AuthObject.client_secret,
                auth_url: AuthObject.auth_url,
                account_id: AuthObject.account_id,
            },
            {
                eventHandlers: {
                    // onLoop: (type, accumulator) => console.log('Looping', type, accumlator.length),
                    // onRefresh: (options) => console.log('RefreshingToken.', Options),
                    logRequest: (req: any) =>
                        process.env.NODE_ENV === 'development'
                            ? console.log(req)
                            : null,
                    logResponse: (res: any) =>
                        process.env.NODE_ENV === 'development'
                            ? console.log(res)
                            : null,
                    onConnectionError: (ex: any, remainingAttempts: number) =>
                        process.env.NODE_ENV === 'development'
                            ? console.log(ex.code, remainingAttempts)
                            : null,
                },
                requestAttempts: 1,
                retryOnConnectionError: true,
            }
        );

        this.folder = new Folder(this.client, sfmc_context_mapping);
        this.asset = new ContentBuilderAsset(this.client);
        this.account = new Account(this.client);
        this.automation = new Automation(this.client);
        // this.describe = new Describe(this.client.soap);
        // this.dataExtension = new DataExtension(this.client.soap);
        // this.query = new QueryDefinition(this.client.rest, this.client.soap);
    }
}
