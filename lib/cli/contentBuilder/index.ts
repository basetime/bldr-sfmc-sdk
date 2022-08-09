import { SFMC_Client } from '../types/sfmc_client';
import { SFMC_SOAP_Folder } from '../../sfmc/types/objects/sfmc_soap_folders';
import { buildFolderPathsSoap } from '../utils/BuildSoapFolderObjects';
import { formatContentBuilderAssets } from '../utils/_context/contentBuilder/FormatContentBuilderAsset';
export class ContentBuilder {
    sfmc: SFMC_Client;

    constructor(sfmc: SFMC_Client) {
        this.sfmc = sfmc;
    }
    /**
     *
     * @param request.contentType
     * @param request.searchKey
     * @param request.searchTerm
     *
     * ```
     *  {
     *      contentType: '',
     *      searchKey: '',
     *      searchTerm: ''
     *  }
     * ```
     *
     * Output
     * ```
     * [{
     *      Name: string;
     *      ID: number;
     *      CreatedDate: string;
     *      ModifiedDate: string;
     *      ParentFolder: {
     *          Name: string;
     *          ID: string;
     *      }
     *  }]
     * ```
     */
    searchFolders = async (request: {
        contentType: string;
        searchKey: string;
        searchTerm: string;
    }) => {
        const response = await this.sfmc.folder.search(request);
        if (response.OverallStatus !== 'OK') {
            return response.OverallStatus;
        }

        const formattedResponse =
            (response &&
                response.Results.map(
                    (folder: {
                        Name: string;
                        CreatedDate: string;
                        ModifiedDate: string;
                        ID: number;
                        ParentFolder: {
                            Name: string;
                            ID: string;
                        };
                    }) => {
                        return {
                            ID: folder.ID,
                            Name: folder.Name,
                            CreatedDate: folder.CreatedDate,
                            ModifiedDate: folder.ModifiedDate,
                            ParentFolder: {
                                Name: folder.ParentFolder.Name,
                                ID: folder.ParentFolder.ID,
                            },
                        };
                    }
                )) ||
            [];

        return formattedResponse;
    };
    /**
     *
     * @param request.searchKey
     * @param request.searchTerm
     *
     * ```
     *  {
     *      searchKey: '',
     *      searchTerm: ''
     *  }
     * ```
     *
     * Output
     * ```
     * [{
     *      ID: number,
     *      Name: string,
     *      AssetType: string,
     *      CreatedDate: string,
     *      ModifiedDate: string,
     *      Category: {
     *          Name: string,
     *          ParentId: number
     *      }
     *  }]
     * ```
     */
    searchAssets = async (request: {
        searchKey: string;
        searchTerm: string;
    }) => {
        const response = await this.sfmc.asset.searchAssets(request);
        const formattedResponse =
            (response &&
                response.items.map(
                    (asset: {
                        id: number;
                        name: string;
                        assetType: {
                            name: string;
                        };
                        createdDate: string;
                        modifiedDate: string;
                        category: {
                            name: string;
                            parentId: string;
                        };
                    }) => {
                        return {
                            ID: asset.id,
                            Name: asset.name,
                            AssetType: asset.assetType.name,
                            CreatedDate: asset.createdDate,
                            ModifiedDate: asset.modifiedDate,
                            Category: {
                                Name: asset.category.name,
                                ParentId: asset.category.parentId,
                            },
                        };
                    }
                )) ||
            [];

        return formattedResponse;
    };
    /**
     *
     * @param request.searchKey
     * @param request.searchTerm
     *
     * ```
     *  {
     *      searchKey: '',
     *      searchTerm: ''
     *  }
     * ```
     *
     * Output
     * ```
     * [{
     *      ID: number,
     *      Name: string,
     *      AssetType: string,
     *      CreatedDate: string,
     *      ModifiedDate: string,
     *      Category: {
     *          Name: string,
     *          ParentId: number
     *      }
     *  }]
     * ```
     */
    gatherAssetsByCategoryId = async (request: {
        contentType: string;
        categoryId: number;
    }) => {
        try {
            const folderResponse = await this.sfmc.folder.getFoldersFromMiddle(
                request
            );
            const buildFolderPaths = await buildFolderPathsSoap(folderResponse);
            const isolateFolderIds =
                buildFolderPaths &&
                buildFolderPaths.folders
                    .map(
                        (folder: SFMC_SOAP_Folder) =>
                            folder.Name !== 'Content Builder' && folder.ID
                    )
                    .filter(Boolean);
            const assetResponse = await this.sfmc.asset.getAssetsByFolderArray(
                isolateFolderIds
            );

            if (
                assetResponse &&
                assetResponse.response &&
                assetResponse.response.status &&
                !assetResponse.response.status.test(/^2/)
            ) {
                throw new Error(assetResponse.response.statusText);
            }

            const formattedAssetResponse =
                assetResponse &&
                assetResponse.items &&
                buildFolderPaths &&
                (await formatContentBuilderAssets(
                    assetResponse.items,
                    buildFolderPaths.folders
                ));
            return formattedAssetResponse || [];
        } catch (err: any) {
            return err.message;
        }
    };
    /**
     *
     * @param assetId
     */
    gatherAssetById = async (assetId: number, legacy: Boolean = false) => {
        try {
            if (!assetId) {
                throw new Error('assetId is required');
            }

            // Accounts for LegacyIds and Content Builder AssetIds
            let assetResponse =
                (legacy &&
                    (await this.sfmc.asset.getAssetByLegacyId(assetId))) ||
                (await this.sfmc.asset.getByAssetId(assetId));
            assetResponse =
                (legacy &&
                    assetResponse &&
                    assetResponse.items &&
                    assetResponse.items.length &&
                    assetResponse.items[0]) ||
                assetResponse;

            if (
                assetResponse &&
                assetResponse.response &&
                assetResponse.response.status &&
                !assetResponse.response.status.test(/^2/)
            ) {
                throw new Error(assetResponse.response.statusText);
            }

            const categoryId =
                assetResponse &&
                assetResponse.category &&
                assetResponse.category.id;
            const folderResponse =
                await this.sfmc.folder.getParentFoldersRecursive({
                    contentType: 'asset',
                    categoryId,
                });

            const buildFolderPaths = await buildFolderPathsSoap(folderResponse);
            const formattedAssetResponse =
                assetResponse &&
                buildFolderPaths &&
                (await formatContentBuilderAssets(
                    assetResponse,
                    buildFolderPaths.folders
                ));
            return formattedAssetResponse || [];
        } catch (err: any) {
            return err.message;
        }
    };

    /**
     *
     * @param asset
     * @param content
     * @returns
     */
    updateContentBuilderAssetContent = (asset: any, content: string) => {
        const assetType = (asset.assetType && asset.assetType.name) || null;

        switch (assetType) {
            case 'webpage':
            case 'htmlemail':
                asset.views.html.content = content;
                break;
            case 'codesnippetblock':
            case 'htmlblock':
            case 'jscoderesource':
                asset.content = content;
                break;
            case 'textonlyemail':
                asset.views.text.content = content;
                break;
            default:
        }

        return asset;
    };
}
