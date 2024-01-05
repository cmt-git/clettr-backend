import express, { Router } from 'express';

const homeRouter = Router();
homeRouter.use(express.json());

homeRouter.get('/', async (req: any, res, next) => {
    if (req.isAuthenticated()){
        return res.status(200).send({
            "message": "Success!",
            "success": true
        });
    }
    else {
        return res.status(200).send({
            "message": "Please log in.",
            "success": false
        });
    }
});

export default homeRouter;