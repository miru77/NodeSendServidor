const Usuariossend = require('../models/Usuariossend');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');


exports.nuevoUsuario = async (req, res) => {

    //Mostrar mensajes de error de express validator
    const errores = validationResult(req);
    if(!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()});
    }



    //verificar si el usuario ya esta registrado
    const {email, password} = req.body;

    let usuariossend = await Usuariossend.findOne({email});

    if(usuariossend) {
        return res.status(400).json({msg:'El usuario ya esta registrado'});
    }
    
    // crear un nuevo usuario  
     usuariossend = new Usuariossend(req.body);

     //Hashear el password
     const salt = await bcrypt.genSalt(10);
     usuariossend.password = await bcrypt.hash(password, salt);

     try {
        await usuariossend.save();

        res.json({msg: 'Usuario creado correctamente'});

     } catch (error) {
         console.log(error);
     }

 
    
}

