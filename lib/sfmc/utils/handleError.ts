const handleError = (err: any) => {
    if (
        Object.prototype.hasOwnProperty.call(err, 'JSON') &&
        Object.prototype.hasOwnProperty.call(err.JSON, 'Results') &&
        err.JSON.Results.length > 0 &&
        Object.prototype.hasOwnProperty.call(
            err.JSON.Results[0],
            'StatusMessage'
        )
    ) {
        return err.JSON.Results[0];
    }

    return err;
};

export { handleError };
