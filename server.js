//Includes
const mongoDb = require('./mongoDb.js');
const fs = require('fs');
const util = require('util');
const path  = require('path');


const dbUrl = 'mongodb://localhost:27017';

//Files
const customerData = path.join(__dirname,'m3-customer-data.json');
const customerDataAddress = path.join(__dirname,'m3-customer-address-data.json');

if(process.env.qty === undefined || isNaN(process.env.qty)){
    console.log('"qty" environment variable is undefined or is not a number. Please try again');
    process.exit(2);
}
const qty = parseInt(process.env.qty);

if(process.env.dbName === undefined){
    console.log('"dbName" environment variable is undefined. Please try again');
    process.exit(3);
}
const dbName = process.env.dbName;



async function main(){
    const mongoDbObj = new mongoDb(dbUrl,dbName);
    console.log(await mongoDbObj.isReady());
    
    const readDirPromise = util.promisify(fs.readFile);
    
    var files = await Promise.all([readDirPromise(customerData,{encoding:"utf8"}),readDirPromise(customerDataAddress,{encoding:"utf8"})]);
    let clients = JSON.parse(files[0]); //clients
    let extraInfo = JSON.parse(files[1]); //extraInfo
    
    const customersCollection = mongoDbObj.db.collection('customers');

    function mergeDocs(clients,extraInfo,qty){
        //qty: Integer represents the ammount of documents to return
        let output = [];
        for(var i=0; i < qty; i++){
            if(clients.length === 0)
                break;
            
            let client = clients.pop();
            let extra = extraInfo.pop();
            client.country = extra.country;
            client.city = extra.country;
            client.state = extra.state;
            client.phone = extra.phone;
            output.push(client);
        }
        return output;
    }

    var promises = [];
    let initialTime = new Date();
    while(clients.length > 0){
            let docs = mergeDocs(clients,extraInfo,qty);
            await customersCollection.insertMany(docs);
    }
    return "Elapsed time in miliseconds: " + (new Date() - initialTime) + 'ms';
}

main().then((val)=>{
    console.log(val);
    process.exit();
}).catch((err)=>{
    console.log(err);
    process.exit();
})




