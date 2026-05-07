import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import userRoutes from './routes/userRoutes.mjs';
import routeErrorHandler from './middleware/routeErrorHandler.mjs';
import globalErrorHandler from './middleware/globalErrorHandler.mjs';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(userRoutes);

app.use(routeErrorHandler);
app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`User services running on port ${port}`);
});

export default app;
