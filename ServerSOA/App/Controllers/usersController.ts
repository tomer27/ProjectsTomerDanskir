import express, { Router } from 'express';
import {GetFriendsById, GetAllUserChats, SearchUserByName} from '../Repositories/UserRepository';
const router: Router = express.Router();


router.get('/getFriends', async (req, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
        // @ts-ignore
        const friends = await GetFriendsById(req.user?._id);
        res.send(friends);
    } else{
        res.status(401).send();
    }
});

router.get('/getUserChats', async(req, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
        // @ts-ignore
        const chat = await GetAllUserChats(req.user?._id);
        res.send(chat);
    } else{
        res.status(401).send();
    }
})

router.get('/getUserId', (req, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
        // @ts-ignore
        res.send(req.user?._id);
    } else{
        res.status(401).send();
    }
})

router.get('/searchUser/:searchQuery', async(req, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
        const result = await SearchUserByName(req.params.searchQuery);
        console.log(result);
        res.send(result);
    } else{
        res.status(401).send();
    }
})

router.get('/helloworld', (req, res) => {
    res.send('hello world');
})

export default router;