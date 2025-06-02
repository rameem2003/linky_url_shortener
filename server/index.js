import app from "./app.js";
let PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log({
    title: "Linky API",
    Owner: "Mahmood Hassan Rameem",
    developer: "ROL Studio Bangladesh",
    author: "Mahmood Hassan Rameem",
    server_ip: `http://localhost:${PORT}`,
  })
);
