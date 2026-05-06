const routeErrorHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        status: 404,
        timestamp: new Date().toISOString()
    });
}

export default routeErrorHandler;