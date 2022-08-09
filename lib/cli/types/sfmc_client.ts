export interface SFMC_Client {
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
        gatherAssetById: Function;
        getAutomationActivity: Function;
        getAutomationActivities: Function;
    };
}
