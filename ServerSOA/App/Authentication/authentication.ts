import express, { Router } from 'express';
const router: Router = express.Router();
const LocalStrategy = require("passport-local").Strategy;
import { passport } from '../index';
import {LoginValidation} from '../Repositories/UserRepository';

passport.use(
  new LocalStrategy(async(username:any, password:any, done:any) => {
    const IsLoginValid = await LoginValidation(username, password);
    if (IsLoginValid !== null) {
      return done(null, IsLoginValid);
    } else {
      return done(null, false);
    }
  })
);

passport.serializeUser((user:any, cb:any) => {
  //console.log(`serializeUser ${user}`);
  cb(null, user);
});

passport.deserializeUser((id:any, cb:any) => {
  //console.log(`deserializeUser ${id}`);
  cb(null, id);
});

export default router;