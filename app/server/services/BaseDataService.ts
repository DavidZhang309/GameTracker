import * as http from 'https';
import * as https from 'https';
import { MongoClient, Db } from 'mongodb';

var config = require('../config.json');

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
                let success = response.statusCode == 200;
                let chunks = [];
                //gather response
                response.on('data', (chunk) => { chunks.push(chunk); });
                response.on('end', () => { 
                    if (success) { 
                        resolve(chunks.join(''));     
                    } else {
                        let error = new Error("API server returned code " + response.statusCode + " with message: " + chunks.join(''));
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Connects to DB with promise
     * 
     * @returns A promise of a db connection
     */
    protected connectToDB(): Promise<Db>  {
        return new Promise((resolve, reject) => {
            MongoClient.connect(config.mongodb_connection, (err, db: Db) => {
                if (err) { reject(err) }
                else { resolve(db) }
            })
        })
    }
}