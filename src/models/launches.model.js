const axios = require('axios');

const launchesDatabase = require('../database/launches.mongo')
const planets = require('../database/planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100;


const launches = new Map();

//let latestFlightNumber = 100;


 const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";


async function populateLaunches() {
console.log(`Downloading launch data...`);
    
   
   const response = await axios.post(SPACEX_API_URL, {
     query: {},
     options: {
      pagination: false,
       populate: [
         {
           path: "rocket",
           select: {
             name: 1
           },
         },
         {
           path: "payloads",
           select: {
             customers: 1
           },
         },
       ],
     },
   });



   if(response.status !==200)
   {
    console.log(`Problem downloading launch data`);
    throw new Error(`Launch Data Download Failed`);
   }

   const launchDocs = response.data.docs;
   for (const launchDoc of launchDocs) {
     const payloads = launchDoc["payloads"];
     const customers = payloads.flatMap((payload) => {
       return payload["customers"];
     });

     const launch = {
       flightNumber: launchDoc["flight_number"],
       mission: launchDoc["name"],
       rocket: launchDoc["rocket"]["name"],
       launchDate: launchDoc["date_local"],
       upcoming: launchDoc["upcoming"],
       success: launchDoc["success"],
       customers,
     };

     console.log(`${launch.flightNumber}${launch.mission}`);
   
     await saveLaunch(launch);
   
    }
}



 async function loadLaunchesData() {
   
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if(firstLaunch){
    console.log(`Launch data already loaded`);
    
  }else{
    await populateLaunches();
  }
}
  


async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}
 

async function saveLaunch(launch){

//     const planet = await planets.findOne({
//         keplerName: launch.target,
//     });

// if(!planet){
//     throw new Error('No matching planet found');
// }

    await launchesDatabase.updateOne({
        flightNumber : launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

const launch  = {
    flightNumber: 100,
    mission:'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
}

launches.set(launch.flightNumber, launch);
saveLaunch(launch);



async function existsLaunchWithId(launchId){
    // return await launchesDatabase.findOne({
    //     flightNumber: launchId,
    // });

     return await findLaunch({
       flightNumber: launchId,
     });

  }

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber');
    // -         ->descending order
    //flightNumber = ascending order

    if(!latestLaunch){
return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    // return Array.from(launches.values());
    return await launchesDatabase.find({},{'_id':0,'__v':0,})
    .sort({ flightNumber : -1 })
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(launch) {
    
    const newFLightNumber = await getLatestFlightNumber()+1;

    const newLaunch = Object.assign(launch,{
        success: true,
        upcoming: true,
        customers: ['ISRO', 'NASA'],
        flightNumber: newFLightNumber,
    });

    await saveLaunch(newLaunch);
}

function addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(
        latestFlightNumber, 
        Object.assign(
            launch,{
                success:true,
                upcoming: true,
                customers:['ZTM','NASA'],
                flightNumber: latestFlightNumber,
        })
    );
}

async function abortLaunchById(launchId){

    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    },{
        upcoming: false,
        success: false,
    });

    return aborted.modifiedCount === 1;

    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    addNewLaunch,
    abortLaunchById,
    scheduleNewLaunch,
    loadLaunchesData
}