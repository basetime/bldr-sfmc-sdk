import { SFMC_Client } from "../types/sfmc_client";
import { SFMC_SOAP_Folder } from "../../sfmc/types/objects/sfmc_soap_folders"
import { buildFolderPathsSoap } from "../utils/BuildSoapFolderObjects";
import { formatAutomation } from "../utils/_context/automationStudio/FormatAutomationAsset";
import { SFMC_Automation } from "../types/bldr_assets/sfmc_automation";
import { MappingByActivityTypeId } from "../../sfmc/utils/automationActivities";
import { guid } from "../utils";

export class AutomationStudio {
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

        const response = await this.sfmc.automation.searchAutomations(request)
        const formattedResponse = response && response.Results && response.Results.map((
            asset: {
                Name: string;
                Description: string;
                ObjectID: string;
                Status: number;
                CreatedDate: string;
                ModifiedDate: string;
                IsActive: Boolean;
            }) => {
            return {
                ObjectId: asset.ObjectID,
                Name: asset.Name,
                Description: asset.Description,
                Status: asset.Status,
                CreatedDate: asset.CreatedDate,
                ModifiedDate: asset.ModifiedDate,
                IsActive: asset.IsActive
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
        try {
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
            const isolateFolderIds = buildFolderPaths && buildFolderPaths.folders.map((folder: SFMC_SOAP_Folder) => folder.Name !== 'Content Builder' && folder.ID).filter(Boolean)
            const assetResponse = await this.sfmc.asset.getAssetsByFolderArray(isolateFolderIds)

            if (
                assetResponse &&
                assetResponse.response &&
                assetResponse.response.status &&
                !assetResponse.response.status.test(/^2/)
            ) {
                throw new Error(assetResponse.response.statusText)
            }

            const formattedAssetResponse = assetResponse && assetResponse.items && buildFolderPaths && await formatAutomation(assetResponse.items, buildFolderPaths.folders)
            return formattedAssetResponse || []

        } catch (err: any) {
            return err.message
        }

    }
    /**
     *
     * @param objectId
     */
    gatherAssetById = async (objectId: string) => {
        try {
            if (!objectId) {
                throw new Error('objectId is required')
            }

            const assetResponse = await this.sfmc.automation.getAutomationByKey(objectId)

            if (
                assetResponse &&
                assetResponse.response &&
                assetResponse.response.status &&
                !assetResponse.response.status.test(/^2/)
            ) {
                throw new Error(assetResponse.response.statusText)
            }

            const categoryId = assetResponse && assetResponse.categoryId
            const folderResponse = await this.sfmc.folder.getParentFoldersRecursive({
                contentType: 'automations',
                categoryId
            })

            const simplifiedFolderResponse = folderResponse && folderResponse.map((folder: SFMC_SOAP_Folder) => {
                return {
                    ID: folder.ID,
                    Name: folder.Name,
                    ContentType: folder.ContentType,
                    ParentFolder: {
                        Name: folder.ParentFolder.Name || 'my automations',
                        ID: folder.ParentFolder.ID
                    }
                }
            }) || []

            const buildFolderPaths = await buildFolderPathsSoap(simplifiedFolderResponse)
            const formattedAssetResponse = assetResponse && buildFolderPaths && await formatAutomation(assetResponse, buildFolderPaths.folders)
            const formattedAutomationDefinitions: any = await this.gatherAutomationActivityDefinitions(formattedAssetResponse)

            return {
                formattedAssetResponse,
                formattedAutomationDefinitions
            }

        } catch (err: any) {
            return err.message
        }
    }

    /**
     *
     * @param automations
     */
    gatherAutomationActivityDefinitions = async (automations: SFMC_Automation[] | SFMC_Automation) => {
        try {
            const automationDefinitionOutput: any[] = [];
            if (Array.isArray(automations)) {
                for (const a in automations) {
                    const automation = automations[a]
                    const automationActivityDefinitions: any[] = await this.sfmc.automation.getAutomationActivities(automation)

                    automationActivityDefinitions && automationActivityDefinitions.forEach(definition => {
                        definition.bldrId = guid();
                        automationDefinitionOutput.push(definition)
                    })
                }
            } else {
                const automationActivityDefinitions: any[] = await this.sfmc.automation.getAutomationActivities(automations)
                automationActivityDefinitions && automationActivityDefinitions.forEach(definition => {
                    definition.bldrId = guid();
                    automationDefinitionOutput.push(definition)
                })
            }

            return automationDefinitionOutput

        } catch (err) {
            console.error(err);
        }
    }
}
