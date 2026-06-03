import express from "express";
import cors from 'cors';
import morgan from "morgan";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const startServer = async () => {
    if (process.env.NGROK_AUTHTOKEN) {
        try {
            const ngrok = await import('@ngrok/ngrok');

            const connectOptions = {
                addr: port,
                authtoken: process.env.NGROK_AUTHTOKEN,
            };

            if (process.env.NGROK_DOMAIN) {
                connectOptions.domain = process.env.NGROK_DOMAIN;
            }

            const listener = await ngrok.forward(connectOptions);
            const publicUrl = listener.url();

            process.env.GOOGLE_CALLBACK_URL = `${publicUrl}/google/callback`;
            process.env.DISCORD_CALLBACK_URL = `${publicUrl}/discord/callback`;
            process.env.GOOGLE_BIND_CALLBACK_URL = `${publicUrl}/bind/google/callback`;
            process.env.DISCORD_BIND_CALLBACK_URL = `${publicUrl}/bind/discord/callback`;

            console.log(`Ngrok Auth Active : ${publicUrl}`);
        } catch (err) {
            console.error('Ngrok Auth Failed :', err.message);
        }
    }

    const { default: passport } = await import('./config/passportConfig.mjs');
    const { default: authRoutes } = await import('./routes/authRoutes.mjs');
    const { default: routeErrorHandler } = await import('./middleware/routeErrorHandler.mjs');
    const { default: globalErrorHandler } = await import('./middleware/globalErrorHandler.mjs');

    app.use(passport.initialize());
    app.use(authRoutes);
    app.use(routeErrorHandler);
    app.use(globalErrorHandler);

    app.listen(port, () => {
        console.log(`Auth services running on port ${port}`);
    });
};

startServer();

export default app;