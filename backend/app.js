//const http = require('http');
var mysql = require('mysql');
var express = require('express');
var cors = require('cors');
var app = express();
var stock = require('./stock_module');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "react_node_demo"
});

app.use(cors());
app.use(express.json());
app.post('/ajax_data', function(req, res) {

        res.set('Access-Control-Allow-Origin', '*');
        // res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        // res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        // res.setHeader("Expires", "0"); // Proxies.
        console.log("params fetch_all_stock",req.body);
        if(req.body.fetch_all_stock == 'fetch_all_stock'){
        res.set('content-type', 'text/json');
        res.status(200);
        var output = {};
        console.log("Connected!");
        var sql = "select * from stock_list";
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
            output['stock'] = result;
        });

        var sql = "select id,name from user";
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
            output['user'] = result
        res.send(JSON.stringify(output)); 
        });
       }
       else if(req.body.fetch_stock_details == 'fetch_stock_details'){

        res.set('Access-Control-Allow-Origin', '*');
        console.log("params fetch_stock_details",req.body);
       
        res.set('content-type', 'text/json');
        res.status(200);
        var output = {};
        output['alldetails'] = {};
        output['userstockdetails']= {};
        console.log("Connected!");
        var sql = `select * from stock_list where id = ${req.body.id}`;
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
            output['alldetails'] = result;
        });

        var sql = `SELECT IFNULL(SUM(sh.qty), 0) as owned_stock,COUNT(*) as count FROM stock_list sl INNER JOIN stock_history sh on sl.id = sh.stock_id where sh.stock_id = ${req.body.id} and sh.user_id = ${req.body.user_id}`;
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
            output['userstockdetails'] = result
        res.send(JSON.stringify(output)); 
        });
           
       }
       else if(req.body.select_stock_transaction == 'select_stock_transaction'){
          res.set('content-type', 'text/json');
          res.status(200);
          console.log("Connected in select_stock_transaction");
          var sql = "SELECT sl.stock_name,sh.* FROM stock_history sh INNER JOIN stock_list sl on sl.id = sh.stock_id WHERE sh.datetime IN (SELECT MAX(datetime) FROM stock_history GROUP BY stock_id HAVING sh.id = sh.id) ORDER BY sh.datetime DESC";
          con.query(sql, function (err, result, fields) {
          if (err) throw err;
              res.send(JSON.stringify(result));
          });
       }
       else if(req.body.fetch_individual_stock_details_all == 'fetch_individual_stock_details_all'){
          res.set('content-type', 'text/json');
          res.status(200);
          var output = {};
          console.log("Connected in fetch_individual_stock_details_all!");
          var sql = "SELECT sl.stock_name, sh.* FROM stock_list sl INNER JOIN stock_history sh on sl.id = sh.stock_id ORDER BY datetime ASC";
          con.query(sql, function (err, result, fields) {
          if (err) throw err;
              res.send(JSON.stringify(result));
          });
       }
       else if(req.body.stock_max_valuation == 'stock_max_valuation'){
          res.set('content-type', 'text/json');
          res.status(200);
          console.log("Connected in fetch_individual_stock_details_all!");
          var sql = "SELECT * FROM `stock_list` ORDER BY valuation DESC";
          con.query(sql, function (err, result, fields) {
          if (err) throw err;
              res.send(JSON.stringify(result));
          });
       }

       else if(req.body.fetch_individual_stock_details == 'fetch_individual_stock_details'){
          res.set('content-type', 'text/json');
          res.status(200);
          console.log("Connected in fetch_individual_stock_details!");
          var sql = `SELECT sl.stock_name, sh.* FROM stock_list sl INNER JOIN stock_history sh on sl.id = sh.stock_id where sh.stock_id = ${req.body.id} ORDER BY sh.datetime DESC`;
          con.query(sql, function (err, result, fields) {
              if (err) throw err;
              res.send(JSON.stringify(result));
          });

       }
       else{
          res.set('content-type', 'text/html');
          res.status(200);
          res.send('<h1>No Data</h1>');

       }
		// res.send('Hello, Express!');
	});



  app.post('/stock', function(req, res) {

    res.set('Access-Control-Allow-Origin', '*');
    console.log("params fetch_all_stock",req.body);

    if(req.body.add_stock == 'add_stock'){
      res.set('content-type', 'text/json');
      res.status(200);

      let error = 0;
      let json_response = {};
      json_response['error'] = {};
      console.log("request received",req.body.name,req.body.sqty,req.body.sprice);
      
      if(req.body.sname == '' || typeof(req.body.sname) == 'undefined')
      {
          json_response['error']['name'] = 'Name Should Not Be Emty';
          error = 1;
      }
      if(req.body.sqty == '' || typeof(req.body.sqty) == 'undefined')
      {
         json_response['error']['qty'] = 'Quantity Should Not Be Emty';
         error = 1;
      }
  
      if(req.body.sprice == '' || typeof(req.body.sprice) == 'undefined')
      {
         json_response['error']['price'] = 'Initial Price Should Not Be Emty';
         error = 1;
      }
  
     
  
      if(error == 1)
      {
        console.log("validation failed");
        res.send(JSON.stringify(json_response));
        
      }
      else
      {
        stock.add_stock(req.body.sname,req.body.sqty,req.body.sprice,function(output) { 
        console.log("response from add_stock function: ",output);
        res.send(JSON.stringify(output));
        });
      } 
     
   }
   else if(req.body.sell_stock == 'sell_stock'){
    res.set('content-type', 'text/json');
    res.status(200);

    let error = 0;
    let json_response = {};
    //json_response['error'] = {};


    console.log("request received",req.body.select_stock,req.body.select_user,req.body.sprice,req.body.asqty,req.body.sqty,req.body.tsqty);
    
    if(req.body.sqty == '' || typeof(req.body.sqty) == 'undefined')
    {
        json_response['error'] = 'Stock Quantity Should Not Be Emty';
        error = 1;
    }
    if(isNaN(req.body.sqty))
    {
       json_response['error'] = 'Quantity Should Not Be Emty';
       error = 1;
    }

   

   

    if(error == 1)
    {
      console.log("validation failed buy stock");
      res.send(JSON.stringify(json_response));
      
    }
    else
    {

      stock.sell_stock(req.body.select_stock,req.body.select_user,req.body.sqty,req.body.tsqty,req.body.sprice,function(output) { 
      console.log("response from buy_stock function:",output);
      res.send(JSON.stringify(output));
      });
    } 
   
 }   
 else if(req.body.buy_stock == 'buy_stock'){
   res.set('content-type', 'text/json');
   res.status(200);

   let error = 0;
   let json_response = {};
   //json_response['error'] = {};


   console.log("request received",req.body.select_stock,req.body.select_user,req.body.sprice,req.body.asqty,req.body.sqty,req.body.tsqty);
   
   if(req.body.sqty == '' || typeof(req.body.sqty) == 'undefined')
   {
       json_response['error'] = 'Stock Quantity Should Not Be Emty';
       error = 1;
   }
   if(isNaN(req.body.sqty))
   {
      json_response['error'] = 'Quantity Should Not Be Emty';
      error = 1;
   }

  

  

   if(error == 1)
   {
     console.log("validation failed buy stock");
     res.send(JSON.stringify(json_response));
     
   }
   else
   {

     stock.buy_stock(req.body.select_stock,req.body.select_user,req.body.sqty,req.body.tsqty,req.body.sprice,function(output) { 
     console.log("response from buy_stock function:",output);
     res.send(JSON.stringify(output));
     });
   } 
  
}
else{
      res.set('content-type', 'text/html');
      res.status(200);
      res.send('<h1>No Data</h1>');

   }
// res.send('Hello, Express!');
});

