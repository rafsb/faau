const
classname = require('../../lib/interfaces/classname')
, fcache = require('../../lib/utils/fcache')
, fobject = require('../../lib/utils/fobject')
, ftext = require('../../lib/utils/ftext')
, fdate = require('../../lib/utils/fdate')
;;

class InterfaceController extends classname {


    /** STATIC VARS **************************/
    /*****************************************/
    static entity                    = null  ;;
    static cached                    = false ;;
    static cached_persistence_period = 24    ;;
    /*****************************************/

    static async query(req) {
        const
        entity = this.entity
        , iter = await entity.iterator(req)
        , final = { items: [] }
        ;;

        req.maxSize = req.maxSize || 100
        let res ;;
        do {
            res = await iter.next()
            if(res.value?.items) final.items = final.items.concat(res.value.items.map(item => entity.cast(item)))
            final.nextToken = res.value?.nextToken || null
        } while (res.value && !res.done && final.items.length <= req.maxSize)
        return final
    }

    static async count(obj){

        let res = { found: 0 } ;;
        try { res = await this.entity.count(obj) } catch(e) {}
        return res

    }

    static async load(args) {
        let res = { status: 0 } ;;
        const
        id = args.id || args.argv[0]
        , pk = args.pk || args.argv[1] || 'default'
        ;;

        if (id) {
            res.data = await this.entity.load(id, pk)
            if(!res.data) res.data = await this.entity.load(id)
            res.status = res.data ? true : false
        }
        return res
    }

    static async item(args){
        return await this.load(args)
    }

    static async save(args) {
        let res = { status: 0 }
        if (args.item) {
            const
            src = this.entity.cast(args.item)
            , save = await src.save()
            ;;
            if (save) res = { status: 1, item: save }
        }
        return res
    }

    static async add(args){
        return await this.save(args)
    }

    static async rm(args) {
        let res = { status: 0 }
        const
        id = args.id || args.argv[0]
        , key = args.argv[1]
        ;;
        if (id) {
            const
            resource = await this.entity.drop(id, key || null)
            , status = true && !resource
            ;;
            res = { status, resource }
        }
        return res;
    }

    static async del(args){
        return await this.rm(args)
    }

    static async filter(args){
        return await this.query(args)
    }

    static async list(args) {
        const
        hash = Buffer.from(args.path + args.device, 'utf8').toString('base64')
        , cache = this.cached ? fcache.load(this.entity.classname().name+'-listing') : null
        ;;
        let res = this.cached ? cache.get(hash) : null ;;
        if(!res) {
            res = await this.query(args)
            cache.set(hash, res, 1000 * 60 * 60 * (this.cached_persistence_period || 1)) // hours
        }
        return res
    }

    static async ls(args) {
        return await this.list(fobject.blend({ filter: [ [ 'status_', EStatus.ACTIVE ] ]}, args))
    }

    static new(args) {
        let
        time = new fdate()
        , item = fobject.blend({
            id: md5(fdate.as())
            , created_: time.time()
            , modified_: time.time()
            , created_str_: time.as()
            , process_started_at_ : 0
            , fails_: 0
            , no_raw_article_filter_: 0
            , status: 1
        }
        , args?.item)
        , data
        ;;
        if(this.entity) {
            data = this.entity.cast(item)
            data.id_builder()
        } else data = fobject.cast(item)
        return {data, status: data? true:false}
    }

    static async init(args) {
        return await this.query(args)
    }

}

module.exports = InterfaceController ;;