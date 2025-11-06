import express, { type Router } from 'express';

const router: Router = express.Router();

router.get('/', (_, res) => {
  const response = {
    message: "Hello from User BFF",
  };

  res.status(200).json(response);
});

export default router;
