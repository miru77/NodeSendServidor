const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlace = require('../models/Enlace');

//Subida de archivos



exports.subirArchivo = async (req, res, next) => {

    const configuracionMulter = {
        limits : {fileSize : req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname+'/../uploads')
            },
            filename: (req, file, cb) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}` );
            }
          
        })
    }
    
    const upload = multer(configuracionMulter).single('archivo');
    upload(req, res, async (error) => {
        console.log(req.file);

        if(!error) {
            res.json({archivo: req.file.filename})
        } else {
            console.log(error);
            return next();
        }
    });
       
}

exports.elimiarArchivo = async (req, res) => {
    console.log(req.archivo)

    try {
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
        console.log('Archivo eliminado');
    } catch (error) {
        console.log(error);
        
    }
    
}

exports.descargar = async (req, res, next) => {

    //obtiene el enlace
    const {archivo} = req.params;
    const enlace = await Enlace.findOne({nombre: archivo})


    const archivoDescarca = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarca);

    //ELimar el archivo
    // Si las descargas son iguales a 1 - Borrar la entrada y borrar el archivo
    const { descargas, nombre} = enlace;

    if(descargas === 1) {
        //Elimiar el archivo
        req.archivo = nombre;

        //Eliminar la entra da a bd
        await Enlace.findOneAndRemove(enlace.id);
        next();

    } else {
         //SI las descargas son > a 1 - REstar 1
         enlace.descargas--;
         await enlace.save();
    }

}

