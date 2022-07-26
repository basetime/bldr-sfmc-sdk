// module.exports = class Asset {
//     Client;
//     authObject;

//     constructor(Client: Client, authObject: AuthObject) {
//         this.Client = Client;
//         this.authObject = authObject;
//     }

//     /**
//      * Retrieve bulk assets by array of category IDs
//      *
//      * @param {number[]} folderIdArray
//      * @returns Promise<void>
//      */
//     async getByFolderArray(folderIdArray: number[]) {
//         // TODO: add auto pagination
//         try {
//             if (!Array.isArray(folderIdArray)) {
//                 throw new Error('folderIds argument must be an array');
//             }

//             const client = await this.Client.init(this.authObject);
//             return await client.rest.post('/asset/v1/content/assets/query', {
//                 page: {
//                     page: 1,
//                     pageSize: 200,
//                 },
//                 query: {
//                     property: 'category.id',
//                     simpleOperator: 'in',
//                     value: folderIdArray,
//                 },
//                 sort: [
//                     {
//                         property: 'id',
//                         direction: 'ASC',
//                     },
//                 ],
//             });
//         } catch (err) {
//             return handleError(err);
//         }
//     }
//     /**
//      * Get Asset Object by assetID
//      *
//      * @param {number} assetId
//      * @returns
//      */
//     async getById(assetId: number) {
//         try {
//             if (!assetId) {
//                 throw new Error('assetId argument is required');
//             }

//             const client = await this.Client.init(this.authObject);
//             const assetResp = await client.rest.get(
//                 `/asset/v1/content/assets/${assetId}`
//             );

//             return new Array(assetResp);
//         } catch (err) {
//             return handleError(err);
//         }
//     }
//     /**
//      * Get Email Asset based on Legacy Asset ID
//      *
//      * @param {number} assetId
//      * @returns
//      */
//     async getByLegacyId(assetId: number) {
//         try {
//             if (!assetId) {
//                 throw new Error('assetId argument is required');
//             }

//             const client = await this.Client.init(this.authObject);
//             const assetResp = await client.rest.post(
//                 '/asset/v1/content/assets/query',
//                 {
//                     page: {
//                         page: 1,
//                         pageSize: 50,
//                     },
//                     query: {
//                         property: 'data.email.legacy.legacyId',
//                         simpleOperator: 'equal',
//                         value: assetId,
//                     },
//                 }
//             );

//             if (
//                 !Object.prototype.hasOwnProperty.call(assetResp, 'items') &&
//                 assetResp.items.length === 0
//             )
//                 throw new Error(`No Asset Found for ${assetId}`);

//             return assetResp.items;
//         } catch (err) {
//             return handleError(err)
//         }
//     }

//     async getByNameAndFolder(assetName: string, assetFolderName: string) {
//         try {
//             const client = await this.Client.init(this.authObject);
//             return await client.rest.post('/asset/v1/content/assets/query', {
//                 page: {
//                     page: 1,
//                     pageSize: 200,
//                 },
//                 query: {
//                     leftOperand: {
//                         property: 'name',
//                         simpleOperator: 'equals',
//                         value: assetName,
//                     },
//                     logicalOperator: 'AND',
//                     rightOperand: {
//                         property: 'category.name',
//                         simpleOperator: 'equals',
//                         value: assetFolderName,
//                     },
//                 },
//                 sort: [
//                     {
//                         property: 'name',
//                         direction: 'DESC',
//                     },
//                 ],
//             });
//         } catch (err) {
//             return handleError(err)
//         }
//     }

//     async search(searchKey: string, searchTerm: string) {
//         try {
//             const client = await this.Client.init(this.authObject);
//             return await client.rest.post('/asset/v1/content/assets/query', {
//                 page: {
//                     page: 1,
//                     pageSize: 200,
//                 },
//                 query: {
//                     property: searchKey,
//                     simpleOperator: 'like',
//                     value: searchTerm,
//                 },
//                 sort: [
//                     {
//                         property: 'name',
//                         direction: 'DESC',
//                     },
//                 ],
//             });
//         } catch (err) {
//             return handleError(err)
//         }
//     }

//     async postAsset(asset: {
//         id: number,
//         name: string,
//         assetType: object,
//         category: {
//             id: number,
//             name: string
//         },
//         content?: object,
//         meta?: object,
//         slots?: object,
//         views?: object
//     }) {
//         try {
//             const client = await this.Client.init(this.authObject);
//             const resp = await client.rest.post(
//                 `/asset/v1/content/assets/`,
//                 asset
//             );

//             return resp;
//         } catch (err) {
//             return handleError(err)
//         }
//     }

//     async putAsset(asset: {
//         id: number,
//         name: string,
//         assetType: object,
//         category: {
//             id: number,
//             name: string
//         },
//         content?: object,
//         meta?: object,
//         slots?: object,
//         views?: object
//     }) {
//         try {
//             if (!asset.id) {
//                 throw new Error('Asset Id is required');
//             }

//             const assetId = asset.id;
//             const client = await this.Client.init(this.authObject);
//             const resp = await client.rest.put(
//                 `/asset/v1/content/assets/${assetId}`,
//                 asset
//             );
//             return resp;
//         } catch (err) {
//             return handleError(err)
//         }
//     }

//     // async getImageFile(id) {
//     //     if (!id) throw new Error('Asset Id is required');

//     //     const resp = await this.rest.get(`/asset/v1/content/assets/${id}/file`);
//     //     return resp;
//     // }
// };
