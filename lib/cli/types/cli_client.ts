export interface CLI_Client {
    contentBuilder: {
        searchFolders: Function;
        searchAssets: Function;
        gatherAssetsByCategoryId: Function;
        gatherAssetById: Function;
        updateContentBuilderAssetContent: Function;
        setContentBuilderPackageAssets: Function;
        setContentBuilderDependenciesFromPackage: Function;
    };
    automationStudio: {
        searchFolders: Function;
        searchAssets: Function;
        gatherAssetsByCategoryId: Function;
        gatherAssetById: Function;
    };
    emailStudio: {
        searchFolders: Function;
        searchDataExtensions: Function;
        gatherAssetsByCategoryId: Function;
        gatherAssetById: Function;
    };
}
