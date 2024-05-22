//var mysql = require('mysql');
const mysql = require(`mysql-await`);
class Stock_Module {
    con = '';
    new_stock_price;
    constructor() {
        this.con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "react_node_demo",
            multipleStatements: true
        });
    }
    add_stock(sname, qty, price, callback) {
        console.log("add stock from module", sname, qty, pric);
        var sql = `insert into stock_list (stock_name,stock_qty,stock_price,valuation) values(' ${sname}',${qty},${price},${qty} * ${price})`;
        this.con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("stock aded", sname, qty, price, result);
            callback({ status: "Stock Added" });
        });
    }

    buy_stock(id, userid, qty, tsqty, price, callback) {

        var sql = `SELECT sl.stock_name,sl.stock_qty as total, sl.stock_qty - SUM(sh.qty) as remaining,COUNT(*) as count FROM stock_list sl INNER JOIN stock_history sh on sl.id = sh.stock_id where sh.stock_id = ${id}`;
        this.con.query(sql, function (err, result) {
            if (err) throw err;
            let count = result[0]['count'];
            let total = result[0]['total'];
            let remaining = result[0]['remaining'];
            console.log("count total remaing", count, total, remaining);
            //callback({status : "Stock Added"});

            this.new_stock_price = price + (qty / tsqty) * price;

            console.log("count total remaing newstockprice", count, total, remaining, this.new_stock_price);
            if (count > 0 && remaining >= qty) {

                console.log("in stock success");


                var sql = `update stock_list set stock_price = ${this.new_stock_price},valuation = ${tsqty * this.new_stock_price},available_qty = ${remaining - qty}  where id = ${id}`;
                console.log("update query buy stock", sql);
                this.con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("in buy stock update success");
                    var sql = `insert into stock_history (stock_id,user_id,qty,price_before,price_after) values ( ${id},${userid},${qty},${price},${this.new_stock_price}`;
                    //  console.log("insert query buy stock",sql);
                    this.con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("in buy stock insert success");
                        callback({ status: "Stock Purchased Successfully" });
                    });

                });



            } else if (count == 0) {

                console.log("in stock count 0 success");
                // $sql = "SELECT id,stock_name,stock_qty FROM stock_list where id = $id";
                // $result = $db_connect->query($sql);
                // $r = $result->fetch_assoc();
                // $stock_qty = $r['stock_qty'];
                // // echo "stock_qty".$stock_qty;
                // // exit;
                // if($stock_qty >= $qty)
                // {
                //     $result_stock_update = $db_connect->query("update stock_list set stock_price = $this->new_stock_price where id = $id");
                //     if ($result_stock_update) {
                //         $result_insert =  $db_connect->query("insert into stock_history (stock_id,user_id,qty,price_before,price_after) values (" . $id . "," . $userid . "," . $qty . "," . $price . "," . $this->new_stock_price . ")");
                //         $result_update = $db_connect->query("update stock_list set valuation = " . $tsqty * $this->new_stock_price . ", available_qty = " . $stock_qty - $qty . " where id = $id ");
                //         return "Stock Price Updated to :" . number_format($this->new_stock_price, 2);
                //     } else {
                //         return "Error While Updating Stock Price";
                //     }
                // }else
                // {
                //     return "Not Enought Quantity To Available For Buy";
                var sql = `SELECT id,stock_name,stock_qty FROM stock_list where id = ${id}`;
                console.log("select query buy stock count 0", sql);
                this.con.query(sql, function (err, result) {
                    if (err) throw err;
                    let stock_qty = result[0]['stock_qty'];
                    if (stock_qty >= qty) {
                        console.log("in count == 0 buy stock select success");
                        var sql = `update stock_list set stock_price = ${this.new_stock_price},valuation = ${tsqty * this.new_stock_price},available_qty = ${remaining - qty}  where id = ${id}`;
                        console.log("update query buy stock count 0", sql);
                        console.log("in count == 0 buy stock update success");
                        this.con.query(sql, function (err, result) {
                            if (err) throw err;

                            var sql = `insert into stock_history (stock_id,user_id,qty,price_before,price_after) values ( ${id},${userid},${qty},${price},${this.new_stock_price}`;
                            //   console.log("insert query buy stock count 0",sql);
                            this.con.query(sql, function (err, result) {
                                if (err) throw err;

                                console.log("in count == 0 buy stock insert success");
                                callback({ status: "Stock Purchased Successfully 2" });
                            });

                        });

                    }

                });

            }
            else if (count > 0 && qty > remaining) {

                console.log("Not Enought Quantity To Available For Buy");
                //return "Not Enought Quantity To Available For Buy";
                callback({ status: "Not Enought Quantity To Available For Buy" });
            }

            // callback({status : "Stock Added"});


        });





    }
}

const stock = new Stock_Module();

module.exports = stock;