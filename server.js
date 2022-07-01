const http = require('http');
const dotenv = require("dotenv");
const app = require('./app');
const mongoose  = require("mongoose");
const { loadPlanetsData } = require('./src/models/planets.model');
const {loadLaunchesData} = require('./src/models/launches.model')
const { mongoConnect } = require("./mongo");
// to use dotenv files
dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);


async function startServer() {

await mongoConnect();
await loadLaunchesData();
await loadPlanetsData();
 
server.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`);
});
}

startServer();