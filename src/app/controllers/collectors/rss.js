/*---------------------------------------------------------------------------------------------
 * RSS Collector
 *--------------------------------------------------------------------------------------------*/
const
fdate       = require('../../../lib/utils/fdate')
, fcache    = require('../../../lib/utils/fcache')
, initiator = require('../../interfaces/initiator')
, rss       = require('../../../lib/entities/rss')
, fragment  = require('../../../lib/entities/fragment')
, rssparser = new (require('rss-parser'))()
, rsscache  = fcache.load('rss')
, itemcache = fcache.load('items')
;;

module.exports = class Rss extends initiator {

    static async init() {

        console.log(fdate.as(), 'RssCollector > Initialization')

        const
        fragmentdb = await fragment.pipe()
        , iter = await rss.iterator({ order: [ 'last_execution_', 'asc' ] })
        ;;

        async function * run() {
            while(true) {
                const res = await iter.next() ;;
                if(res?.value?.items?.length) for(const item of res.value.items) yield item
                if(res?.done) break
            }
        }
        const item = await run() ;;
        while(true) {
            const res = await item.next() ;;
            if(res?.value) {
                const url = res.value.url() ;;
                let req = rsscache.get(url);;
                if(!req) try { req = await (await fetch(url, { "method": "GET" })).text() } catch(e) {}
                if(req) {
                    rsscache.set(url, req)
                    let meta ;;
                    try { meta = await rssparser.parseString(req) } catch(e) { res.value.fails_ = (res.value.fails_||0) + 1  }
                    if(meta?.items?.length) for(const feed of meta.items) {
                        const
                        pub_date = fdate.guess((feed.isoDate || feed.pubDate || feed.title)?.trim())
                        , item = fragment.cast({
                            link_       : (feed.link || feed.guid).replace(/\s+/gui, '')?.trim()
                            , data_     : feed
                            , source_   : res.value.id
                            , context_  : res.value.context_
                            , pub_date_ : pub_date ? pub_date.time() : 0
                            , original_pub_date_: feed.isoDate || feed.pubDate
                        })
                        ;;
                        item.id_builder()
                        if(!itemcache.get(item.id)) {
                            if(await fragmentdb.save(item)) {
                                itemcache.set(item.id, true)
                                console.log(fdate.as(), 'RssCollector PASS', res.value.name(), item.id)
                                res.value.fails_ = 0
                            } else console.error(fdate.as(), 'RssCollector FAIL', res.value.name(), item.id, 'validate:', item.validate())
                        }
                    }
                } else res.value.fails_ = (res.value.fails_||0) + 1
                res.value.last_execution_ = fdate.time()
                await res.value.save()
            }
            if(res?.done) break
        }

    }

}