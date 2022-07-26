import { Client } from '../types/sfmc_client';
import { handleError } from '../utils/handleError';
import { buildFolderPathsSoap } from '../../cli/utils/BuildSoapFolderObjects';
import { automationStudioActivityTypes } from '../utils/automationActivityTypes';
import {
    MappingByActivityTypeId,
    MappingByActivityType,
} from '../utils/automationActivities';
import { capitalizeKeys } from '../utils/modifyObject';
import { guid } from '../../cli/utils';
const { getProperties } = require('sfmc-soap-object-reference');
const emailSendDefinition = getProperties('EmailSendDefinition');
const dataExtensionDefinition = getProperties('DataExtension');
const dataExtensionDefinitionField = getProperties('DataExtensionField');
import { FieldTypes } from '../types/objects/sfmc_data_extension_assets';

export class EmailStudio {
    client;
    folder;
    constructor(client: Client, folder: any) {
        this.client = client;
        this.folder = folder;
    }
    /**
     * Search for Automations by SOAP API
     * @param {string} request.searchKey
     * @param {string} request.searchTerm
     * @returns
     */
    searchEmailSendDefinition = async (request: {
        searchKey: string;
        searchTerm: string;
    }) => {
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
    };
    /**
     * Retrieve Email Send Definition
     *
     * @param {string} activityObjectId
     * @returns
     */
    getEmailSendDefinitionActivity = async (
        ObjectID: string
    ): Promise<{
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
    }> => {
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
        } catch (err: any) {
            return err;
        }
    };

    /**
     *
     * @param dataExtensionName
     * @returns
     */
    searchDataExtensionByName = async (request: {
        searchKey: string;
        searchTerm: string;
    }) => {
        return this.client.soap.retrieve(
            'DataExtension',
            dataExtensionDefinition,
            {
                filter: {
                    leftOperand: request.searchKey,
                    operator: 'like',
                    rightOperand: request.searchTerm,
                },
            }
        );
    };

    getAssetsByFolderArray = async (folderIdArray: number[]) => {
        let requestFilter = {};

        if (folderIdArray.length === 1) {
            requestFilter = {
                filter: {
                    leftOperand: 'CategoryID',
                    operator: 'equals',
                    rightOperand: folderIdArray[0],
                },
            };
        } else {
            requestFilter = {
                filter: {
                    leftOperand: 'CategoryID',
                    operator: 'IN',
                    rightOperand: folderIdArray,
                },
            };
        }

        const dataExtensionResponse = await this.client.soap.retrieve(
            'DataExtension',
            dataExtensionDefinition,
            requestFilter
        );

        if (dataExtensionResponse.OverallStatus !== 'OK') {
            throw new Error(dataExtensionResponse.OverallStatus);
        }

        return dataExtensionResponse;
    };

    /**
     *
     * @param dataExtensionName
     * @returns
     */
    retrieveDataExtensionPayloadByName = async (dataExtensionName: string) => {
        const dataExtension = await this.client.soap.retrieve(
            'DataExtension',
            dataExtensionDefinition,
            {
                filter: {
                    leftOperand: 'Name',
                    operator: 'equals',
                    rightOperand: dataExtensionName,
                },
            }
        );

        return dataExtension && this.getDataExtensionPayload(dataExtension);
    };

    /**
     *
     * @param dataExtensionName
     * @returns
     */
    retrieveDataExtensionPayloadByCustomerKey = async (customerKey: string) => {
        const dataExtension = await this.client.soap.retrieve(
            'DataExtension',
            dataExtensionDefinition,
            {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: customerKey,
                },
            }
        );

        return this.getDataExtensionPayload(dataExtension);
    };

    getDataExtensionPayload = async (dataExtension: any) => {
        let sendableName;
        let RelatesOnSub;
        let retentionPeriodLength;
        let retentionPeriod;
        let deleteRetentionPeriod;
        let rowRetention;
        let resetRetention;
        let retentionPeriodUnit;
        let sendableFieldType;

        if (
            Object.prototype.hasOwnProperty.call(dataExtension, 'Results') &&
            Object.prototype.hasOwnProperty.call(
                dataExtension.Results[0],
                'CustomerKey'
            )
        ) {
            const folderPathResponse =
                await this.folder.getParentFoldersRecursive({
                    contentType: 'dataextension',
                    categoryId: dataExtension.Results[0].CategoryID,
                });

            const compiledFolderPaths = await buildFolderPathsSoap(
                folderPathResponse.results
            );
            const dataExtensionFolderObject = compiledFolderPaths.folders.find(
                (folder) => folder.ID === dataExtension.Results[0].CategoryID
            );
            const { FolderPath } = dataExtensionFolderObject;

            const dataExtensionFields = await this.getDataExtensionFields(
                dataExtension.Results[0].CustomerKey
            );

            let sendable = dataExtension.Results[0].IsSendable;
            let retention = dataExtension.Results[0].DataRetentionPeriodLength;

            if (retention && retention > 0) {
                retention = true;
            }

            if (sendable) {
                sendableName =
                    dataExtension.Results[0].SendableDataExtensionField.Name;
                RelatesOnSub =
                    dataExtension.Results[0].SendableSubscriberField.Name;
            }

            if (retention) {
                retentionPeriodLength =
                    dataExtension.Results[0].DataRetentionPeriodLength;
                retentionPeriod = dataExtension.Results[0].DataRetentionPeriod;
                deleteRetentionPeriod =
                    dataExtension.Results[0].DeleteAtEndOfRetentionPeriod;
                rowRetention = dataExtension.Results[0].RowBasedRetention;
                resetRetention =
                    dataExtension.Results[0].ResetRetentionPeriodOnImport;
                retentionPeriodUnit =
                    dataExtension.Results[0].DataRetentionPeriodUnitOfMeasure;
            }

            let fieldLength = dataExtensionFields.Results.length;
            let dataExtensionFieldArr = dataExtensionFields.Results;

            let fieldArray = [];

            // Organize and format DE Field Schema
            for (let a = 0; a < fieldLength; a++) {
                let fieldObj = dataExtensionFieldArr[a];

                //Fields that need to be removed prior to creation of new DE
                delete fieldObj.AttributeMaps;
                delete fieldObj.CustomerKey;
                delete fieldObj.ObjectID;

                if (fieldObj.MaxLength == '' || fieldObj.MaxLength == 0) {
                    delete fieldObj.MaxLength;
                }

                delete fieldObj.StorageType;
                delete fieldObj.DataExtension;
                delete fieldObj.DataType;
                delete fieldObj.IsCreatable;
                delete fieldObj.IsUpdatable;
                delete fieldObj.IsRetrievable;
                delete fieldObj.IsQueryable;
                delete fieldObj.IsFilterable;
                delete fieldObj.IsPartnerProperty;
                delete fieldObj.IsAccountProperty;
                delete fieldObj.PartnerMap;
                delete fieldObj.Markups;
                delete fieldObj.Precision;

                if (fieldObj.FieldType !== 'Decimal') {
                    delete fieldObj.Scale;
                }

                delete fieldObj.Label;
                if (fieldObj.MinLength == '' || fieldObj.MinLength == 0) {
                    delete fieldObj.MinLength;
                }
                delete fieldObj.CreatedDate;
                delete fieldObj.ModifiedDate;
                delete fieldObj.ID;
                delete fieldObj.IsRestrictedPicklist;
                delete fieldObj.PicklistItems;
                delete fieldObj.IsSendTime;
                delete fieldObj.DisplayOrder;
                delete fieldObj.References;
                delete fieldObj.RelationshipName;
                delete fieldObj.Status;
                delete fieldObj.IsContextSpecific;
                delete fieldObj.Client;
                delete fieldObj.PartnerProperties;

                const field: FieldTypes = {
                    partnerKey: fieldObj.PartnerKey,
                    name: fieldObj.Name,
                    defaultValue: fieldObj.DefaultValue,
                    maxLength: fieldObj.MaxLength,
                    isRequired: fieldObj.IsRequired,
                    ordinal: fieldObj.Ordinal,
                    isPrimaryKey: fieldObj.IsPrimaryKey,
                    fieldType: fieldObj.FieldType,
                };

                if (fieldObj.FieldType === 'Decimal') {
                    field.scale = fieldObj.Scale;
                }

                fieldArray.push(field);

                //set sendable field type
                if (sendableName == fieldObj.Name) {
                    sendableFieldType = fieldObj.FieldType;
                }

                //Reset fieldObj
                fieldObj = '';
            }

            //Get DE Payload
            let de: {
                bldrId: string;
                name: string;
                customerKey: string;
                description: string;
                fields: FieldTypes[];
                category: {
                    categoryId: number;
                    folderPath: string;
                };
                isSendable?: Boolean;
                sendableDataExtensionField?: {
                    name: string;
                    fieldType: string;
                };
                sendableSubscriberField?: {
                    name: string;
                };
                dataRetentionPeriodLength?: number;
                dataRetentionPeriod?: string;
                deleteAtEndOfRetentionPeriod?: Boolean;
                rowBasedRetention?: Boolean;
                resetRetentionPeriodOnImport?: Boolean;
                dataRetentionPeriodUnitOfMeasure?: number;
            } = {
                bldrId: guid(),
                name: dataExtension.Results[0].Name,
                customerKey: dataExtension.Results[0].CustomerKey,
                description: dataExtension.Results[0].Description,
                fields: fieldArray,
                category: {
                    categoryId: dataExtension.Results[0].CategoryID,
                    folderPath: FolderPath,
                },
            };

            if (sendable) {
                if ((RelatesOnSub = '_SubscriberKey')) {
                    RelatesOnSub = 'Subscriber Key';
                }

                de.isSendable = true;
                de.sendableDataExtensionField = {
                    name: sendableName,
                    fieldType: sendableFieldType,
                };
                de.sendableSubscriberField = { name: RelatesOnSub };
            }

            if (retention) {
                de.dataRetentionPeriodLength = retentionPeriodLength;
                de.dataRetentionPeriod = retentionPeriod;
                de.deleteAtEndOfRetentionPeriod = deleteRetentionPeriod;
                de.rowBasedRetention = rowRetention;
                de.resetRetentionPeriodOnImport = resetRetention;
                de.dataRetentionPeriodUnitOfMeasure = retentionPeriodUnit;
            }

            return de;
        }
    };
    /**
     *
     * @param customerKey
     * @returns
     */
    getDataExtensionFields = async (customerKey: string) => {
        try {
            const resp = await this.client.soap.retrieve(
                'DataExtensionField',
                dataExtensionDefinitionField,
                {
                    filter: {
                        leftOperand: 'DataExtension.CustomerKey',
                        operator: 'equals',
                        rightOperand: customerKey,
                    },
                }
            );

            if (resp.OverallStatus !== 'OK') {
                throw new Error('Unable to Retrieve Folders');
            }
            return resp;
        } catch (err: any) {
            return err;
        }
    };

    postAsset = async (dataExtension: {
        name: string;
        customerKey: string;
        description: string;
        fields: {
            name: string;
            defaultValue: any;
            maxLength?: number;
            isPrimaryKey: Boolean;
            isRequired: Boolean;
            fieldType: string;
            ordinal: number;
            scale?: number;
        }[];
        categoryId: number;
        isSendable?: Boolean;
        sendableDataExtensionField?: {
            name: string;
            fieldType: string;
        };
        sendableSubscriberField?: {
            name: string;
        };
        dataRetentionPeriodLength?: number;
        dataRetentionPeriod?: string;
        rowBasedRetention?: Boolean;
        resetRetentionPeriodOnImport?: Boolean;
        retainUntil?: string;
    }) => {
        try {
            const fieldsArr = await this.mapFieldObj(dataExtension.fields);
            let dataExtensionCreate: {
                Name: string;
                CustomerKey: string;
                Description: string;
                CategoryID: number;
                Fields: {
                    Field: any[];
                };
                IsSendable?: Boolean;
                SendableDataExtensionField?: {
                    Name: string;
                    FieldType: string;
                };
                SendableSubscriberField?: {
                    Name: string;
                };
                DataRetentionPeriodLength?: number;
                DataRetentionPeriod?: string;
                RowBasedRetention?: Boolean;
                ResetRetentionPeriodOnImport?: Boolean;
                RetainUntil?: string;
            } = {
                Name: dataExtension.name,
                CustomerKey: dataExtension.customerKey,
                Description: dataExtension.description,
                CategoryID: dataExtension.categoryId,
                Fields: {
                    Field: fieldsArr,
                },
            };

            if (dataExtension.isSendable) {
                dataExtensionCreate.IsSendable = dataExtension.isSendable;
            }
            if (dataExtension.sendableDataExtensionField) {
                dataExtensionCreate.SendableDataExtensionField = {
                    Name: dataExtension.sendableDataExtensionField.name,
                    FieldType:
                        dataExtension.sendableDataExtensionField.fieldType,
                };
            }
            if (dataExtension.sendableSubscriberField) {
                dataExtensionCreate.SendableSubscriberField = {
                    Name: dataExtension.sendableSubscriberField.name,
                };
            }
            if (dataExtension.dataRetentionPeriodLength) {
                dataExtensionCreate.DataRetentionPeriodLength =
                    dataExtension.dataRetentionPeriodLength;
            }
            if (dataExtension.dataRetentionPeriod) {
                dataExtensionCreate.DataRetentionPeriod =
                    dataExtension.dataRetentionPeriod;
            }
            if (dataExtension.rowBasedRetention) {
                dataExtensionCreate.RowBasedRetention =
                    dataExtension.rowBasedRetention;
            }
            if (dataExtension.resetRetentionPeriodOnImport) {
                dataExtensionCreate.ResetRetentionPeriodOnImport =
                    dataExtension.resetRetentionPeriodOnImport;
            }
            if (dataExtension.retainUntil) {
                dataExtensionCreate.RetainUntil = dataExtension.retainUntil;
            }

            return this.client.soap.create(
                'DataExtension',
                dataExtensionCreate,
                {}
            );
        } catch (err) {
            return err;
        }
    };

    mapFieldObj = (
        fields: {
            name: string;
            defaultValue: any;
            maxLength?: number;
            isPrimaryKey: Boolean;
            isRequired: Boolean;
            fieldType: string;
            ordinal: number;
            scale?: number;
        }[]
    ) => {
        const fieldsObj = fields.map((field) => {
            return capitalizeKeys(field);
        });

        return fieldsObj;
    };
}
