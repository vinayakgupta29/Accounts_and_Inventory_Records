const express = require("express");
const port = 420;
const app = express();

app.listen(port, () => {
  console.log(`it's running on http://localhost:${port}`);
});


