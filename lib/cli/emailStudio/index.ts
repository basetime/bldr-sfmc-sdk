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
                        ID: number;
                        ParentFolder: {
                            Name: string;
                            ID: string;
                        };
                    }) => {
                        return {
                            ID: dataExtension.ID,
                            CustomerKey: dataExtension.CustomerKey,
                            Name: dataExtension.Name,
                            CreatedDate: dataExtension.CreatedDate,
                            ModifiedDate: dataExtension.ModifiedDate,
                            ParentFolder: {
                                Name: dataExtension.ParentFolder.Name,
                                ID: dataExtension.ParentFolder.ID,
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


    async setContentBuilderPackageAssets(
        packageOut: any,
        contextAssets: any[]
    ) {
        packageOut['contentBuilder'] = {};
        return packageOut['contentBuilder']['assets'] = contextAssets.map(
            (asset: any) => {
                return {
                    id: asset.id,
                    bldrId: asset.bldrId,
                    name: asset.name,
                    assetType: asset.assetType,
                    category: {
                        folderPath:
                            (asset.category &&
                                asset.category
                                    .folderPath) ||
                            asset.folderPath,
                    },
                    content: getContentBuilderAssetContent(asset),
                };
            }
        );
    }

    /**
     *
     * @param packageOut
     */
    setContentBuilderDependenciesFromPackage = async (packageOut: any) => {
        try {
            const newDependencies: { [key: string]: any } = {}

            for (const a in packageOut['contentBuilder']['assets']) {
                let asset = packageOut['contentBuilder']['assets'][a];
                let content = await getContentBuilderAssetContent(asset);
                asset.dependencies = [];

                for (const p in contentBuilderPackageReference) {
                    const reference = contentBuilderPackageReference[p];
                    const regex = `(${reference}\\(['"](?<value>.+)['"])`;
                    const ampscriptRegex = new RegExp(regex, 'g');
                    const matches = content && content.matchAll(ampscriptRegex);

                    for (const match of matches) {
                        const groups = Object.assign(match.groups, {});
                        let matchedValue = groups.value;
                        matchedValue = matchedValue.replace(/['"]/gm, '');

                        let dependency = await getAssetDependency(
                            this.sfmc,
                            reference,
                            matchedValue,
                            asset,
                            packageOut
                        );

                        matchedValue = dependency.matchedValue || matchedValue
                        let dependencyReference = {
                            bldrId: dependency.bldrId,
                            context: dependency.context,
                            reference
                        }

                        if (dependency && dependency.exists) {
                            asset.content = await setUpdatedPackageAssetContent(dependencyReference, matchedValue, asset.content);
                            asset.dependencies.push(dependencyReference)


                            // remove matched value from dependency object
                            delete dependency.matchedValue;
                        } else {
                            let dependencyContext = dependency.context;

                            asset.dependencies.push({
                                bldrId: dependency.bldrId,
                                context: dependency.context,
                                reference
                            })

                            asset.content = await setUpdatedPackageAssetContent(dependencyReference, matchedValue, asset.content);
                            newDependencies[dependencyContext] = newDependencies[dependencyContext] || {
                                assets: []
                            }
                            packageOut[dependencyContext] = packageOut[dependencyContext] || {
                                assets: []
                            }

                            newDependencies[dependencyContext]['assets'].push(dependency.payload);
                            packageOut[dependencyContext]['assets'].push(dependency.payload);
                        }

                    }

                    //     if (dependency) {
                    //         let dependencyContext = dependency.context;
                    //         dependencies[dependencyContext] =
                    //             dependencies[dependencyContext] || Array();

                    //         content = content.replace(
                    //             dependency.matchedValue,
                    //             dependency.payload.bldrId
                    //         );

                    //         dependencies[dependencyContext].push(dependency);

                    //         asset.dependencies = asset.dependencies || new Array();

                    //         asset.dependencies.push({
                    //             context: dependencyContext,
                    //             reference,
                    //             bldrId: dependency.payload.bldrId,
                    //         });

                    //         // remove matched value from dependency object
                    //         delete dependency.matchedValue;

                    //     } else {
                    //         let refBldrId;
                    //         let assetRefObject;
                    //         let dependencyContext;

                    //         switch (reference) {
                    //             case 'Lookup':
                    //             case 'LookupOrderedRows':
                    //             case 'LookupOrderedRowsCS':
                    //             case 'LookupRows':
                    //             case 'LookupRowsCS':
                    //             case 'DataExtensionRowCount':
                    //             case 'DeleteData':
                    //             case 'DeleteDE':
                    //             case 'InsertDE':
                    //             case 'UpdateData':
                    //             case 'UpdateDE':
                    //             case 'UpsertData':
                    //             case 'UpsertDE':
                    //             case 'ClaimRow':

                    //                 refBldrId = '';
                    //                 dependencyContext = 'emailStudio';

                    //                 break;
                    //             case 'ContentBlockById':
                    //             case 'ContentBlockByID':
                    //                 assetRefObject = packageOut['contentBuilder']['assets'].find((packageAsset: any) =>
                    //                     Number(packageAsset.id) === Number(matchedValue)
                    //                 );

                    //                 refBldrId = assetRefObject?.bldrId;
                    //                 dependencyContext = 'contentBuilder';

                    //                 break;
                    //             case 'ContentBlockByName':
                    //                 assetRefObject = packageOut['contentBuilder']['assets'].find((packageAsset: any) => {
                    //                     return (
                    //                         `${packageAsset.category.folderPath.replaceAll(
                    //                             '/',
                    //                             '\\'
                    //                         )}\\${packageAsset.name}` ===
                    //                         matchedValue
                    //                     );
                    //                 });

                    //                 if (!assetRefObject) {
                    //                     assetRefObject = packageOut['contentBuilder']['assets'].find(
                    //                         (packageAsset: any) => {
                    //                             return (
                    //                                 `${packageAsset.category.folderPath.replaceAll(
                    //                                     '/',
                    //                                     '\\\\'
                    //                                 )}\\\\${packageAsset.name}` ===
                    //                                 matchedValue
                    //                             );
                    //                         }
                    //                     );
                    //                 }

                    //                 refBldrId = assetRefObject.bldrId;
                    //                 dependencyContext = 'contentBuilder';
                    //                 break;
                    //         }

                    //         content = content.replace(matchedValue, refBldrId);

                    //         asset.dependencies =
                    //             asset.dependencies || new Array();

                    //         asset.dependencies.push({
                    //             context: dependencyContext,
                    //             reference,
                    //             bldrId: refBldrId,
                    //         });
                    //     }
                    // }
                }

                // delete asset.id;
                // delete asset.customerKey;
                // delete asset.category.id;
                // delete asset.category.name;
                // delete asset.category.parentId;

                // asset = await this.updateContentBuilderAssetContent(asset, content);

                //         if (dependency) {
                //             let dependencyContext = dependency.context;
                //             dependencies[dependencyContext] =
                //                 dependencies[dependencyContext] || Array();

                //             content = content.replace(
                //                 dependency.matchedValue,
                //                 dependency.payload.bldrId
                //             );

                //             // remove matched value from dependency object
                //             delete dependency.matchedValue;

                //             dependencies[dependencyContext].push(dependency);

                //             asset.dependencies =
                //                 asset.dependencies || new Array();
                //             asset.dependencies.push({
                //                 context: dependencyContext,
                //                 ref: ref,
                //                 bldrId: dependency.payload.bldrId,
                //             });
                //         } else {
                //         let refBldrId;
                //         let assetRefObject;
                //         let dependencyContext;

                //         switch (reference) {
                //             case 'Lookup':
                //             case 'LookupOrderedRows':
                //             case 'LookupOrderedRowsCS':
                //             case 'LookupRows':
                //             case 'LookupRowsCS':
                //             case 'DataExtensionRowCount':
                //             case 'DeleteData':
                //             case 'DeleteDE':
                //             case 'InsertDE':
                //             case 'UpdateData':
                //             case 'UpdateDE':
                //             case 'UpsertData':
                //             case 'UpsertDE':
                //             case 'ClaimRow':

                //                 refBldrId = '';
                //                 dependencyContext = 'dataExtension';

                //                 break;
                //             case 'ContentBlockById':
                //             case 'ContentBlockByID':
                //                 assetRefObject = packageOut['contentBuilder']['assets'].find((packageAsset: any) =>
                //                     packageAsset.id === Number(matchedValue)
                //                 );

                //                 refBldrId = assetRefObject?.bldrId;
                //                 dependencyContext = 'contentBuilder';

                //                 break;
                //             case 'ContentBlockByName':
                //                 assetRefObject = assets.find((depAsset) => {
                //                     return (
                //                         `${depAsset.category.folderPath.replaceAll(
                //                             '/',
                //                             '\\'
                //                         )}\\${depAsset.name}` ===
                //                         matchedValue
                //                     );
                //                 });

                //                 if (!assetRefObject) {
                //                     assetRefObject = assets.find(
                //                         (depAsset) => {
                //                             return (
                //                                 `${depAsset.category.folderPath.replaceAll(
                //                                     '/',
                //                                     '\\\\'
                //                                 )}\\\\${depAsset.name}` ===
                //                                 matchedValue
                //                             );
                //                         }
                //                     );
                //                 }

                //                 refBldrId = assetRefObject.bldrId;
                //                 dependencyContext = 'contentBuilder';
                //                 break;
                //         }

                //         content = content.replace(matchedValue, refBldrId);

                //         asset.dependencies =
                //             asset.dependencies || new Array();
                //         asset.dependencies.push({
                //             context: dependencyContext,
                //             ref: ref,
                //             bldrId: refBldrId,
                //         });
                //     }
                //     }
                // }

                // delete asset.id;
                // delete asset.customerKey;
                // delete asset.category.id;
                // delete asset.category.name;
                // delete asset.category.parentId;

                // asset = await utils.updateAssetContent(asset, content);
            }
            return {
                newDependencies,
                packageOut
            }
        } catch (err) {
            console.log(err)
        }

    }
}
