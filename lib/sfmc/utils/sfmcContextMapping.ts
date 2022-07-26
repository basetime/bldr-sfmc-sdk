import { SFMCContextMapping } from '../types/sfmc_context_mapping';

const sfmc_context_mapping: SFMCContextMapping[] = [
    {
        name: 'Data Extensions',
        context: 'dataExtension',
        contentType: 'dataextension',
    },
    {
        name: 'Content Builder',
        context: 'contentBuilder',
        contentType: 'asset',
    },
    {
        name: 'Automation Studio',
        context: 'automationStudio',
        contentType: 'automations',
    },
];

export { sfmc_context_mapping };
