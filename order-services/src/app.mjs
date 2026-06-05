import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import cartRoutes from './routes/cartRoutes.mjs';
import orderRoutes from './routes/orderRoutes.mjs';
import errorHandlers from './middleware/routeErrorHandler.mjs';

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cartRoutes);
app.use(orderRoutes);

app.use(errorHandlers.routeErrorHandler);
app.use(errorHandlers.globalErrorHandler);

app.listen(PORT, async () => {
    console.log(`Order service running on port ${PORT}`);

    if (process.env.NGROK_AUTHTOKEN) {
        try {
            const ngrok = await import('@ngrok/ngrok');
            const listener = await ngrok.forward({
                addr: PORT,
                authtoken: process.env.NGROK_AUTHTOKEN,
            });

            const webhookUrl = `${listener.url()}/orders/notification`;
            console.log(`Ngrok Order Active : ${webhookUrl}`);
        } catch (err) {
            console.error('Ngrok Order Failed :', err.message);
        }
    }
});

export default app;
