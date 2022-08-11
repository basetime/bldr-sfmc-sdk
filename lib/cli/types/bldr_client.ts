import { SFMC_Client } from './sfmc_client';
import { CLI_Client } from './cli_client';

export interface BLDR_Client {
    sfmc: {
        client: any;
        account: {
            getInstanceDetails: Function;
            getBusinessUnitDetails: Function;
            getAllBusinessUnitDetails: Function;
        };
        folder: {
            search: Function;
            getFolder: Function;
            getSubfolders: Function;
            getParentFoldersRecursive: Function;
            getSubfoldersRecursive: Function;
            getFoldersFromMiddle: Function;
            createFolder: Function;
            _updateAllowChildren: Function;
        };
        asset: {
            getByAssetId: Function;
            getAssetByLegacyId: Function;
            getAssetsByFolderArray: Function;
            getAssetByNameAndFolder: Function;
            searchAssets: Function;
            postAsset: Function;
            putAsset: Function;
            getImageData: Function;
        };
        automation: {
            searchAutomations: Function;
            getAutomationByKey: Function;
            getAutomationsByKey: Function;
            getAssetsByFolderArray: Function;
            getAutomationActivity: Function;
            getAutomationActivities: Function;
            patchAutomationAsset: Function;
        };
    };
    cli: {
        contentBuilder: {
            searchFolders: Function;
            searchAssets: Function;
            gatherAssetsByCategoryId: Function;
            gatherAssetById: Function;
            updateContentBuilderAssetContent: Function;
        };
        automationStudio: {
            searchFolders: Function;
            searchAssets: Function;
            gatherAssetsByCategoryId: Function;
            gatherAssetById: Function;
        };
    };
}
