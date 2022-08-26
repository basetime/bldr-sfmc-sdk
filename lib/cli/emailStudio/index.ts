import { SFMC_Client } from '../types/sfmc_client';
import { SFMC_SOAP_Folder } from '../../sfmc/types/objects/sfmc_soap_folders';
import { buildFolderPathsSoap } from '../utils/BuildSoapFolderObjects';
import { formatContentBuilderAssets } from '../utils/_context/contentBuilder/FormatContentBuilderAsset';
import { getContentBuilderAssetContent } from '../utils/_context/contentBuilder/GetContentBuilderAssetContent'
import { contentBuilderPackageReference } from '../utils/_context/contentBuilder/PackageReference'
import { getAssetDependency, setUpdatedPackageAssetContent } from '../utils/_context/contentBuilder/GetContentBuilderAssetDependencies'

export class EmailStudio {
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
    searchDataExtensions = async (request: {
        searchKey: string;
        searchTerm: string;
    }) => {
        const response = await this.sfmc.emailStudio.searchDataExtensionByName(request);
        if (response.OverallStatus !== 'OK') {
            return response.OverallStatus;
        }

        const formattedResponse =
            (response &&
                response.Results.map(
                    (dataExtension: {
                        Name: string;
                        CreatedDate: string;
                        ModifiedDate: string;
                        CustomerKey: string;
                        CategoryID: number;
                    }) => {
                        return {
                            CustomerKey: dataExtension.CustomerKey,
                            Name: dataExtension.Name,
                            CreatedDate: dataExtension.CreatedDate,
                            ModifiedDate: dataExtension.ModifiedDate,
                            CategoryID: dataExtension.CategoryID
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
                            folder.Name !== 'Data Extensions' && folder.ID
                    )
                    .filter(Boolean);


            const assetResponse = await this.sfmc.emailStudio.getAssetsByFolderArray(
                isolateFolderIds
            );

            const formattedAssetResponse: any[] = [];

            const dataExtensions = assetResponse && assetResponse.Results;
            for (const a in dataExtensions) {
                const dataExtension: { Name: string } = dataExtensions[a]
                const dataExtensionPayload = await this.sfmc.emailStudio.retrieveDataExtensionPayloadByName(dataExtension.Name)
                formattedAssetResponse.push(dataExtensionPayload)
            }

            const formattedFolders = buildFolderPaths.folders.map((folder) => {
                return {
                    id: folder.ID,
                    name: folder.Name,
                    parentId: folder.ParentFolder.ID,
                    folderPath: folder.FolderPath
                }
            })

            console.log('formatted', formattedFolders)
            return {
                folders: formattedFolders,
                assets: formattedAssetResponse || []
            }
        } catch (err: any) {
            return err.message;
        }
    };
    /**
     *
     * @param assetId
     */
    gatherAssetById = async (customerKey: string) => {
        try {
            if (!customerKey) {
                throw new Error('customerKey is required');
            }

            // Accounts for LegacyIds and Content Builder AssetIds
            let dataExtensionPayload = await this.sfmc.emailStudio.retrieveDataExtensionPayloadByCustomerKey(customerKey)
            const categoryId = dataExtensionPayload.category.categoryId;

            const dataExtensionFolderObject = await this.sfmc.folder.getFolder({
                contentType: 'dataextension',
                categoryId
            })

            let parentFolders =
                await this.sfmc.folder.getParentFoldersRecursive({
                    contentType: 'dataextension',
                    categoryId,
                });

            const folderResponse = [...parentFolders, ...dataExtensionFolderObject.Results]
            const buildFolderPaths = await buildFolderPathsSoap(folderResponse);

            const formattedFolders = buildFolderPaths.folders.map((folder) => {
                return {
                    id: folder.ID,
                    name: folder.Name,
                    parentId: folder.ParentFolder.ID,
                    folderPath: folder.FolderPath
                }
            })

            return {
                folders: formattedFolders,
                assets: [dataExtensionPayload] || []
            }
        } catch (err: any) {
            return err.message;
        }
    };

}
