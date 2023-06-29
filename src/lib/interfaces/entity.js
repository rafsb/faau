/*---------------------------------------------------------------------------------------------
 * Entity
 *--------------------------------------------------------------------------------------------*/
const
VERBOSE         = false
, Classname     = require(`./classname`)
, Cosmos        = require('../models/cosmos')
, IO            = require("../utils/fio")
, ftext         = require('../utils/ftext')
, fw            = require('../fw')
, fobject       = require('../utils/fobject')
, farray        = require('../utils/farray')
, fdate         = require('../utils/fdate')
, md5           = require('md5')
;;

class Entity extends Classname {

    uid(x){ if(x) this.id = x; return this.id }

    p(field, x){ if(x!==null&&x!==undefined) this[field] = x; return this[field] }

    import(src_name){
        if(IO.exists(src_name)){
            const me = this ;;
            IO.jout(src_name).each(src => me[src.key] = src.value)
            src_name          = src_name.split('/');
            this.source_name_ = src_name[src_name.length - 1].replace(/(.json\b)|(.js\b)/gi, '')
            this.status_      = this.status_ || EStatus.NOT_SET
            this.id_builder()
            return this
        }
        console.warn(this.classname().name, 'import', 'path not found: ' + src_name);
        return false
    }

    static import(src_name) {
        return this.classname().cls.cast().import(src_name)
    }

    static open(path) {
        return this.classname().cls.cast(IO.jout(path))
    }

    toObject() {
        return { ...this }
    }

    export(path) {
        const obj = { ...this } ;;
        if(path) IO.jin(path, obj);
        return obj
    }

    static export(src_name) {
        return this.classname().cls.cast().export(src_name)
    }

    mime(){
        return new this.constructor(this.export(null))
    }

    set(key, value){
        (key && value) && (this[key] = value)
        return this
    }

    cast(obj){
        return new this.constructor(obj)
    }

    // @override
    validate(){ return true }

    dbconf(conf){

        conf = conf || {};

        const
        classname = conf && conf.classname ? { name: conf.classname, cls: eval(conf.classname) } : this.classname()
        ;;

        return fobject.blend({
            db          : DB_NAME
            , container : `${classname.name}`
            , pk        : 'pk' // classname.cls.cast().pk_ || DB_PK
            , key       : DB_KEY
            , endpoint  : DB_ENDPOINT
        }, conf||{})
    }

    id_builder(){
        if(!this.id) this.id = md5(this.name_ || fdate.as())
    }

    constructor(obj={}, pk=null) {
        const date = fdate.cast() ;;
        super(fobject.blend({
            status_         : EStatus.ACTIVE
            , created_      : date.time()
            , created_str_  : date.as()
            , modified_     : date.time()
            , pk            : pk || DB_PK
        }, obj))
        if(!this.id) this.id_builder();
    }

    async save(args) {
        try {

            this.id_builder()

            const
            classname = args && args.classname ? { name: args.classname, cls: eval(args.classname) } : this.classname()
            , conn = classname.cls.dbconf(args)
            ;;

            var
            o = this.export(null)
            , ret = false
            ;;

            if(o && this.validate()) {
                delete o.modified_;
                const
                db = await Cosmos.load(conn)
                , date = new fdate()
                ;;
                try {
                    ret = await db.save(fobject.blend({
                        status_         : EStatus.ACTIVE
                        , created_      : date.getTime()
                        , created_str_  : date.as()
                        , modified_     : date.getTime()
                    }, o))
                } catch(e){
                    console.error(new Date(), classname.name, `save`, e.toString())
                    if(VERBOSE>2) console.trace(e)
                }
            }
            return ret ? this.classname().cls.cast(ret) : false
        } catch(e){
            if(VERBOSE>2) console.trace(e);
            return false
        }
    }

    /**
     * @deprecated
     * @param {*} obj
     * @returns
     */
    static instance(obj){
        return new this.constructor(obj)
    }

