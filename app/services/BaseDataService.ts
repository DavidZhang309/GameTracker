import * as http from 'https';
import * as https from 'https';

export abstract class BaseDataService {
    /**
     * Get the hostname of the API server being handled by this service
     * 
     * @return hostname the hostname of server
     */
    protected abstract getAPIHost(): string;

    /**
     * Queries the specified url path.
     * 
     * @param api The API path
     * @param args The query arguments
     * @param secure Is the api secure
     * 
     * @returns promise
     */
    protected queryAPI(path, secure: boolean): Promise<string> {
        // Get the correct GET function depending on its security
        let getFn = secure ? https.get : http.get;
        // Create promise
        return new Promise<string>((resolve, reject) => {
            // Start query
            getFn({
                host: this.getAPIHost(),
                path: path
            }, (response) => {
                //check if successfull
                let success = response.statusCode != 200;
                let chunks = [];
                //gather response
                response.on('data', (chunk) => { chunks.push(chunk); });
                response.on('end', () => { 
                    if (success) { 
                        resolve(chunks.join(''));     
                    } else {
                        reject({
                            status: response.statusCode,
                            message: chunks.join('')
                        })
                    }
                });
            }).on('error', (response) => {
                //console.log(response.message)
                reject({
                    message: 'Http error: ' + response.name
                })
            });
        });
    }
}