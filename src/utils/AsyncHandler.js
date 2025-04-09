// https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
// async middlewares, that will call next(err) if the promise is rejected, reaching the express error handler and avoiding UnhandledPromiseRejectionWarning
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};