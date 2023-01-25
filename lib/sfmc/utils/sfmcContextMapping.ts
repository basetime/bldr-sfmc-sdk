import { SFMCContextMapping } from '../types/sfmc_context_mapping';

const sfmc_context_mapping: SFMCContextMapping[] = [
    {
        name: 'Data Extension',
        rootName: 'Data Extensions',
        context: 'dataExtension',
        contentType: 'dataextension',
    },
    {
        name: 'Shared Data Extension',
        rootName: 'Shared Data Extensions',
        context: 'shared_dataextension',
        contentType: 'shared_dataextension',
    },
    {
        name: 'Content Builder',
        rootName: 'Content Builder',
        context: 'contentBuilder',
        contentType: 'asset',
    },
    {
        name: 'Automation Studio',
        rootName: 'my automations',
        context: 'automationStudio',
        contentType: 'automations',
    },
    {
        name: 'Query',
        rootName: 'Query',
        context: 'automationStudio',
        contentType: 'queryactivity',
        api: 'queries',
    },
    {
        name: 'Scripts',
        rootName: 'Scripts',
        context: 'automationStudio',
        contentType: 'ssjsactivity',
        api: 'scripts',
    },
];

export { sfmc_context_mapping };
