/*---------------------------------------------------------------------------------------------
 * Cosmos
 *--------------------------------------------------------------------------------------------*/

const
START = true

// LIBS
, https     = require('https')
, Cosmos    = require('@azure/cosmos').CosmosClient
, fw        = require('../fw')
, fobject   = require('../utils/fobject')
, farray    = require('../utils/farray')
, fdate     = require('../utils/fdate')
, ftext     = require('../utils/ftext')

// MACROS
, CosmosDB      = conf => new Cosmos({
    endpoint    : conf && conf.endpoint ? conf.endpoint : DB_ENDPOINT
    , key       : conf && conf.key ? conf.key : DB_KEY
    , agent     : new https.Agent({ rejectUnauthorized: false })
    , primaryConnectionString: `AccountEndpoint=${conf && conf.endpoint ? conf.endpoint : DB_ENDPOINT};AccountKey=${conf && conf.key ? conf.key : DB_KEY}`
})

;;

module.exports = class Cosmos_Traits {

    client(){
        return this._CosmosClient
    }

    async item(item_id, pk) {
        try {
            if(!item_id) return Fail('Cosmos', 'item', 'item_id is required');
            const { resource: item } = await this.container.item(item_id, pk||null).read()
            return item;
        } catch(e) {
            console.error(new Date(), 'Cosmos', 'itemlist', e.toString());
            if(VERBOSE>3) console.trace(e);
            return farray.cast()
        }
    }

    async itemlist(item_ids, type=fobject) {
        try {
            if(!Array.isArray(item_ids)) item_ids = [item_ids];
            return await (await this.query(`SELECT * FROM c WHERE c.id IN ("${item_ids.join('","')}")`, type))
        } catch(e) {
            console.error(new Date(), 'Cosmos', 'itemlist', e.toString());
            if(VERBOSE>3) console.trace(e);
            return farray.cast()
        }d
    }

    async count(query){
        try {
            const { resources: res } = await this.container.items.query(query).fetchAll()
            return res && res[0] && res[0]['$1'] ? res[0]['$1'] : 0
        } catch(e) {
            console.error(new Date(), 'Cosmos', 'count', e.toString());
            if(VERBOSE>3) console.trace(e);
            return 0
        }

    }

    async query(q, type=fobject, cfg) {
        try {
            const { resources } = await this.container.items.query(q, cfg).fetchAll()
            return farray.cast(resources.map(i => type.cast(i)))
        } catch(e) {
            console.error(new Date(), 'Cosmos', 'query', e.toString());
            if(VERBOSE>3) console.trace(e);
            return farray.cast()
        }
    }

    async save(item, tryes=3) {
        try{
            if(!item||!tryes) return false;
            if(!this.container) return console.warn('Cosmos', 'save', 'no container given');
            const date = fdate.cast() ;;
            item.modified_ = date.time()
            item = (await this.container.items.upsert(fobject.blend({
                id: item.id || fw.nuid()
                , created_: date.time()
                , created_str_ : date.as()
            }, item))).resource;
            return item || false
        } catch(e) {
            console.error(new Date(), 'Cosmos', 'save', e.toString());
            if(VERBOSE>2) console.trace(e);
            const me = this ;;
            return new Promise(pass => {
                console.log(`Cosmos`, `save`, `retrying, ${tryes} tryes left for ${item.id}`);
                setTimeout(async _ => pass(await me.save(item, --tryes)), DB_WAIT_TIME)
            })
        }
    }

    async bulk(items, counter=-1){

        const
        me = this
        , now = new fdate()
        ;;

        var ret = new farray(), counter = counter==-1 ? DB_N_TRYIES : counter ;;

        if(DB_LOCK >= DB_N_PROCESS) {
            if(counter) return new Promise(pass => setTimeout(async _ => pass(await me.bulk(items, counter-1)), DB_WAIT_TIME));
            else return Fail(`Cosmos`, `bulk`, `max time exeeded`)
        }

        try {
            DB_LOCK++;
            for(let i=0; i<items.length; i++) {
                const tmp = await this.save(items[i]) ;;
                ret[i] = tmp
            }
            DB_LOCK = Math.max(0, DB_LOCK-1);
        } catch(e) {
            DB_LOCK = Math.max(0, DB_LOCK-1);
            if(VERBOSE>3) console.trace(e);
        }

        return ret
    }

    async list_conteiners() {
        try {
            const { resources } = await this.database.containers.readAll().fetchAll() ;;
            return farray.cast(resources)
        } catch(e) {
            console.error(new Date(), 'Cosmos', 'list_containers', e.toString());
            if(VERBOSE>3) console.trace(e);
            return farray.cast()
        }
    }

    async * iterator(query='SELECT * FROM c', cls=fobject) {

        if(!query) query = 'SELECT * FROM c'

        const cfg = { } ;;

        do {
            const res = await this.container.items.query(query, cfg).fetchNext() ;;
            cfg.continuationToken = res.continuationToken
            cfg.hasMoreResults = res.hasMoreResults
            yield { items: res?.resources?.map(item => cls.cast(item)) || [], nextToken: Buffer.from(ftext.encrypt(JSON.stringify(cfg)), 'utf8').toString('base64') }
        } while(cfg.hasMoreResults)

    }

    static cast(obj){
        const o = new Cosmos_Traits() ;;
        for(let i in obj) o[i] = obj[i];
        return o
    }


    static async load(conf) {

        try{

            if(typeof conf == 'string') conf = { container: conf };

            const
            _CosmosClient   = CosmosDB(conf)
            , _DatabaseID   = conf?.db        || DB_NAME
            , _ContainerID  = conf?.container || DB_TABLE
            , _PartitionKey = conf?.pk        || DB_PK
            ;;

            const
            database = (await _CosmosClient.databases.createIfNotExists({ id: _DatabaseID })).resource
            , container = (await _CosmosClient.database(database.id).containers.createIfNotExists({
                id: _ContainerID
                , partitionKey: (_PartitionKey[0] == `/` ? `` : `/`) + _PartitionKey
            })).resource
            , res = {
                _DatabaseID
                , _ContainerID
                , _PartitionKey
                , _CosmosClient
                , database:     _CosmosClient.database(database.id)
                , container:    _CosmosClient.database(database.id).container(container.id)
            }
            ;;

            return Cosmos_Traits.cast(res)

        } catch(e) {
            console.error(new Date(), `Cosmos`, `load`, e.toString());
            if(VERBOSE>3) console.trace(e);
            DB_LOCK = 0
        }
    }


}