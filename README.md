# bldr-sdk

SDK for core BLDR functionality

# Install

# Initiate

## Reference package

```
const bldrSDK = require('@basetime/bldr-sfmc-sdk')

// OR

Import { bldrSDK } from '@basetime/bldr-sfmc-sdk'

```

## Setup Client

```
const authObject = {
  client_id: 'xxxxxxxxxx',
  client_secret: 'xxxxxxxxxx',
  auth_url: 'https://xxxxxxxxxx-xxxxxxxxx.auth.marketingcloudapis.com/',
  account_id: 'xxxxxxxxx'
}

const bldr = new bldrSDK(authObject)
const { sfmc } = bldr
```

# Usage

## Folders

Folder functionality is based on the [DataFolder](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/datafolder.html) SOAP API object unless otherwise documented.

1. search
    ```
     const searchRequest = await sfmc.folder.search({
         contentType: 'asset',
         searchKey: 'Name',
         searchTerm: 'bldr-sfmc'
     })
    ```
2. get
3. getSubfolders
4. create
5. \_updateAllowChildren
