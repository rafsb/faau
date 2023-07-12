/*---------------------------------------------------------------------------------------------
 * fstore
 *--------------------------------------------------------------------------------------------*/

const
io    = require("../utils/fio")
, date  = require("../utils/fdate")
;;

class fstore {

    static db_name = global.DB_NAME || `store_db`

    static load(name){
        return new fstore(name)
    }

    static cast(name) {
        return new fstore(name)
    }

    static log() {
        if(VERBOSE) console.log( ... arguments)
    }

    constructor(name){
        this.load(name ? name : fstore.db_name)
    }

    save(fn) {
        try {
            const save = io.jin("../var/db/" + this.db_name, this.db) ;;
            if(fn) fn(null, save)
        } catch(e) {
            if(fn) fn(e, null)
            if(VERBOSE>2) console.trace(e)
        }
    }

    load(db_name) {
        if(db_name) this.db_name = db_name
        if(!io.exists("../var/db/" + this.db_name)) io.jin("../var/db/" + this.db_name, { ts: date.time(), collection: {}, options: this.options||{} });
        this.db = io.jout("../var/db/" + this.db_name) ;;
        return this
    }

    createdb(db_name) {
        return this.load(db_name)
    }

    changedb(db_name) {
        if(db_name) this.load(db_name)
        return this
    }

    persist(name) {
        if(name) this.db_name = name
        return this.save()
    }

    log() {
        if(VERBOSE) console.log.apply(console, ... arguments);
    }

    all(fn) {
        const all = this.db.collection ;;
        if (!fn) return all
        try { fn(null, all) } catch(e){ fn(e, null) }
    }

    set(id, data, fn, persist=true) {
        this.db.collection[id] = data
        if(persist) this.persist()
        if (fn) try{ fn(null, data) } catch(e) { fn(e, null) }
        else return this.db.collection[id]
    }

    touch(id, data, fn) {
        return this.set(id, data, fn)
    }

    get(id, fn) {
        id = this.db.collection[id] === undefined ? null : this.db.collection[id]
        if (!fn) return id
        try { fn(null, id) } catch(e) { fn(e, null) }
    }

    destroy(id, fn, persist=true) {
        try {
            delete this.db.collection[id];
            if(persist) this.persist()
            if(fn) fn(null, true)
        } catch(e) {
            if(fn) fn(e, false)
        }
    }

    length(fn) {
        const len = Object.keys(this.db.collection).length
        if(!fn) return len
        try { fn(null, len) } catch(e) { fn(e, null) }
    }

    clear(fn, persist = false) {
        this.db = { ts: date.time(), collection: {}, options: this.options||{} }
        if(persist) this.persist()
        if(fn) fn()
    }

    reload(options) {
        return new fstore(options)
    }

}

module.exports = fstore