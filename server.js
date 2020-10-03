/* require the express module */
import express from 'express';  //ES6 replacement for the previous common js code (add "type":"module" on package.js for this to work):  const express = require('express');   
//lookup how to enable ES modules in Node.js https://flaviocopes.com/how-to-enable-es-modules-nodejs/
import mustacheExpress from 'mustache-express';
/* require the body-parser module */
import bodyParser from 'body-parser';

/*require the pg module for the connection to the database*/
import PG from 'pg';
const Client = PG.Client;

/* create an instance of express for the new application */
const app = express();   // store it on a constant variable 'app'

/*create an instance of mustacheExpress - for allowing to create mustache templates*/
const mustache = mustacheExpress();
mustache.cache = null;			    //set cache equals null
app.engine('mustache', mustache);   //make mustache as the engine for the application
app.set('view engine', 'mustache'); //set the view engine as mustache

app.use(express.static('public'));  //make the folder 'public' as the folder for the static files
app.use(bodyParser.urlencoded({extended:false})); //tell express we are using body-barser module

/*Setup routes*/
app.get('/add', (req, res)=>{           //route to render a route '/add' with a form for adding a new medicine
    res.render('med-form');
});

app.get('/noticias', (req, res)=>{      
    res.render('noticias');
});

//Post method to add an entry to the database
app.post('/meds/add', (req, res)=>{     //route to redirect to another route whenever a form is submitted
    console.log('post body', req.body); // see in console which data was submitted to the form 
    
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: '1234567',
        port: 5432,
    });
client.connect()    
    .then(()=>{         //making use of promisses (when the client is connected, then execute the following statements)
        console.log('Connection Complete');
        const sql = 'INSERT INTO meds (name, count, brand) VALUES ($1,$2,$3)'
//        const params = ['FREWED','344','Dsz'];  //hardcoded values
        const params = [req.body.name,req.body.count,req.body.brand];  //replacing hardcoded values with values inserted in the form, using the request body 
        return client.query(sql,params);
    })
    .then((result)=>{ //when the previous statements are exwcuted then we use another promise again 
        console.log('results?', result);    // In the console, display the data sent to the database
        res.redirect('/meds');              // redirect to route '/meds'
    });
});


/*dashboard*/
app.get('/dashboard', (req,res)=>{
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: '1234567',
        port: 5432,
    });
    client.connect()
    .then(()=>{
        return client.query('SELECT SUM(count) FROM meds; SELECT count(DISTINCT brand) FROM meds');
    })
    .then((results)=>{
        console.log('?results', results[0]);        
        console.log('?results', results[1]);
        res.render('dashboard', {n1:results[0].rows, n2:results[1].rows});
    })
});
//end of dashboard

//route to the webpage meds (Get method to select all entries from db)
app.get('/meds', (req,res)=>{
    //setup the client to connect to the database
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: '1234567',
        port: 5432,
    });
client.connect()    
    .then(()=>{         
        return client.query('SELECT * FROM meds');
    })
    .then((results)=>{ 
        console.log('results?', results);
        res.render('meds', results);
    });
});

/*Post method to delete an entry from the database*/
app.post('/meds/delete/:id', (req,res)=>{
        //setup the client to connect to the database
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'medical1',
            password: '1234567',
            port: 5432,
        });
    client.connect()    
        .then(()=>{         
            const sql = 'DELETE FROM meds WHERE mid=$1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results)=>{ 
            res.redirect('/meds');
        });
});

/*Get method to select the entry from the database to be edited*/
app.get('/meds/edit/:id', (req,res)=>{
    //setup the client to connect to the database
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: '1234567',
        port: 5432,
    });
client.connect()    
    .then(()=>{         
        const sql = 'SELECT * FROM meds WHERE mid=$1'
        const params = [req.params.id];
        return client.query(sql, params);
    })
    .then((results)=>{
        console.log('results?', results); 
        res.render('meds-edit',{med:results.rows[0]});
    });
});

//Post method to edit an entry in the database
app.post('/meds/edit/:id', (req, res)=>{
    //setup the client to connect to the database
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: '1234567',
        port: 5432,
    });
client.connect()    
    .then(()=>{         
        const sql = 'UPDATE meds SET name=$1, count=$2, brand=$3 WHERE mid=$4'
        const params = [req.body.name, req.body.count, req.body.brand, req.params.id];

        return client.query(sql, params);
    })
    .then((results)=>{
        console.log('results?', results); 
        res.redirect('/meds');
    });
});

/* Make it listen to a specific port */ 
app.listen(5001, ()=>{   //subtorine listen(_portNumber_, _callbackFunction_using_fatArrowNotation_)
    console.log('Listening to port 5001');
}); 
//lookup fat arrow notation on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
