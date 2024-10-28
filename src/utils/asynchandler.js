const asynchandler = (reqHandler) => {
    return (req,res,next) => {
        Promise.resolve(reqHandler(req,res,next)).catch((err) => next(err))
    }
}


export {asynchandler}


// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         console.log(error);
//         res.status(err.code || 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }