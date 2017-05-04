import * as http from 'https';
import * as https from 'https';

export abstract class BaseDataService {
    protected abstract getAPIHost();

    /**
     * Queries the specified API using args.
     * 
     * @param api The API path
     * @param args The query arguments
     * @param secure Is the api secure
     */
    protected queryAPI(path, secure: boolean): Promise<string> {
        let getFn = secure ? https.get : http.get;
        return new Promise<string>((resolve, reject) => {
            getFn({
                host: this.getAPIHost(),
                path: path
            }, (response) => {
                let chunks = [];
                response.on('data', (chunk) => { chunks.push(chunk); });
                response.on('end', () => { resolve(chunks.join('')); })
            });
        });
    }
}