import { SFMC_SOAP_Folder } from '../types/objects/sfmc_soap_folders';
import { Client } from '../types/sfmc_client';
import { SFMCContextMapping } from '../types/sfmc_context_mapping';
import { handleError } from '../utils/handleError';

const { getProperties } = require('sfmc-soap-object-reference');
const DataFolder = getProperties('DataFolder');

export class Folder {
    client;
    sfmc_context;
    constructor(client: Client, sfmc_context_mapping: SFMCContextMapping[]) {
        this.client = client;
        this.sfmc_context = sfmc_context_mapping;
    }

    /**
     * Search SFMC Folders using SOAP DataFolder Object
     *
     * @param {string} request.contentType
     * @param {string} request.searchKey
     * @param {string} request.searchTerm
     * @returns
     */
    async search(request: {
        contentType: string;
        searchKey?: string;
        searchTerm?: string;
        parentId?: number;
    }): Promise<{
        OverallStatus: string;
        Results: any[];
    }> {
        try {
            let filter;
            if (request.parentId) {
                filter = {
                    leftOperand: {
                        leftOperand: 'ContentType',
                        operator: 'equals',
                        rightOperand: request.contentType,
                    },
                    operator: 'AND',
                    rightOperand: {
                        leftOperand: 'ParentFolder.ID',
                        operator: 'equals',
                        rightOperand: request.parentId,
                    },
                };

                // filter = {
                //     leftOperand: {
                //         leftOperand: 'ContentType',
                //         operator: 'equals',
                //         rightOperand: request.contentType,
                //     },
                //     operator: 'AND',
                //     rightOperand: complexFilterPart
                // }
            } else {
                filter = {
                    leftOperand: {
                        leftOperand: 'ContentType',
                        operator: 'equals',
                        rightOperand: request.contentType,
                    },
                    operator: 'AND',
                    rightOperand: {
                        leftOperand: request.searchKey,
                        operator: 'like',
                        rightOperand: request.searchTerm,
                    },
                };
            }

            const resp = await this.client.soap.retrieveBulk(
                'DataFolder',
                DataFolder,
                {
                    filter,
                }
            );

            if (resp.OverallStatus !== 'OK') {
                return resp.OverallStatus;
            }

            return resp;
        } catch (err: any) {
            return err;
        }
    }
    /**
     * Get a single SFMC Folder Object via SOAP API
     * If subfolders === false id refers to the folder you are retrieving
     * If subfolders === true id refers to the parent folder
     *
     * @param {string} request.contentType
     * @param {number} request.categoryId
     * @returns
     */
    async getFolder(request: {
        contentType: string;
        categoryId: number;
    }): Promise<{
        OverallStatus: string;
        Results: SFMC_SOAP_Folder[];
    }> {
        try {
            const resp = await this.client.soap.retrieve(
                'DataFolder',
                DataFolder,
                {
                    filter: {
                        leftOperand: {
                            leftOperand: 'ContentType',
                            operator: 'equals',
                            rightOperand: request.contentType,
                        },
                        operator: 'AND',
                        rightOperand: {
                            leftOperand: 'ID',
                            operator: 'equals',
                            rightOperand: request.categoryId,
                        },
                    },
                }
            );

            if (resp.OverallStatus !== 'OK') {
                throw new Error('Unable to Retrieve Folders');
            }

            return resp;
        } catch (err: any) {
            return handleError(err);
        }
    }
    /**
     * Get SFMC Subfolders based on parentId Object via SOAP API
     *
     * @param {string} request.contentType
     * @param {number} request.parentId
     * @returns
     */
    async getSubfolders(request: {
        contentType: string;
        parentId: number;
    }): Promise<SFMC_SOAP_Folder[]> {
        try {
            type folders = SFMC_SOAP_Folder;
            const results: folders[] = [];

            const response: {
                OverallStatus: string;
                Results: SFMC_SOAP_Folder[];
            } = await this.client.soap.retrieveBulk('DataFolder', DataFolder, {
                filter: {
                    leftOperand: {
                        leftOperand: 'ContentType',
                        operator: 'equals',
                        rightOperand: request.contentType,
                    },
                    operator: 'AND',
                    rightOperand: {
                        leftOperand: 'ParentFolder.ID',
                        operator: 'equals',
                        rightOperand: request.parentId,
                    },
                },
            });

            if (response && response.OverallStatus !== 'OK') {
                throw new Error('Unable to Retrieve Folders');
            }

            const responseResults = response.Results;
            results.push(...responseResults);
            return results;
        } catch (err: any) {
            return err;
        }
    }
    /**
     * Method to compile folder path for for Asset Clone
     *
     * @param {string} request.contentType
     * @param {number} request.categoryId
     * @returns {Promise<Object[]>}
     */
    async getParentFoldersRecursive(request: {
        contentType: string;
        categoryId: number;
    }): Promise<{ results: any[]; stop: Boolean }> {
        let parentId;
        let stopFolderId;
        let results: object[] = [];

        const rootFolderContext = this.sfmc_context.find(
            (ctx) => ctx.contentType === request.contentType
        );

        if (rootFolderContext) {
            const rootFolderRequest = await this.search({
                contentType: request.contentType,
                searchKey: 'Name',
                searchTerm: rootFolderContext.rootName,
            });

            if (
                rootFolderRequest &&
                rootFolderRequest.Results &&
                rootFolderRequest.Results.length
            ) {
                results = [...rootFolderRequest.Results];
                stopFolderId = rootFolderRequest.Results[0].ParentFolder.ID;

                if (rootFolderRequest.Results[0].ID === request.categoryId) {
                    return {
                        results,
                        stop: true,
                    };
                }
            }
        }

        const initialCategory = await this.getFolder(request);

        if (initialCategory.OverallStatus !== 'OK') {
            console.log(initialCategory);
        }

        if (
            initialCategory &&
            initialCategory.Results &&
            initialCategory.Results.length
        ) {
            const initResult = initialCategory.Results[0];
            results = [...results, ...initialCategory.Results];
            parentId =
                (initResult &&
                    initResult.ParentFolder &&
                    initResult.ParentFolder.ID) ||
                null;
        }

        if (parentId) {
            do {
                const parentRequest =
                    parentId &&
                    (await this.getFolder({
                        contentType: request.contentType,
                        categoryId: parentId,
                    }));

                if (parentRequest && parentRequest.OverallStatus !== 'OK') {
                    console.log(parentRequest);
                }

                if (
                    parentRequest &&
                    parentRequest.Results &&
                    parentRequest.Results.length
                ) {
                    const parentResult: {
                        ParentFolder: {
                            ID: number;
                        };
                    } = parentRequest.Results[0];

                    results.push(...parentRequest.Results);
                    parentId =
                        parentResult &&
                        parentResult.ParentFolder &&
                        parentResult.ParentFolder.ID;
                }
            } while (parentId !== 0);
        }
        return {
            results,
            stop: false,
        };
    }
    /**
     * Method to gather and format all SFMC Folders recursively from top level starting point
     *
     * @param {string} request.contentType
     * @param {integer} request.categoryId
     * @returns
     */
    async getSubfoldersRecursive(request: {
        contentType: string;
        categoryId: number;
    }) {
        try {
            let folders: number[] = [];
            let results: any[] = [];

            // Get target folder from SFMC
            let rootRequest = await this.getFolder(request);

            // Ensure response has results
            if (!Object.prototype.hasOwnProperty.call(rootRequest, 'Results')) {
                throw new Error(`Unable to find folder`);
            }

            if (
                rootRequest &&
                rootRequest.Results &&
                rootRequest.Results.length
            ) {
                const rootIdArray = rootRequest.Results.map(
                    (folder) => folder.ID
                );
                folders.push(...rootIdArray);
                results = [...results, ...rootRequest.Results];
            }

            // Recursively get folders from SFMC
            do {
                let categoryId = folders[0];
                // SFMC Folder response checking for subfolders
                let subfolderRequest = await this.getSubfolders({
                    contentType: request.contentType,
                    parentId: categoryId,
                });

                if (
                    subfolderRequest &&
                    Array.isArray(subfolderRequest) &&
                    subfolderRequest.length > 0
                ) {
                    let subfolderIdArray = subfolderRequest.map(
                        (folder: { ID: number }) => folder.ID
                    );
                    folders.push(...subfolderIdArray);
                    results = [...results, ...subfolderRequest];
                }

                folders.shift();
            } while (folders.length !== 0);

            return results || [];
        } catch (err) {
            console.log(err);
            return handleError(err);
        }
    }
    /**
     * Retrieve all folders top and bottom from a specific categoryId
     *
     * @param {string} request.contentType
     * @param {integer} request.categoryId
     * @returns
     */
    async getFoldersFromMiddle(request: {
        contentType: string;
        categoryId: number;
    }) {
        let up = (await this.getParentFoldersRecursive(request)) || [];
        let down =
            (!up.stop && (await this.getSubfoldersRecursive(request))) || [];

        return [
            ...new Map(
                [...up.results, ...down].map((item) => [item['Name'], item])
            ).values(),
        ];
    }
    /**
     * Create a folder in SFMC via SOAP Data Folder Object
     *
     * @param request.contentType
     * @param request.name
     * @param request.parentId
     * @returns {Promise<void>}
     */
    async createFolder(request: {
        contentType: string;
        name: string;
        parentId: number;
    }): Promise<void> {
        try {
            const resp = await this.client.soap.create(
                'DataFolder',
                {
                    ContentType: request.contentType,
                    Name: request.name,
                    Description: request.name,
                    IsActive: true,
                    IsEditable: true,
                    AllowChildren: true,
                    ParentFolder: {
                        ID: request.parentId,
                    },
                },
                {}
            );

            return resp;
        } catch (err: any) {
            if (err.response.data.includes('cannot contain child folders')) {
                await this._updateAllowChildren({
                    contentType: request.contentType,
                    categoryId: request.parentId,
                });
                const errCreate = await this.createFolder(request);
                return errCreate;
            }

            return handleError(err);
        }
    }
    /**
     * When a folder exists in SFMC and is created in the UI, it by default does not allow children folders. This function updates that permission on the folder.
     *
     * @param request.contentType
     * @param request.categoryId
     * @returns
     */
    async _updateAllowChildren(request: {
        contentType: string;
        categoryId: number;
    }) {
        try {
            const resp = await this.client.soap.update(
                'DataFolder',
                {
                    ID: request.categoryId,
                    ContentType: request.contentType,
                    IsActive: true,
                    IsEditable: true,
                    AllowChildren: true,
                },
                {}
            );

            return resp;
        } catch (err) {
            return handleError(err);
        }
    }
}
