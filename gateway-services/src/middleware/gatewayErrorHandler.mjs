const GatewayErrorHandler = (err, req, res, next) => {
    console.error("Gateway Error:", err);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message,
        status,
        timestamp: new Date().toISOString()
    });
}

export default GatewayErrorHandler;