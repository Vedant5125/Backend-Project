const asynHandler = (requesthandler) =>{
    (req, res, next) => {
        Promise.resolve(requesthandler(req, res, next)).catch((error)=> next(error));
    }
}

export {asynHandler};


// ******************************************************
// const asynHandler = (func) => { async () =>{}}   same 

// const asynHandler = (func) => async (req, res, next) =>{
//     try {
//         await func(req, res, next)
        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }