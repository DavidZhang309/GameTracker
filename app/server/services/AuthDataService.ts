import * as crypto from 'crypto';
import { BaseDataService } from './BaseDataService';

export class AuthDataService extends BaseDataService {
    protected getAPIHost() {
        return null;
    }

    protected generatePasswordHash(pass: string, salt: string): string {
        let hashFn = crypto.createHash('sha256');
        hashFn.update(salt + pass);
        return hashFn.digest('hex');
    }

    public authenticate(user: string, pass: string): Promise<boolean> {
        return this.connectToDB().then((db) => { // Get user information
            let users = db.collection('users');
            return users.findOne({ username: user });
        }).then((userInfo) => { // Authenticate
            if (userInfo == null) { return false; } // no user foud
            //hash password and check
            return userInfo.password === this.generatePasswordHash(pass, userInfo.salt)
        }).catch((err) => { // Fail login on error
            return false;
        });
    }
}