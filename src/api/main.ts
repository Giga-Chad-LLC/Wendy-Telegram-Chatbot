import express from 'express';
import cors from 'cors';
import { UserController } from './UserController';

const app = express();

app.use(express.json());
app.use(cors());
app.get('/', function (req, res) {
  res.send('Hello World');
});

app.use('/user', UserController);
app.listen(3000, () => console.log('API listening on http://localhost:3000'));
