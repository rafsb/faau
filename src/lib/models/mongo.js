/*---------------------------------------------------------------------------------------------
 * Mongo
 *--------------------------------------------------------------------------------------------*/

const
connectionString = "mongodb://kpmg-cosmosdb:o4g2JBTQ6VXRexWKTNzlBJCQOqQ7aB1NALgUlPbLJjqdy9TZOoREpRT81quyQaOvbG1xCtMohBbzvS0jGzsw4g%3D%3D@kpmg-cosmosdb.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@kpmg-cosmosdb@"
, mongoClient = require("mongodb").MongoClient;

class Mongo{

    static run(databse, command){
        mongoClient.connect(connectionString, function(e, db){
            if(e) throw e;
            const
            dbase = db.db(database) ;;
            dbase.runCommand(command)
        })
    }

    static databaseDrop(database, fn){
        mongoClient.connect(connectionString, function (e, db) {
            if(e) throw e;
            const
            dbase = db.db(database) ;;
            dbase.drop((e, pass) => {
                if(e) throw e;
                fn&&fn(pass)
            })
        })
    }

    static collectionDrop(database, collection, fn){
        mongoClient.connect(connectionString, function (e, db) {
            if(e) throw e;
            const
            dbase = db.db(database) ;;
            dbase.collection(collection, (e, coll) => {
                if(e) throw e;
                coll.drop((e, pass) => { fn&&fn(e, pass); db.close() })
            })
        })
    }

    static push(database, collection, record, fn){
        mongoClient.connect(connectionString, function (e, db) {
            if(e) throw e;
            const
            dbase = db.db(database) ;;
            dbase.collection(collection, (e, coll) => {
                //if(Array.isArray(record))
                coll.insertMany(Array.isArray(record) ? record : [record], (e, res) => { fn&&fn({ e: e, data: res}); db.close() })
                //else coll.insertOne(record, (e, res) => { fn&&fn({ e: e, data: res}); db.close() })
            })
        })
    }

    static drop(database, collection, record, fn){
        mongoClient.connect(connectionString, function (e, db) {
            if(e) throw e;
            const
            dbase = db.db(database) ;;
            dbase.collection(collection, (e, coll) => {
                coll.removeMany(record, (e, res) => { fn&&fn({ e: e, data: res}); db.close() })
            })
        })
    }

    static refresh(database, collection, ref, record, fn){
        mongoClient.connect(connectionString, function (e, db) {
            if(e) throw e;
            const
            dbase = db.db(database) ;;
            dbase.collection(collection, (e, coll) => {
                coll.updateMany(ref, { $set: record }, (e, res) => { fn&&fn({ e: e, data: res.result.nModified }); db.close() })
            })
        })
    }

    static seek(database, collection, record, cfg, fn){
        mongoClient.connect(connectionString, function (e, db) {
            if(e) throw e;
            const
            dbase = db.db(database) ;;
            dbase.collection(collection, (e, coll) => {
                coll.find(record).next().then(x => fn(x));
            })
        })
    }
};

class MCollection {
    database(db){ if(db) this.database_ = db; return this.database_ }

    collection(coll){ if(coll) this.collection_ = coll; return this.collection_ }

    check(){ return this.database()&&this.collection() }

    insert(rec, fn){
        this.check()&&Mongo.push(this.database(), this.collection(), rec, fn)
    }

    remove(rec, fn){
        this.check()&&Mongo.drop(this.database(), this.collection(), rec, fn)
    }

    update(ref, rec, fn){
        this.check()&&Mongo.refresh(this.database(), this.collection(), ref, rec, fn)
    }

    find(rec, cfg, fn){
        this.check()&&Mongo.seek(this.database(), this.collection(), rec, cfg, fn)
    }

    constructor(dbcoll){
        if(dbcoll && typeof dbcoll == "string"){
            const tmp = dbcoll.split("/") ;;
            this.database(tmp[0]);
            this.collection(tmp[1]);
        }
    }
}

module.exports = { Mongo: Mongo , MCollection: MCollection }