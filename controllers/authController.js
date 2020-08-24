const Usuariossend = require('../models/Usuariossend');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'variables.env'});
const {validationResult} = require('express-validator');




exports.autenticarUsuario = async (req, res, next) => {

    //Revisar si hay errores
    //Mostrar mensajes de error de express validator
    const errores = validationResult(req);
    if(!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()});
    }


    //Buscar el usuario para ver si esta registrado
    const {email, password} = req.body;
    const usuariossend = await Usuariossend.findOne({email});
    //console.log(usuariossend);

    if(!usuariossend) {

        res.status(401).json({msg: 'El Usuario no existe'});
        return next();
    }
    //verificar el password y autenticar el usuario
  if(bcrypt.compareSync(password, usuariossend.password)) {
        // Crear JWT
        const token = jwt.sign({
            id: usuariossend._id,
            nombre: usuariossend.nombre,
            email : usuariossend.email
        }, process.env.SECRETA, {
            expiresIn: '8h'
        });

        res.json({token})

  } else {
    res.status(401).json({msg: 'El Password es incorrecto'});
    return next();
  }


} 

exports.usuarioAutenticado = (req, res) => {

   res.json({usuario: req.usuario})


}

