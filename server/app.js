import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";
import { verifyAuthentication } from "./middlewares/auth-middleware.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());
app.use(verifyAuthentication);
app.set("view engine", "ejs");

// Route connect
app.use(router);

/**
 * For Welcome Route
 */
app.get("/", (req, res) => {
  res.status(200).send({
    title: "Linky API",
    Owner: "Mahmood Hassan Rameem",
    developer: "ROL Studio Bangladesh",
    author: "Mahmood Hassan Rameem",
  });
});

/**
 * For Error Route
 */
app.use((req, res, next) => {
  res.status(404).send({
    success: false,
    msg: "Invalid Route",
  });
});

export default app;
