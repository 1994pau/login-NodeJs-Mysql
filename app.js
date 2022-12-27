//1 Invocamos a express
const express = require ('express'),
      app = express();

//2 Seteamos urlencoded para capturar los datos del formulario 
app.use (express.urlencoded({extended:false}));
app.use (express.json());

// 3 Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'}); 

// 4 el directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// 5 Establezco el motor de plantillas
app.set('view engine', 'ejs');

//6 Invocamos a bcryptjs
const bcryptjs = require ('bcryptjs');

//7 Var. de session
const session = require ('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized:true
}));

// 8 Invocamos al modulo de conexión de la BD
const connection = require('./database/db');

// 9 Estableciendo las rutas
app.get('/login', (req, res)=>{
    res.render('login');
})

app.get('/register', (req, res)=>{
    res.render('register');
})

// 10 Registración
app.post ('/register', async (req, res)=>{
    const user = req.body.user;
    const nom = req.body.nom;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET?', {user:user, nom:nom, rol:rol, pass:passwordHaash}, async(error, results)=>{
        if (error){
            console.log(error);
        }else{
            res.render('register',{
                alert:true,
                alertTitle:"Registration",
                alertMessage:"¡Successful Registration",
                alertIcon: 'success',
                showConfirmButton:false,
                timer:1500,
                ruta:''
            })
        }
    }) 
})
// 11- Autenticación
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert:true,
                    alertTitle: "Error",
                    alertMessage: "Nombre de usuario y/o contraseña incorrectos",
                    alertIcon: "error",
                    showConfirmButton:false,
                    timer: 10000,
                    ruta:'login' 
                });
            }else{
                req.session.loggedin = true;
                req.session.nom = results[0].nom;
                res.render('login',{
                    alert:true,
                    alertTitle: "Conexión Exitosa",
                    alertMessage: "¡ACCESO CORRECTO!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer:20000,
                    ruta:'' 
                });            
            }
        })
    }else{
        res.render('login',{
            alert:true,
            alertTitle: "Caveat",
            alertMessage: "¡Por favor ingrese un usuario y/o password!",
            alertIcon: "warning",
            showConfirmButton: true,
            timer:3000,
            ruta:'login' 
        });      
    }

})

// 12- Auth pages
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            nom: req.session.nom
        });
    }else{
        res.render('index',{
            login: false,
            nom:'Debe iniciar sesión'
        })
    }
})

// 13 - Logout
app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNING IN http://localhost:3000');

})

