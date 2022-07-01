const express = require("express");
const planetsRouter = require("./src/routes/planets/planets.router");
const cors = require("cors");
const morgan = require("morgan");
const launchesRouter = require("./src/routes/launches/launches.router");

const app = express();

// to read json passing through server
app.use(express.json());


app.use(cors({
    origin:"*",
}));

///////////////////////////////////////////////////////////////////////////////

//Cors Configuration - Start
// always use this to remove CORS Error

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
//Cors Configuration - End

//////////////////////////////////////////////////////////////////////////////////

app.use(morgan('combined'));

app.use('/planets',planetsRouter);
app.use('/launches',launchesRouter);

module.exports = app;