app.listen(5000, ()=> { console.log("listening on port 500, now server is running") });
// const server = http.createServer((req, res) => {
//     if(req.url === '/ajax'){
//         // res.writeHead(200, {'content-type': 'text/json'});
//         // res.write('<h1>Home Page</h1>');
//         // res.end();

//       //  res.writeHead(200, {'content-type': 'text/json'});
//       //  con.connect(function(err) {
//            // if (err) throw err;
//            console.log("query strings",req.query);

//            var output = {};
//             console.log("Connected!");
//             var sql = "select * from stock_list";
//             con.query(sql, function (err, result, fields) {
//                // con.end();
//               if (err) throw err;
//               console.log("result fetched",result);
//               output['stock'] = result;
//            //   res.writeHead(200, {'Content-Type': 'text/json'});
//              // res.write(result);
//              // res.end(JSON.stringify(result));
             
//             });
//         //  });

//         console.log("Connected 2!");
//         var sql = "select id,name from user";
//         con.query(sql, function (err, result, fields) {
//            // con.end();
//           if (err) throw err;
//           console.log("result fetched for user",result);
//           res.writeHead(200, {'Content-Type': 'text/json'});
//          // res.write(result);
//             output['user'] = result

//             console.log("outpuy",output);
//           res.end(JSON.stringify(output));
         
//         });

       
          
//     } else if(req.url === '/about'){
//         res.writeHead(200, {'content-type': 'text/html'});
//         res.write('<h1>About Page</h1>');
//         res.end();
//     } else if(req.url === '/contact'){
//         res.writeHead(200, {'content-type': 'text/html'});
//         res.write('<h1>Contact Page</h1>');
//         res.end();
//     } else {
//         res.writeHead(404, {'content-type': 'text/html'});
//         res.write('<h1>404, Resource Not Found <a href="/">Go Back Home</a></h1>');
//         res.end();
//     }
// })

// server.listen(5000, () => {
// 	console.log('Server listening at port 5000');
// })