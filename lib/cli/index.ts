import { ContentBuilder } from './contentBuilder'
import { AutomationStudio } from './automationStudio'
/**
 * Creates an instance of BLDR SDK.
 *
 * @param {object} AuthObject Auth Object for making requests
 */
export class CLI {
    contentBuilder: any;
    automationStudio: any;

    constructor(sfmc: any) {
        this.contentBuilder = new ContentBuilder(sfmc)
        this.automationStudio = new AutomationStudio(sfmc, this.contentBuilder)
        // this.describe = new Describe(this.client.soap);
        // this.dataExtension = new DataExtension(this.client.soap);
        // this.query = new QueryDefinition(this.client.rest, this.client.soap);
    }
}
