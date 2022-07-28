import { SFMC_Client } from "../../types/sfmc_client";


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
        const searchRequest = await this.sfmc.folder.search(request)
        if (searchRequest.OverallStatus !== 'OK') {
            return searchRequest.OverallStatus;
        }

        const formattedSearchRequest = searchRequest.Results.map((
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
        })

        return formattedSearchRequest
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
        const searchRequest = await this.sfmc.asset.searchAssets(request)

        const formattedSearchRequest = searchRequest.items.map((
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
        })

        return formattedSearchRequest
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
        const getAllFolderIds = await this.sfmc.folder.getSubfoldersRecursive(request)
        console.log('fn', getAllFolderIds)
        // const searchRequest = await this.sfmc.asset.searchAssets(request)

        // const formattedSearchRequest = searchRequest.items.map((
        //     asset: {
        //         id: number;
        //         name: string;
        //         assetType: {
        //             name: string;
        //         };
        //         createdDate: string;
        //         modifiedDate: string;
        //         category: {
        //             name: string;
        //             parentId: string;
        //         }
        //     }) => {
        //     return {
        //         ID: asset.id,
        //         Name: asset.name,
        //         AssetType: asset.assetType.name,
        //         CreatedDate: asset.createdDate,
        //         ModifiedDate: asset.modifiedDate,
        //         Category: {
        //             Name: asset.category.name,
        //             ParentId: asset.category.parentId,
        //         }
        //     }
        // })

        return getAllFolderIds
    }
}
