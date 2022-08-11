import { Client } from '../types/sfmc_client';
import { handleError } from '../utils/handleError';
const { getProperties } = require('sfmc-soap-object-reference');
const ListDefinition = getProperties('List');
const AccountDefinition = getProperties('Account');

export class Account {
    client;
    constructor(client: Client) {
        this.client = client;
    }
    /**
     * Retrieve SFMC Account details for an instance
     * @returns
     */
    async getInstanceDetails() {
        try {
            const request = await this.client.soap.retrieve(
                'List',
                ListDefinition,
                {
                    QueryAllAccounts: true,
                    filter: {
                        leftOperand: 'ListName',
                        operator: 'equals',
                        rightOperand: 'All Subscribers',
                    },
                }
            );

            if (request.OverallStatus.includes('Error:')) {
                throw new Error(request.OverallStatus);
            }

            return request;
        } catch (err: any) {
            return handleError(err);
        }
    }
    /**
     * Get a single Business Units details
     *
     * @param {number} mid
     * @returns
     */
    async getBusinessUnitDetails(mid: number) {
        try {
            const request = await this.client.soap.retrieve(
                'Account',
                AccountDefinition,
                {
                    QueryAllAccounts: true,
                    filter: {
                        leftOperand: 'ID',
                        operator: 'equals',
                        rightOperand: mid,
                    },
                }
            );

            if (request.OverallStatus.includes('Error:'))
                throw new Error(request.OverallStatus);

            return request;
        } catch (err: any) {
            return handleError(err);
        }
    }

    async getAllBusinessUnitDetails(mids?: number[]) {
        try {
            const businessUnitDetails = [];

            let midsArray;
            if (mids && Array.isArray(mids)) {
                midsArray = mids;
            }
            if (mids && !Array.isArray(mids)) {
                midsArray = [mids];
            } else {
                // If no argument is passed, get all Business Unit Details
                const getAllMidsRequest = await this.getInstanceDetails();

                if (getAllMidsRequest.OverallStatus !== 'OK') {
                    throw new Error(getAllMidsRequest);
                }

                midsArray = getAllMidsRequest.Results.map(
                    (BU: {
                        Client: {
                            ID: number;
                        };
                    }) => {
                        return BU.Client.ID;
                    }
                );
            }

            for (let m in midsArray) {
                const mid = midsArray[m];
                const businessUnitDetail = await this.getBusinessUnitDetails(
                    mid
                );
                businessUnitDetails.push(...businessUnitDetail.Results);
            }

            return businessUnitDetails;
        } catch (err: any) {
            return handleError(err);
        }
    }
}
