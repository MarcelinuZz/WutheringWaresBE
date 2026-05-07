import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import emailRoutes from './routes/emailRoutes.mjs';
import internalAuth from './middleware/internalAuth.mjs';
import routeErrorHandler from './middleware/routeErrorHandler.mjs';
import globalErrorHandler from './middleware/globalErrorHandler.mjs';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(internalAuth);
app.use(emailRoutes);

app.use(routeErrorHandler);
app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`Email services running on port ${port}`);
});

export default app;
