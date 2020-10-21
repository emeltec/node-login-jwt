const router = require('express').Router();
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const schemaRegister = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
})

const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required()
})


router.post('/register', async(req,res) => {
  //Validaciones
  const {error} = schemaRegister.validate(req.body)
  
  if(error){
    return res.status(400).json({error: error.details[0].message})
  }
  
  const existeEmail = await User.findOne({email: req.body.email})
  if(existeEmail){
    return res.status(400).json({error: true, mensaje: 'Email ya registrado'})
  }

  //Hash contraseña
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt)

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: password
  })

  try {
    const userDB = await user.save()
    res.json({error:null, data: userDB})
  } catch (error) {
    res.status(400).json(error)
  }

})

router.post('/login', async (req, res) => {
  //Validaciones
  const { error } = schemaLogin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message })
  
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: true, mensaje: 'Usuario no encontrado' });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ error: true, mensaje: 'Contraseña no válida' })
  
  //Create token
  const token = jwt.sign({name: user.name, id: user._id}, process.env.TOKEN_SECRET);

  /* res.json({
    error: null,
    data: 'Exito bienvenido',
    token: token
  }) */

  res.header('auth-token', token).json({
    error: null,
    data: {token}
  })

})

module.exports = router;