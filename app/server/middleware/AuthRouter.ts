import * as passport from 'passport';
import * as passport_local from 'passport-local';
import { Router } from 'express';
import { IServiceRouter } from './IServiceRouter';
import { AuthDataService } from '../services/AuthDataService';
let LocalStrategy = passport_local.Strategy;

export class AuthRouter implements IServiceRouter {
    service = new AuthDataService();
    router = Router();
    liteRender: boolean;

    public constructor(liteRender: boolean) {
        this.liteRender = liteRender;

        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });
        passport.use(new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password'
            }, (user, pass, done) => {
                this.service.authenticate(user, pass).then((verified) => {
                    if (verified) {
                        done(null, user);
                    } else {
                        done(null, false, { message: "Bad username/password" });
                    }
                }).catch((err) => {
                    console.log(err);

                });
            }
        ));
        this.router.get('/login', (request, response) => { response.render('pages/auth/login', { }); });
        this.router.post('/api/login', passport.authenticate('local', { 
                failureRedirect: '../login',
                successRedirect: '/'
            })
        );
    }
}
