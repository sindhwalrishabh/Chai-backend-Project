// it just a method and isse export kr dete h


// this is promises method
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
        }
}

export {asyncHandler}







// const asyncHnadler = () => {}
// const asyncHnadler = (func) => () =>{}
// const asyncHandler = (func) => async () => {}


    //this is try catch method
// const asyncHandler = (fn) => async (req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
