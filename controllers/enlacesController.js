const Enlace = require('../models/Enlace');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');


exports.nuevoEnlace = async (req, res, next) => {

    //REvisar si hay errores
     //Mostrar mensajes de error de express validator
     const errores = validationResult(req);
     if(!errores.isEmpty()) {
         return res.status(400).json({errores: errores.array()});
     }



    //Crear un objeto Enlace
    const {nombre_original, nombre} = req.body;

    const enlace = new Enlace();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;
  

    //Si el usuario esta autenticado
    if(req.usuario) {
        const {password, descargas} = req.body;

        //asignar el numero de descargas
        if(descargas) {
            enlace.descargas = descargas;
        }
        //asignar 1 password
        if(password) {
            const salt = await bcrypt.genSalt(10);
        enlace.password = await bcrypt.hash(password, salt);
        }
        //ASignar el autor
        enlace.autor = req.usuario.id;

    }


    //Almacenar enlaces en la base d datos
   try {
       await enlace.save();
       return res.json({msg: `${enlace.url}`})
       next();
   } catch (error) {
       console.log(error)
   }
}

//VErifica si el password es Correcto
exports.verificarPassword = async (req, res, next) => {
    const {url} =req.params;
    const {password} =req.body;

    const enlace = await Enlace.findOne({url});

    //VErifica el passord
    if(bcrypt.compareSync(password, enlace.password)) {
        //permiir descarcar el archivo
        next();
    } else {
        return res.status(401).json({msg: 'Password Incorrecto'})
    }
   

}
//Ontiene todos los enlaces
exports.todosEnlaces = async (req, res) => {
    try {
        const enlaces = await Enlace.find({}).select('url -_id');
        res.json({enlaces})
    } catch (error) {
        console.log(error)
    }

}


//retorna si el enlace tiene password
exports.tienePassword = async (req, res, next) => {

    //console.log(req.params.url);
    const {url} = req.params;

    //VErificar si existe el enlace
    const enlace = await Enlace.findOne({url});

    if(!enlace) {
        res.status(404).json({msg: 'Ese enlace no existe'});
        return next();
    }

    if(enlace.password) {
        return res.json({password: true, enlace: enlace.url})
    }

    
    next();
  
}


//obener el enlace
exports.obtenerEnlace = async (req, res, next) => {

    //console.log(req.params.url);
    const {url} = req.params;

    //VErificar si existe el enlace
    const enlace = await Enlace.findOne({url});

    if(!enlace) {
        res.status(404).json({msg: 'Ese enlace no existe'});
        return next();
    }

    //Si el enlace existe
    res.json({archivo: enlace.nombre, password: false})

    next();
  
}

