import { Client } from '../../types/sfmc_client';

const { getProperties } = require('sfmc-soap-object-reference');
const DataFolder = getProperties('DataFolder');

export class Folder {
    client;
    constructor(client: Client) {
        this.client = client;
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
    }): Promise<void> {
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
    }): Promise<void> {
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

            if (resp.OverallStatus !== 'OK')
                throw new Error('Unable to Retrieve Folders');

            return resp;
        } catch (err: any) {
            return err;
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
    }): Promise<void> {
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
                            leftOperand: 'ParentFolder.ID',
                            operator: 'equals',
                            rightOperand: request.parentId,
                        },
                    },
                }
            );

            if (resp.OverallStatus !== 'OK')
                throw new Error('Unable to Retrieve Folders');

            return resp;
        } catch (err: any) {
            return err;
        }
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

            return err;
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
            return err;
        }
    }
}
