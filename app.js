const express = require("express");
const port = 420;
const app = express();
const authRoute = require("./auth/usercontroller");

app.listen(port, () => {
  console.log(`it's running on http://localhost:${port}`);
});

app.use(express.json());

app.use("/auth", authRoute);
