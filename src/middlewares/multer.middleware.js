import multer from "multer";
import crypto from "crypto";

const storage = multer.diskStorage({
    //destination btayega ki kahan pr file upload honi hai
    //file mein info rhegi uploaded file ki
    destination: function (req, file, cb) {
        // cb(err,value)
        cb(null, './public/temp')
    },
    //filename btayega ki file k naam kya rhega jo ki randomly generated rhega
    filename: function (req, file, cb) {
        // //crypto se 16 bytes randomly generate hongi or usky through hex characters mein chng krke filename save hoyega
        // crypto.randomBytes(16, function (err, raw) {
        //     if (err) return cb(err);
        //     // cb(err,filename)
        //     cb(null, file.fieldname + '-' + raw.toString('hex'))
        // })
        cb(null, file.originalname);
    }
})

export const upload = multer({ 
    storage,
})