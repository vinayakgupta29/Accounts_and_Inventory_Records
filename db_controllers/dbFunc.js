function createProductsTable() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const dateTimeNow = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const uniqueNum = Math.random().toString().substring(2);
  const productsTableName = `products_${dateTimeNow}_${uniqueNum}`;

  client.query(`CREATE TABLE ${productsTableName} (
      id serial PRIMARY KEY,
      product_name text NOT NULL,
      product_price numeric NOT NULL,
      product_category text NOT NULL,
      created_at timestamp NOT NULL
    )`);
}

function createOrdersTable() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const dateTimeNow = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const uniqueNum = Math.random().toString().substring(2);
  const orderssTableName = `ordss_${dateTimeNow}_${uniqueNum}`;
  client.query(
    `CREATE TABLE ${orderssTableName} (
        id serial PRIMARY KEY,
        customer_id integer NOT NULL REFERENCES customers (id),
        order_date date NOT NULL,
        order_number integer NOT NULL)`
  );
}

function addForeignKeyConstraint() {
  client.query(`ALTER TABLE orders ADD CONSTRAINT fk_customer_id
     FOREIGN KEY (customer_id) REFERENCES customers (id)`);
}
