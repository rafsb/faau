/*---------------------------------------------------------------------------------------------
 * RSS
 *--------------------------------------------------------------------------------------------*/
const
initiator = require('../interfaces/initiator')
, fragment = require('../../lib/entities/fragment')
, fcache = require('../../lib/utils/fcache').load('news')
;;

module.exports = class News extends initiator {

    static async init(req, maxItemCount=20) {
        let res = fcache.get(req.context);;
        if(!res?.status){
            res = { items: [], status: 0 }
            if(req.context) {
                const iter = await fragment.iterator({ filter: [[ 'context_', req.context ]], nextToken: req?.nextToken || null, order: [ 'pub_date_', 'DESC' ] }) ;;
                while(true) {
                    const tmp = await iter.next() ;;
                    tmp?.value?.items?.forEach(item => res.items.push(item))
                    res.nextToken = tmp?.value?.nextToken || null
                    if(tmp.done || res.items.length >= maxItemCount) break
                }
                if(res.items?.length) res.status = 1
            }
            fcache.set(req.context, res, 1000 * 60 * 60 * 4)
        }
        return res
    }

}