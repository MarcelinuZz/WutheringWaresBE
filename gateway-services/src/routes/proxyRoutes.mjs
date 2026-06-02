import { createProxyMiddleware } from "http-proxy-middleware";
import { Router } from "express";

const setupProxyRoutes = () => {
    const router = Router();

    router.use('/auth', createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/auth': '/auth'
        }
    }));

    router.use('/users', createProxyMiddleware({
        target: process.env.USER_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/users': '/users'
        }
    }));

    router.use('/items', createProxyMiddleware({
        target: process.env.ITEM_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/items': '/items'
        }
    }));

    router.use('/uploads', createProxyMiddleware({
        target: process.env.ITEM_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/': '/uploads/'
        }
    }));

    router.use('/cart', createProxyMiddleware({
        target: process.env.ORDER_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/cart': '/cart'
        }
    }));

    router.use('/orders', createProxyMiddleware({
        target: process.env.ORDER_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/orders': '/orders'
        }
    }));

    return router;
}

export default setupProxyRoutes;