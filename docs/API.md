# API #
This document describes the specifications of all API of this site.

## API Notes ##
All requests must return a JSON object.

Any results from the query must be contained in the result property of the JSON response.

An error property indicates an error occuring in the query. 
This also means the if the error property doesn't exist, query was a success.

General API response example
```json
{
    "error": "msg", // if this property exists, an error occured
    "result":  //This can be anything, and is optional as it is dependent on the API
    
    // more properties can exist for more information about the query
}
```

## Tracker ##