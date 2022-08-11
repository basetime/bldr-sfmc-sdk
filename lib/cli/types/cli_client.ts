export interface CLI_Client {
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
}
