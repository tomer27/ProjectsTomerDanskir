import express, { Router } from 'express';
const router: Router = express.Router();
import { passport } from '../index';
import User from '../Models/User';
import { CreateUser } from '../Repositories/UserRepository';

router.post("/login", passport.authenticate("local"), (req,res) => {
  if(!req.user) res.send(false);
  else res.send(true);
});

router.get("/", (req: any, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
      console.log(`user is authenticated, session is ${req.session.id}`);
    } else {
      console.log("unknown user");
    }
    res.send(isAuthenticated);
});

router.post('/register', async(req, res) => {
  const result = await CreateUser(req.body.username, req.body.email, req.body.password);
  if((result as User).username !== undefined){
    req.login(result, function(err) {
      return res.send(true);
    });
  } else res.send(result);
});

export default router;