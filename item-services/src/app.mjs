import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import itemRoutes from './routes/itemRoutes.mjs';
import errorHandlers from './middleware/routeErrorHandler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use(itemRoutes);

app.use(errorHandlers.routeErrorHandler);
app.use(errorHandlers.globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Item service running on port ${PORT}`);
});

export default app;

