import express from "express";
import cors from 'cors';
import morgan from "morgan";
import "dotenv/config";
import passport from './config/passportConfig.mjs';
import authRoutes from './routes/authRoutes.mjs';
import routeErrorHandler from "./middleware/routeErrorHandler.mjs";
import globalErrorHandler from "./middleware/globalErrorHandler.mjs";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(passport.initialize());

app.use(authRoutes);

app.use(routeErrorHandler);
app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`Auth services running on port ${port}`);
});

export default app;