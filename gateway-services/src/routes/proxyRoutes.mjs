import { createProxyMiddleware } from "http-proxy-middleware";
import { Router } from "express";

const setupProxyRoutes = () => {
    const router = Router();

    router.use('/auth', createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^auth': ''
        }
    }));

    router.use('/users', createProxyMiddleware({
        target: process.env.USER_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^users': ''
        }
    }));

    return router;
}

export default setupProxyRoutes;