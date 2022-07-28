import { ContentBuilder } from './search/contentBuilder/ContentBuilder'
/**
 * Creates an instance of BLDR SDK.
 *
 * @param {object} AuthObject Auth Object for making requests
 */
export class CLI {
    contentBuilder: object

    constructor(sfmc: any) {
        this.contentBuilder = new ContentBuilder(sfmc)
        // this.describe = new Describe(this.client.soap);
        // this.dataExtension = new DataExtension(this.client.soap);
        // this.query = new QueryDefinition(this.client.rest, this.client.soap);
    }
}
