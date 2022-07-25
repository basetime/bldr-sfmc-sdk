const SDK = require('sfmc-sdk')

interface AuthObject {
    client_id: String,
    client_secret: String,
    auth_url: string,
    account_id: number
}

/**
 * Initialize SFMC API instance
 * @param {object} AuthObject
 */
module.exports.init = async (authObject: AuthObject) => {
    try {
        return new SDK(
            {
                client_id: authObject.client_id,
                client_secret: authObject.client_secret,
                auth_url: authObject.auth_url,
                account_id: authObject.account_id,
            },
            {
                eventHandlers: {
                    // onLoop: (type, accumulator) => console.log('Looping', type, accumlator.length),
                    // onRefresh: (options) => console.log('RefreshingToken.', Options),
                    logRequest: (req) => process.env.NODE_ENV === 'development' ? console.log(req) : null,
                    logResponse: (res) => process.env.NODE_ENV === 'development' ? console.log(res) : null,
                    onConnectionError: (ex, remainingAttempts) => process.env.NODE_ENV === 'development' ? console.log(ex.code, remainingAttempts) : null
                },
                requestAttempts: 1,
                retryOnConnectionError: true,
            }
        );
    } catch (err) {

    }
};
