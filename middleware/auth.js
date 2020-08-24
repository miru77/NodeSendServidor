require('dotenv').config({path:'variables.env'});
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
     
    const authHeader =  req.get('Authorization');

    if(authHeader) {
        //obtener token
        const token = authHeader.split(' ')[1];

        //comparar el jwt
       try {
           const usuario = jwt.verify(token, process.env.SECRETA);
          
           req.usuario = usuario;
           
       } catch (error) {
           console.log(error);
           console.log('JWT no valido');
       }
       

    } 

    return next();
}