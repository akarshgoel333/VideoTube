// hume database se baar baar baat toh krni hi hai, user k controller mein, video k controller mein baar baar baat krenge toh same syntax ko baar baar likhne se better hai hum ek utility file bna le usky method mein function pass krke apna data nikaal lu, wrapper lga denge usky aage

// promises handler
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=> next(err))
    }
}
export {asyncHandler}


// const func = () => {}
// const func = (fxn) => {() => {}}
// jst remove curly braces
// const func = (fxn) => () => {}
// for async funcs
// const func = (fxn) => async() => {}

// try catch syntax handler
// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }