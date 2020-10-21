const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
require('dotenv').config()

const app = express();

app.use(bodyparser.urlencoded({extended:false}));

app.use(bodyparser.json());

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.gkejz.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
const options = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(uri, options)
.then(() => console.log('Base de datos conectada'))
.catch(e => console.log('error db:', e))



//Import routes
const authRoutes = require('./routes/auth');
const verifyToken = require('./routes/validate-token');
const adminRoutes = require('./routes/admin');
 
//Route midlewares
app.use('/api/user', authRoutes)
app.use('/api/admin', verifyToken, adminRoutes)
app.get('/', (req, res) => {
  res.json({
    estado:true, 
    mensaje: 'Funciona!'
  })
})

//Iniciar server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor iniciado en ' + PORT);
})