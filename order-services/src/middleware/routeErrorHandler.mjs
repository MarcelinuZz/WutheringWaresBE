export const routeErrorHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan.'
    });
};

export const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server.'
    });
};

export default {
    routeErrorHandler,
    globalErrorHandler
};