    static async pipe(conn){

        const
        classtype = this.classname()
        ;;

        conn = this.dbconf(fobject.blend(conn, { container: `${classtype.name}` }))
        return await Cosmos.load(conn)

    }

    static async conn(conn){
        conn = (this.classname().cls).dbconf(conn)
        return await Cosmos.load(conn)
    }

    static async drive(conn){
        conn = (this.classname().cls).dbconf(conn)
        return await Cosmos.load(conn)
    }

    static cast(obj) {
        return new (this.classname().cls)(obj)
    }

    static dbconf(conf){

        conf = conf || {};

        const
        classname = this.classname()
        ;;

        return fobject.blend({
            db          : DB_NAME
            , container : `${classname.name}`
            , pk        : DB_PK
            , key       : DB_KEY
            , endpoint  : DB_ENDPOINT
        }, conf)
    }

    /**
     * @deprecated
     * @param {*} filter
     * @param {*} order
     * @param {*} dir
     * @returns String
     */
    static build_select_query(filter, order='_ts', dir='DESC'){
        const
        query_string = new farray()
        ;;
        fobject.foreach(filter||{}, item => query_string.push(`c.${item.key}${Array.isArray(item.value)?' IN ("':'='}${item.key=='id'?`"${item.value}"`:(!isNaN(item.value)?item.value*1:(Array.isArray(item.value)?item.value.join('","')+'")':`"${item.value}"`)) }`));
        return `SELECT * FROM c${query_string.length ? ` WHERE ${ query_string.join(' AND ') }` : ``} ORDER BY c.${order} ${dir}`
    }

    static querify(params) {

        if(!params) params = {}

        const
        query_items = new farray()
        , filters = params.filters || params.filter || []
        ;;

        try{
            if(Array.isArray(filters)) filters.forEach(field => {
                if(Array.isArray(field)) {
                    const key = field[0] ;;
                    if(key) {
                        const value = field[1] ;;
                        if(undefined !== value && null !== value) {
                            const is_str =  field[1] == "" || isNaN(Array.isArray(value)?value[0]:value) ;;
                            const operator = field[2] ? field[2] : '='
                            switch(operator.toUpperCase().trim()) {
                                case('//'): {
                                    query_items.push(`REGEXMATCH(LOWER(c.${key}), "${ftext.rx(value.toLowerCase(), 4, '\\\\b', false)}")`)
                                    break
                                }
                                case('LIKE'||'NOT LIKE'||'!LIKE'): {
                                    query_items.push(`c.${key} ${operator} "%${value}%"`)
                                    break
                                }
                                default: {
                                    query_items.push(`c.${key}${operator}${is_str?'"':''}${value}${is_str?'"':''}`)
                                    break
                                }
                            }
                        }
                    }
                }
            }); else {
                try { console.error(new Date(), this.classname().name, 'querify', 'expected response is not an array: ' + JSON.stringify(filters)) }
                catch(e) {
                    console.error(new Date(), this.classname().name, 'querify', 'expected response is not as desired: ' + filters.toString())
                    console.error(new Date(), this.classname().name, 'querify', e.toString())
                    if(VERBOSE > 3) console.trace(e)
                }
            }
        } catch(e) {
            console.error(new Date(), this.classname().name, 'querify', e.toString())
            if(VERBOSE > 3) console.trace()
        }
        params.order = params?.order || []
        return `SELECT * FROM c${query_items.length ? ` WHERE ${ query_items.join(` ${params.junction||"AND"} `) }` : ``} ORDER BY c.${params.order[0]||'_ts'} ${params.order[1]||'DESC'}`
    }

    static async list(order, conn) {

        conn = this.dbconf(conn);

        const
        classtype = this.classname()
        ;;

        var items = [];
        const db = await Cosmos.load(conn) ;;
        if(db) return await db.iterator(Entity.querify({ order }), classtype.cls)
    }

