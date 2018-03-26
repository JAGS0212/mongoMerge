const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;

function mongoDb(dbUrl,dbName){
    this.db = null;
    var client = null;
    (async function(){
        client = await mongoClient.connect(dbUrl);
        this.db = client.db(dbName);
    }).call(this).catch((err)=>{
        console.log(err.message);
        process.exit(1);
    })

    function cleanUp(){
        console.log('MONGODB CLOSE CLIENT');
        client.close();
    }

    process.on('SIGINT',()=>{
        console.log('SIGINT');
        cleanUp();
        process.exit();
    });
    process.on('SIGTERM',()=>{
        console.log('SIGTERM');
        cleanUp();
        process.exit();
    });
    process.on('SIGHUP',()=>{
        console.log('SIGHUP');
        cleanUp();
        process.exit();
    });
    process.on('SIGBREAK',()=>{
        console.log('SIGBREAK');
        cleanUp();
        process.exit();
    });
}

mongoDb.prototype.isReady = function(){

           return new Promise((resolve,reject)=>{
                function hasMongoStarted(resolve,reject){
                    if(this.db !== null){
                        clearInterval(intervalHandler);
                        resolved = true;
                        resolve('mongoDb started!');
                    }
                }

                let intervalHandler = null;
                let hasMongoStartedPromise = new Promise((resolve,reject)=>{
                                        intervalHandler = setInterval(()=>{
                                            
                                            hasMongoStarted.call(this,resolve,reject);
                                        },100);
                });
                let timeOutPromise = new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        reject(new Error('mongoDb took too long to start!'));
                    },5000);
                });

                Promise.race([hasMongoStartedPromise,timeOutPromise]).then((msg)=>{
                    resolve(msg);
                }).catch((err)=>{
                    clearInterval(intervalHandler);
                    reject(err);
                });

            })
}

module.exports = mongoDb;