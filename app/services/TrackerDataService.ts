import { BaseDataService } from './BaseDataService';
import { MongoClient, Db } from 'mongodb';

export class TrackerDataService extends BaseDataService {
    public getAPIHost() {
        return null;
    }

    public getItem(filter, db: Db = null): Promise<any[]> {
        if (db == null) {
            return this.connectToDB().then((db: Db) => {
                return this.getItem(filter, db);
            });
        } else {
            return db.collection('tracker_items').find(filter).toArray();
        }
    }

    public updateItem(itemData, db: Db = null) {
        if (db == null) {
            return this.connectToDB().then((db: Db) => {
                return this.updateItem(itemData, db);
            });
        } else {
            return db.collection('tracker_items').updateOne(
                { item_id: itemData.item_id }, 
                itemData
            );
        }
    }
}