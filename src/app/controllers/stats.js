/*---------------------------------------------------------------------------------------------
 * Stats
 *--------------------------------------------------------------------------------------------*/

const
date      = require('../../lib/utils/fdate')
, fstore    = require('../../lib/models/fstore')
;;

module.exports = class Stats {

    static async messages(args) {
        const
        { device, mail, message } = args
        , res = { status: 0 }
        ;;
        if(mail && message) {
            const db = fstore.load('messages') ;;
            db.set(date.as(), { device, mail, message })
            res.status = 1
        }
        return res
    }

    static async device(args) {
        const res = { status: 0 } ;;
        if(args.params[0]) {
            const
            db = fstore.load('devices')
            , dev = db.get(args.params[0]) || { count: 0, access: [] }
            ;;
            dev.count = dev.count + 1
            dev.access = dev.access.reverse().slice(0, 50).reverse()
            dev.access.push(date.as())
            db.set(args.params[0], dev)
            res.status = 1
        }
        return res
    }

}