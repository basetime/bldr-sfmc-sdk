export interface CLI_Client {
    contentBuilder: {
        searchFolders: Function;
        searchAssets: Function;
        gatherAssetsByCategoryId: Function;
        gatherAssetById: Function;
        updateContentBuilderAssetContent: Function;
    };
    automationStudio: {
        contentBuilder: {
            searchFolders: Function;
            searchAssets: Function;
            gatherAssetsByCategoryId: Function;
            gatherAssetById: Function;
            updateContentBuilderAssetContent: Function;
        };
        searchFolders: Function;
        searchAssets: Function;
        // gatherAssetsByCategoryId: Function;
        gatherAssetById: Function;
        // updateContentBuilderAssetContent: Function;
    };
}
