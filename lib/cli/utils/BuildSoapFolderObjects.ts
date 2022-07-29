import { SFMC_SOAP_Folder } from '../../sfmc/types/objects/sfmc_soap_folders'

const buildFolderPathsSoap = async (folders: SFMC_SOAP_Folder[]) => {
    const parentFolders = ['Content Builder']
    const foldersOut = []; //object[]
    const compiledFolderPaths = [];
    let path = '';

    // Get parent folder and get folder ID
    let parentFolderObject = folders.find((folder) => !!parentFolders.includes(folder.Name))

    if(!parentFolderObject){
        throw new Error('Unable to find parent folder')
    }

    const rootFolder = parentFolderObject && parentFolderObject.Name;
    // Add Foot Folder to Path String
    path += parentFolderObject && parentFolderObject.Name;
    // Add FolderPath to folder object
    parentFolderObject.FolderPath = path;
    // Add Folder Object to Output Array
    foldersOut.push(parentFolderObject)
    // Add Folder Path CompiledFolderPaths Array
    compiledFolderPaths.push(path)
    // Remove processed Object from Original Array
    folders.splice(folders.findIndex((folder) => !!parentFolders.includes(rootFolder)), 1)
    // Reset Path String
    path = '';

    do {
        for (const f in folders) {
            const folder = folders[f]
            const parentFolder = folder.ParentFolder.Name;
            let parentIsRootFolder = parentFolder === rootFolder ? true : false;

            if (parentIsRootFolder) {
                // Add Foot Folder to Path String
                path += folder && folder.Name && `${rootFolder}/${folder.Name}`;
                // Add FolderPath to folder object
                folder.FolderPath = path;
                // Add Folder Object to Output Array
                foldersOut.push(folder)
                // Add Folder Path CompiledFolderPaths Array
                compiledFolderPaths.push(path)
                // Remove processed Object from Original Array
                folders.splice(folders.findIndex((orgFolder) => orgFolder.ID === folder.ID), 1)
                // Reset Path String
                path = '';
            } else {
                let parentId = folder.ParentFolder.ID
                let compiledParentFolder = foldersOut.find((compiledFolder) => compiledFolder.ID === parentId)

                if (compiledParentFolder) {
                    // Add Foot Folder to Path String
                    path += folder && folder.Name && `${compiledParentFolder.FolderPath}/${folder.Name}`;
                    // Add FolderPath to folder object
                    folder.FolderPath = path;
                    // Add Folder Object to Output Array
                    foldersOut.push(folder)
                    // Add Folder Path CompiledFolderPaths Array
                    compiledFolderPaths.push(path)
                    // Remove processed Object from Original Array
                    folders.splice(folders.findIndex((orgFolder) => orgFolder.ID === folder.ID), 1)
                    // Reset Path String
                    path = '';
                }
            }
        }
    } while (folders.length)

    return {
        folders: foldersOut,
        folderPaths: compiledFolderPaths
    }
}

export {
    buildFolderPathsSoap
}
