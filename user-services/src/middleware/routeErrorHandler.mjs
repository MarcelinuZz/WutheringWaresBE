const routeErrorHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} tidak ditemukan di layanan ini.`,
        status: 404,
        timestamp: new Date().toISOString()
    });
};

export default routeErrorHandler;
