/**
 * Identify AutomationStudio Activity Details by Activity Type
 *
 * @param {string} activityType
 * @returns
 */
const MappingByActivityType = (activityType: string) => {
    let out;

    switch (activityType) {
        case 'queries':
            out = {
                objectTypeId: 300,
                api: 'queries',
                name: 'queryactivity',
                objectIdKey: 'queryDefinitionId',
                folder: 'Automation Studio/Query',
            };
            break;
        case 'scripts':
            out = {
                objectTypeId: 423,
                api: 'scripts',
                name: 'ssjsactivity',
                objectIdKey: 'ssjsActivityId',
                folder: 'Automation Studio/Scripts',
            };
            break;
        case 'imports':
            out = {
                objectTypeId: 43,
                api: 'imports',
                name: 'importactivity',
                objectIdKey: 'importDefinitionId',
                folder: 'Automation Studio/File Imports',
            };
            break;
        case 'filetransfers':
            out = {
                objectTypeId: 53,
                api: 'filetransfers',
                name: 'transferactivity',
                objectIdKey: 'id',
                folder: 'Automation Studio/File Transfers',
            };
            break;
        case 'filters':
            out = {
                objectTypeId: 303,
                api: 'filters',
                name: 'filteractivity',
                objectIdKey: 'filterActivityId',
                folder: 'Automation Studio/Filters',
            };
            break;

        case 'dataextracts':
            out = {
                objectTypeId: 73,
                api: 'dataextracts',
                name: 'dataextractactivity',
                objectIdKey: 'dataExtractDefinitionId',
                folder: 'Automation Studio/Extracts',
            };
            break;
        case 'EmailSendDefinition':
            out = {
                objectTypeId: 42,
                api: 'EmailSendDefinition',
                name: 'userinitiatedsend',
                objectIdKey: 'ObjectID',
                folder: 'Automation Studio/User-Initiated',
            };
            break;
        default:
    }

    return out;
};

/**
 * Identify AutomationStudio Activity Details by Activity Type ID
 *
 * @param {number} activityTypeId
 * @returns
 */
const MappingByActivityTypeId = (activityTypeId: number) => {
    let out;

    switch (activityTypeId) {
        case 300:
            out = {
                api: 'queries',
                name: 'queryactivity',
                objectIdKey: 'queryDefinitionId',
                folder: 'Automation Studio/Query',
            };
            break;
        case 423:
            out = {
                api: 'scripts',
                name: 'ssjsactivity',
                objectIdKey: 'ssjsActivityId',
                folder: 'Automation Studio/Scripts',
            };
            break;
        case 43:
            out = {
                api: 'imports',
                name: 'importactivity',
                objectIdKey: 'importDefinitionId',
                folder: 'Automation Studio/File Imports',
            };
            break;
        case 53:
            out = {
                api: 'filetransfers',
                name: 'transferactivity',
                objectIdKey: 'id',
                folder: 'Automation Studio/File Transfers',
            };
            break;
        case 303:
            out = {
                api: 'filters',
                name: 'filteractivity',
                objectIdKey: 'filterActivityId',
                folder: 'Automation Studio/Filters',
            };
            break;

        case 73:
            out = {
                api: 'dataextracts',
                name: 'dataextractactivity',
                objectIdKey: 'dataExtractDefinitionId',
                folder: 'Automation Studio/Extracts',
            };
            break;
        case 42:
            out = {
                api: 'EmailSendDefinition',
                name: 'userinitiatedsend',
                objectIdKey: 'ObjectID',
                folder: 'Automation Studio/User-Initiated',
            };
            break;
    }

    return out;
};

export { MappingByActivityType, MappingByActivityTypeId };
