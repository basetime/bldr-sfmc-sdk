const getContentBuilderAssetContent = (asset: {
    content?: string;
    views?: any;
    assetType: {
        name: string;
    }
}) => {

    const assetType = asset.assetType.name;
    let content;

    switch (assetType) {
        case 'webpage':
        case 'htmlemail':
            content = asset.views?.html?.content || asset.content
            break;
        case 'textonlyemail':
            content = asset.views?.text?.content || asset.content
            break;
        case 'codesnippetblock':
        case 'htmlblock':
        case 'jscoderesource':
            content = asset.content
            break;
        default:
            content = JSON.stringify(asset, null, 2);
    }


    return content
}

export {
    getContentBuilderAssetContent
}