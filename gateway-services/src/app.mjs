import express from "express";
import cors from 'cors'
import morgan from "morgan";
import "dotenv/config";
import GatewayErrorHandler from "./middleware/gatewayErrorHandler.mjs";
import routeErrorHandler from "./middleware/routeErrorHandler.mjs";
import setupProxyRoutes from "./routes/proxyRoutes.mjs";

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use('/api', setupProxyRoutes());

app.use(GatewayErrorHandler);
app.use(routeErrorHandler);

app.listen(process.env.PORT, () => {
    console.log(`gateway services running on port ${process.env.PORT}`);
});

export default app;