    static async count(filter, conn) {

        const
        db = await Cosmos.load(this.dbconf(conn))
        , query = Entity.querify(filter).replace(`SELECT *`, `SELECT COUNT(1)`).split('ORDER')[0].trim()
        , res = db ? await db.count(query) : 0
        ;;
        return { found: res }

    }

    static async ls(order, dir, conn) {
        return await this.list(order, conn)
    }

    static async load(id, pk, conn) {

        conn = this.dbconf(conn);

        let item = null;

        const
        db = await Cosmos.load(conn)
        , filters = [ [ 'id', id, '='] ]
        ;;
        if(pk) filters.push([ 'pk', pk ]) ;
        if(db) item = (await db.query(Entity.querify({filters}), this.classname().cls))[0]
        else console.error(new Date(), this.classname().name, `load`, 'the database object is not present')
        return item
    }

    async drop(conn){

        console.warn(this.classname().name, 'drop', this.id);

        conn = this.dbconf(conn);
        var item = null;
        const db = await Cosmos.load(conn) ;;
        try {
            item = (await db.container.item(this.id, this.pk).delete()).resource && 1
        } catch(e) {
            console.error(new Date(), this.classname().name, `drop`, e.toString());
            if(VERBOSE>3) console.trace(e)
        }
        return item
    }

    static async drop(id, pk, conn) {
        return (await this.classname().cls.load(id, pk, conn))?.drop()
    }

    static async filter(filters, order, conn) {

        conn = this.dbconf(conn);
        const classtype = this.classname() ;;

        var items = [];
        try {
            const db = await Cosmos.load(conn) ;;
            if(!Array.isArray(filters)) filters = Object.keys(filters).map(k => [ k, filters[k], '='])
            items = await db.query(Entity.querify({ filters, order }), classtype.cls)
        } catch(e) {
            console.error(new Date(), classtype.name, "filter", e.toString())
            if(VERBOSE > 2) console.trace(e)
            items = []
        }
        return items
    }

    static async query(query, conn) {

        conn = this.dbconf(conn);
        const classtype = this.classname() ;;

        var items = [];
        try {
            const db = await Cosmos.load(conn) ;;
            items = await db.query(query, classtype.cls)
        } catch(e) {
            console.error(new Date(), classtype.name, "query", e.toString())
            if(VERBOSE > 2) console.trace(e)
            items = []
        }
        return items
    }

    static async list_by_status(status_=EStatus.ACTIVE, conn) {
        return await this.filter([ [ "status_", status_ ] ], null, conn)
    }

    static async list_actives(conn) {
        return await this.list_by_status(EStatus.ACTIVE, conn)
    }

    static async lsa(conn) {
        return await this.list_by_status(EStatus.ACTIVE, conn)
    }

    static async list_by_type(type_=ESourceTypes.NOT_SET, conn) {
        return await this.filter( [ [ "type_", type_ ] ], null, conn)
    }

    static async iterator(config={}, conn) {

        conn = this.dbconf(conn);
        const db = await Cosmos.load(conn) ;;

        return await db.iterator(
            config?.query || Entity.querify(config)
            , this.classname().cls
        )
    }

    static async bulk(items, conn) {

        conn = this.dbconf(conn);
        var classtype = this.classname(), res = 0;
        try {
            const
            db = await Cosmos.load(conn)
            ;;
            res = await db.bulk(items)
        } catch(e) {
            console.error(new Date(), this.classname().name, 'bulk', e.toString())
            if(VERBOSE>3) console.trace(e)
        }
        return res
    }

    // @override
    static async sync_items(items, conn) {
        conn = this.dbconf(conn) ;;
        var classtype = this.classname(), res = new farray();
        const db = await Cosmos.load(conn) ;;
        res = await db.itemlist(items, classtype.cls)
        return res
    }

}

module.exports = Entity