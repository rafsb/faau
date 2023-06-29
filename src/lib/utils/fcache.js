/*---------------------------------------------------------------------------------------------
 * fCache
 *--------------------------------------------------------------------------------------------*/
const
iostore   = require('../models/fstore')
, date    = require('./fdate')
;;

/**
 *
 */

module.exports = class fCache {

    getObj(name) {
        let res ;;
        const cache = this.db.get(name) ;;
        if(cache) {
            if(date.time() < cache.expires) res = cache
            else this.db.destroy(name, null, true)
        }
        return res
    }

    get(name) {
        return this.getObj(name)?.data || null
    }

    set(name, data, expires = 1000 * 60 * 60 * 24) {
        const now = date.time() ;;
        return this.db.touch(name, { expires: now + expires * 1, ts: now, data })
    }

    all(){
        const all = this.db.all()
        return Object.keys(all).map(k => {
            let res = all[k] ;;
            res.id = k
            if(date.time() > res.expires) {
                this.db.destroy(name, null, true)
                res = null
            }
            return res
        }).filter(i => i)
    }

    clear() {
        const all = this.db.all() ;;
        Object.keys(all).forEach(key => {
            if(date.time() >= all[key].expires) this.db.destroy(key, null, false)
        })
        this.db.save()
    }

    destroy(id, fn) {
        return this.db.destroy(id, fn, true)
    }

    clear_all() {
        return this.db.clear(null, true)
    }

    constructor(dbname) {
        this.db = iostore.cast(dbname)
    }

    static cast(name=`cache`) {
        return new fCache(name)
    }

    static load(name=`cache`) {
        return new fCache(name)
    }

}