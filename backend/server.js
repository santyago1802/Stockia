const app = require("./app");

app.listen(process.env.PORT, () => {
  console.log(`Backend activo en http://localhost:${process.env.PORT}`);
});