const mysql = require('mysql2/promise');
class Stock_Module {
  new_stock_price;
  add_stock(sname, qty, price, callback) {

    (async () => {
      console.log("add stock from module", sname, qty, price);

      const con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "react_node_demo",
      });
      console.log('connected!');

      const [insert_rows, insert_field] = await con.execute('insert into stock_list (stock_name,stock_qty,stock_price,valuation,available_qty) values(?,?,?,?,?)', [sname, qty, price, qty * price, qty]);

      callback({ status: "Stock Added" });

    })();
  }
  buy_stock(id, userid, qty, tsqty, price, callback) {

    (async () => {

      const con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "react_node_demo",
      });
      console.log('connected!');


      try {

        await con.beginTransaction();

        const [selectrows, selectfields] = await con.execute(
          'SELECT sl.stock_name,sl.stock_qty as total, sl.stock_qty - SUM(sh.qty) as remaining,COUNT(*) as count FROM stock_list sl INNER JOIN stock_history sh on sl.id = sh.stock_id where sh.stock_id = ?',
          [id]
        );

        console.log("result 1", selectrows[0]['stock_name'], selectrows[0]['total'], selectrows[0]['remaining'], selectrows[0]['count']);
        let count = selectrows[0]['count'];
        let total = selectrows[0]['total'];
        let remaining = selectrows[0]['remaining'];

        this.new_stock_price = price + (qty / tsqty) * price;

        console.log("count total remaing newstockprice", count, total, remaining, this.new_stock_price);
        if (count > 0 && remaining >= qty) {

          const [update_rows, updatefield_rows] = await con.execute('update stock_list set stock_price = ?,valuation = ?,available_qty = ? where id = ?', [this.new_stock_price, tsqty * this.new_stock_price, remaining - qty, id]);

          const [insert_rows, insert_field] = await con.execute('insert into stock_history (stock_id,user_id,qty,price_before,price_after) values (?,?,?,?,? )', [id, userid, qty, price, this.new_stock_price]);


          callback({ status: "Stock Purchased Successfully" });

        }
        else if (count == 0) {

          console.log("in stock count 0 success");

          const [selectrows, selectfields] = await this.con.execute('SELECT id,stock_name,stock_qty FROM stock_list where id = ?', [id]);

          let stock_qty = selectrows[0].stock_qty;
          console.log("select query buy stock count 0", selectrows[0].stock_qty);

          if (stock_qty >= qty) {
            console.log("in count == 0 buy stock select success");
            const [update_rows, updatefield_rows] = await con.execute('update stock_list set stock_price = ?,valuation = ?,available_qty = ? where id = ?', [this.new_stock_price, tsqty * this.new_stock_price, stock_qty - qty, id]);

            const [insert_rows, insert_field] = await con.execute('insert into stock_history (stock_id,user_id,qty,price_before,price_after) values (?,?,?,?,? )', [id, userid, qty, price, this.new_stock_price]);

            console.log("in count == 0 buy stock insert success");
            callback({ status: "Stock Purchased Successfully" });

          }
          else {

            callback({ status: "Not Enought Quantity To Available For Buy" });
          }


        }
        else if (count > 0 && qty > remaining) {

          console.log("Not Enought Quantity To Available For Buy");

          callback({ status: "Not Enought Quantity To Available For Buy" });
        }

        await con.commit();
        await con.end();

      }
      catch {
        await con.rollback();
        callback({ status: "Unable to Buy Stock" });

      }

    })();

  }

  sell_stock(id, userid, qty, tsqty, price, callback) {


    (async () => {


      const c = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "react_node_demo",
      });
      console.log('connected!');
      try {

        await c.beginTransaction();

        this.new_stock_price = price - (qty / tsqty) * price;

        const [selectrowall, selectfieldsall] = await c.execute(
          'SELECT sl.stock_name,sl.stock_qty as total,sl.stock_qty - SUM(sh.qty) as remaining,COUNT(*) as count FROM stock_list sl INNER JOIN stock_history sh on sl.id = sh.stock_id where sh.stock_id = ?',
          [id]
        );
        let remaining_all = Number(selectrowall[0]['remaining']);

        const [selectrows, selectfields] = await c.execute(
          'SELECT sl.stock_name,sl.stock_qty as total, SUM(sh.qty) as remaining,COUNT(*) as count FROM stock_list sl INNER JOIN stock_history sh on sl.id = sh.stock_id where sh.stock_id = ? and sh.user_id = ?',
          [id, userid]
        );

        console.log("result 1", selectrows[0]['stock_name'], selectrows[0]['total'], selectrows[0]['remaining'], selectrows[0]['count']);
        let count = Number(selectrows[0]['count']);
        let total = Number(selectrows[0]['total']);
        let remaining = Number(selectrows[0]['remaining']);
        let qty_num = Number(qty);


        console.log("count total remaing newstockprice in sell stock", count, total, remaining, this.new_stock_price, qty, remaining_all);

        if (count > 0 && remaining >= qty_num) {
          const [update_rows, updatefield_rows] = await c.execute('update stock_list set stock_price = ?,valuation = ?,available_qty = ? where id = ?', [this.new_stock_price, tsqty * this.new_stock_price, remaining_all + qty_num, id]);

          const [insert_rows, insert_field] = await c.execute('insert into stock_history (stock_id,user_id,qty,price_before,price_after) values (?,?,?,?,? )', [id, userid, -qty, price, this.new_stock_price]);

          callback({ status: "Stock Sale Successfully " });

        } else if (count == 0) {
          callback({ status: "You Don't Own The Stock For Selling" });
        }
        else if (count > 0 && qty > remaining) {
          callback({ status: "You Are Selling More Than You Own" });
        }

        await c.commit();
        await c.end();

      }
      catch {
        await c.rollback();
        callback({ status: "Unable to Sell Stock" });

      }
    })();

  }

}

const stock = new Stock_Module();

module.exports = stock;