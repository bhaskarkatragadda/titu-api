const createError = require('http-errors');

const notFound = (req, res, next) => next(createError.NotFound(`Not Found - ${req.originalUrl}`));

const errorHandler = (err, req, res) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
};

module.exports = {
  notFound,
  errorHandler,
};
