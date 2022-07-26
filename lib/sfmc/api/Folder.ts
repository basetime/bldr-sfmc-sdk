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
        searchKey: string;
        searchTerm: string;
    }): Promise<{
        OverallStatus: string;
        Results: any[];
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
                            leftOperand: request.searchKey,
                            operator: 'like',
                            rightOperand: request.searchTerm,
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
        Results: any[];
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
    }): Promise<any> {
        try {
            const results: object[] = [];
            const response = await this.client.soap.retrieve(
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
                            leftOperand: 'ParentFolder.ID',
                            operator: 'equals',
                            rightOperand: request.parentId,
                        },
                    },
                }
            );

            if (response.OverallStatus !== 'OK') {
                throw new Error('Unable to Retrieve Folders');
            }

            results.push(...response.Results);
            return results;
        } catch (err: any) {
            return handleError(err);
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
    }): Promise<Object[]> {
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
                searchTerm: rootFolderContext.name,
            });

            if (
                rootFolderRequest &&
                rootFolderRequest.Results &&
                rootFolderRequest.Results.length
            ) {
                results = [...rootFolderRequest.Results];
                stopFolderId = rootFolderRequest.Results[0].ID;
            }
        }

        const initialCategory = await this.getFolder(request);

        if (initialCategory.OverallStatus !== 'OK') {
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

        do {
            const parentRequest = await this.getFolder({
                contentType: request.contentType,
                categoryId: parentId,
            });

            if (parentRequest.OverallStatus !== 'OK') {
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
                results = [...results, ...parentRequest.Results];
                parentId =
                    (parentResult &&
                        parentResult.ParentFolder &&
                        parentResult.ParentFolder.ID) ||
                    null;
            }
        } while (!stopFolderId || parentId === stopFolderId);

        return results;
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
            let results: object[] = [];

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
                console.log('in do');

                let categoryId = folders[0];
                // SFMC Folder response checking for subfolders
                let subfolderRequest = await this.getSubfolders({
                    contentType: request.contentType,
                    parentId: categoryId,
                });

                if (subfolderRequest && subfolderRequest.length) {
                    let subfolderIdArray = subfolderRequest.map(
                        (folder: { ID: number }) => folder.ID
                    );
                    folders.push(...subfolderIdArray);
                    results = [...results, ...subfolderRequest];
                }

                folders.shift();
            } while (folders.length !== 0);

            return results;
        } catch (err) {
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
        let results: any[] = [];
        let up = await this.getParentFoldersRecursive(request);
        let down = await this.getSubfoldersRecursive(request);

        return [
            ...new Map(
                [...up, ...down].map((item) => [item['Name'], item])
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
