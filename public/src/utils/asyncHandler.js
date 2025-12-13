// Promise.resolve() converts your async function into a promise.

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    };
};
export { asyncHandler }


// ** asyncHandler = a wrapper that automatically catches async errors in Express routes.
// don't crash the server

// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next);
//     }
//     catch(err){
//         res.status(err.code || 500).json({
//             success: true,
//             message: err.message
//         });
//     }
// };