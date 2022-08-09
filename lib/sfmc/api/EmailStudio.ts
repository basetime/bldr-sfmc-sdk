import { Client } from '../types/sfmc_client';
import { handleError } from '../utils/handleError';
import { automationStudioActivityTypes } from '../utils/automationActivityTypes';
import {
    MappingByActivityTypeId,
    MappingByActivityType,
} from '../utils/automationActivities';
const { getProperties } = require('sfmc-soap-object-reference');
const emailSendDefinition = getProperties('EmailSendDefinition');

export class EmailStudio {
    client;
    constructor(client: Client) {
        this.client = client;
    }
    /**
     * Search for Automations by SOAP API
     * @param {string} request.searchKey
     * @param {string} request.searchTerm
     * @returns
     */
    async searchEmailSendDefinition(request: {
        searchKey: string;
        searchTerm: string;
    }) {
        try {
            return this.client.soap.retrieveBulk(
                'Program',
                emailSendDefinition,
                {
                    filter: {
                        leftOperand: request.searchKey,
                        operator: 'like',
                        rightOperand: request.searchTerm,
                    },
                }
            );
        } catch (err: any) {
            return handleError(err);
        }
    }
       /**
     * Retrieve Email Send Definition
     *
     * @param {string} activityObjectId
     * @returns
     */
    async getEmailSendDefinitionActivity(ObjectID: string): Promise<{
        ObjectID: string;
        CustomerKey: string;
        Name: string;
        Description: string;
        CategoryID: number;
        SendClassification: {
            CustomerKey: string;
        };
        SuppressTracking: Boolean;
        IsSendLogging: Boolean;
        SendDefinitionList: {
            PartnerKey: string;
            ObjectID: string;
            List: {
                PartnerKey: string;
                ID: number;
                ObjectID: string;
            };
            SendDefinitionListType: number;
            CustomObjectID: string;
            DataSourceTypeID: number;
            IsTestObject: Boolean;
            SalesForceObjectID: string;
            Name: string;
        };
        Email: {
            ID: number;
        };
        BccEmail: string;
        AutoBccEmail: string;
        TestEmailAddr: string;
        EmailSubject: string;
        DynamicEmailSubject: string;
        IsMultipart: Boolean;
        IsWrapped: Boolean;
        DeduplicateByEmail: Boolean;
        ExclusionFilter: string;
        Additional: string;
        CCEmail: string;
    }> {
        try {
            const sendDefinitionResponse = await this.client.soap.retrieve(
                'EmailSendDefinition',
                emailSendDefinition,
                {
                    filter: {
                        leftOperand: 'ObjectID',
                        operator: 'equals',
                        rightOperand: ObjectID,
                    },
                }
            );

            if (
                sendDefinitionResponse.OverallStatus !== 'OK' ||
                sendDefinitionResponse.Results.length === 0
            ) {
                throw new Error(sendDefinitionResponse.OverallStatus);
            }

            const result = sendDefinitionResponse.Results[0];

            return {
                ObjectID: result.ObjectID,
                CustomerKey: result.CustomerKey,
                Name: result.Name,
                Description: result.Description,
                CategoryID: result.CategoryID,
                SendClassification: {
                    CustomerKey: result.SendClassification.CustomerKey,
                },
                SuppressTracking: result.SuppressTracking,
                IsSendLogging: result.IsSendLogging,
                SendDefinitionList: {
                    PartnerKey: result.SendDefinitionList.PartnerKey,
                    ObjectID: result.SendDefinitionList.ObjectID,
                    List: {
                        PartnerKey: result.SendDefinitionList.PartnerKey,
                        ID: result.SendDefinitionList.ID,
                        ObjectID: result.SendDefinitionList.ObjectID,
                    },
                    SendDefinitionListType:
                        result.SendDefinitionList.SendDefinitionListType,
                    CustomObjectID: result.SendDefinitionList.CustomObjectID,
                    DataSourceTypeID:
                        result.SendDefinitionList.DataSourceTypeID,
                    IsTestObject: result.SendDefinitionList.IsTestObject,
                    SalesForceObjectID:
                        result.SendDefinitionList.SalesForceObjectID,
                    Name: result.SendDefinitionList.Name,
                },
                Email: {
                    ID: result.Email.ID,
                },
                BccEmail: result.BccEmail,
                AutoBccEmail: result.AutoBccEmail,
                TestEmailAddr: result.TestEmailAddr,
                EmailSubject: result.EmailSubject,
                DynamicEmailSubject: result.DynamicEmailSubject,
                IsMultipart: result.IsMultipart,
                IsWrapped: result.IsWrapped,
                DeduplicateByEmail: result.DeduplicateByEmail,
                ExclusionFilter: result.ExclusionFilter,
                Additional: result.Additional,
                CCEmail: result.CCEmail,
            };
        } catch (err) {
            return handleError(err);
        }
    }

}
