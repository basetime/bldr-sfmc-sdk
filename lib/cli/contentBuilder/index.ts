import { SFMC_Client } from "../types/sfmc_client";
import { SFMC_SOAP_Folder } from "../../sfmc/types/objects/sfmc_soap_folders"
import { buildFolderPathsSoap } from "../utils/BuildSoapFolderObjects";
import { formatContentBuilderAssets } from "../utils/FormatContentBuilderAsset"

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
        const response = await this.sfmc.folder.search(request)
        if (response.OverallStatus !== 'OK') {
            return response.OverallStatus;
        }

        const formattedResponse = response && response.Results.map((
            folder: {
                Name: string;
                CreatedDate: string;
                ModifiedDate: string;
                ID: number;
                ParentFolder: {
                    Name: string;
                    ID: string;
                }
            }) => {
            return {
                ID: folder.ID,
                Name: folder.Name,
                CreatedDate: folder.CreatedDate,
                ModifiedDate: folder.ModifiedDate,
                ParentFolder: {
                    Name: folder.ParentFolder.Name,
                    ID: folder.ParentFolder.ID,
                }
            }
        }) || []

        return formattedResponse
    }
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
        searchTerm: string
    }) => {
        const response = await this.sfmc.asset.searchAssets(request)
        const formattedResponse = response && response.items.map((
            asset: {
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
                }
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
                }
            }
        }) || []

        return formattedResponse
    }
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
        const folderResponse = await this.sfmc.folder.getFoldersFromMiddle(request)
        const simplifiedFolderResponse = folderResponse && folderResponse.map((folder: SFMC_SOAP_Folder) => {
            return {
                ID: folder.ID,
                Name: folder.Name,
                ContentType: folder.ContentType,
                ParentFolder: {
                    Name: folder.ParentFolder.Name,
                    ID: folder.ParentFolder.ID
                }
            }
        }) || []

        const buildFolderPaths = await buildFolderPathsSoap(simplifiedFolderResponse)
        const isolateFolderIds = buildFolderPaths.folders.map((folder: SFMC_SOAP_Folder) => folder.Name !== 'Content Builder' && folder.ID).filter(Boolean)
        const assetResponse = await this.sfmc.asset.getAssetsByFolderArray(isolateFolderIds)
        const formattedAssetResponse = assetResponse && assetResponse.items && await formatContentBuilderAssets(assetResponse.items, buildFolderPaths.folders)

        return formattedAssetResponse || []

    }
}
