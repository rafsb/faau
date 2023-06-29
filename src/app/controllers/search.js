/*---------------------------------------------------------------------------------------------
 * search
 *--------------------------------------------------------------------------------------------*/

const
fw          = require('../../lib/fw')
, initiator = require('../interfaces/initiator')
, fobj      = require('../../lib/utils/fobject')
, text      = require('../../lib/utils/ftext')
, date      = require('../../lib/utils/fdate')
, fcache    = require('../../lib/utils/fcache')
, io        = require('../../lib/utils/fio')
, axios     = require(`axios`)
, cheerio   = require('cheerio')
, md5       = require(`md5`)
, rss       = new (require('rss-parser'))()
;;

/**
 * GoogleNews/Bing -> Search class
 */
module.exports = class search extends initiator {

    static GOOGLE_URI = text.cast("https://news.google.com/rss/search?q={{query}}&hl=pt-BR&gl=BR&ceid=BR:pt-419")
    static BING_URI = text.cast("https://api.bing.microsoft.com/v7.0/search/?q={{query}}&count={{count}}&offset={{offset}}")

    static async simplify_page(link, tags) {
        tags = tags || [
            "head", "header", "footer", "menu", "nav", "iframe", "img", "svg", "script", "noscript"
            , "style", "form", "input", "select", "textarea", "button"
        ]
        let res ;;
        if(link) {
            try {
                const $ = cheerio.load((await (await fetch(link)).text()).replace('>', '> ').replace(/<[\/]{0,1}br[\s]{0,4}[\/]{0,1}>/gui, " .<br/>\n ")) ;;
                $(tags.join(',')).each((_,e) => $(e).remove())
                res = $("body").text().replace(/(\\n|\\t|\n|\t|\s)+/g, ` `).trim()
            } catch(e) {
                if(VERBOSE>2) console.trace(e)
            }
        }
        return res
    }

    static async google(conf) {

        let log = conf?.log ? conf.log : (VERBOSE > 2 ? console.log : null) ;;

        log&&log('$gauge{{0}}')

        if(typeof conf == 'string') conf = { q: conf }
        const q = conf.q || conf.params[0] ;;

        let res = { } ;;

        if(q) {
            log&&log('searchin on google: ' + q)

            const cache_name = `google-${md5(q)}` ;;
            let req, query, meta, items = [], cache = conf.nocache ? false : fcache.get(cache_name) ;;

            if(cache) {
                log&&log('cache found for: ' + cache_name)
                log&&log('$gauge{{1}}')
                return cache
            }

            try {
                query = search.GOOGLE_URI.prepare({ query: encodeURI(q) })
                req = await (await fetch(query, { "method": "GET" })).text()
                meta = await rss.parseString(req)
                items = meta?.items?.slice() || []
                delete meta.items
            } catch(e) {}

            log&&log('fetching & simplifing pages: ')

            for(let i in items) {
                try {
                    const
                    link = (await (await fetch(items[i].link)).text()).match(/data-n-au=['"`](.*?)['"`]/m)[1]
                    , cache = fcache.get(`link-${md5(link)}`)
                    ;;
                    log&&log('-> ' + link)
                    items[i].document = cache ? cache : { content: await search.simplify_page(link), link }
                    fcache.set(`link-${md5(link)}`, items[i].document, 1000 * 60 * 60 * 24 * 7)
                } catch(e) {}
                log&&log(`$gauge{{${i/(items.length-1)}}}`)
            }
            res = fobj.blend({}, res, { query, items, meta, q })
            fcache.set(cache_name, res, 1000 * 60 * 60 * 24)
        }

        log&&log('$gauge{{1}}')

        return res
    }

    static async bing(conf) {

        let log = conf?.log ? conf.log : (VERBOSE > 2 ? console.log : null) ;;

        log&&log('$gauge{{0}}')

        if(typeof conf == 'string') conf = { q: conf }
        const q = conf.q || conf.params[0] ;;

        let res = {} ;;

        if(q) {
            log&&log('searchin on bing: ' + q)

            const cache_name = `bing-${md5(q)}` ;;
            let req, query, meta, items = [], cache = conf.nocache ? false : fcache.get(cache_name) ;;

            if(cache) {
                log&&log('cache found for: ' + cache_name)
                log&&log('$gauge{{1}}')
                return cache
            }

            fobj.blend(res, { count: 10, depth: 2, gauge: false }, typeof conf == 'object' ? conf : {}, { q, items: [] }) ;;

            async function bing_fetch(offset) {
                const
                uri = search.BING_URI.prepare({ query: encodeURIComponent(q), count: res.count, offset })
                , cache_name = `link-${md5(uri)}`
                , req = fcache.get(cache_name) || await (await fetch(uri, {
                    method: 'GET'
                    , headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_SECRET }
                })).json()
                ;;

                if(req.errors && req.errors.length) return 0

                fcache.set(cache_name, req, 1000 * 60 * 60 * 24 * 7)

                req?.webPages?.value?.forEach(element => res.items.push(element))

                log&&log(`$gauge{{${offset/(res.count*res.depth)}}}`)

                return res.items.length
            }


            for(let i=0;i<res.depth;i++) {
                if(!(await bing_fetch(i*res.count))) continue
                await fw.delay(1100)
            }

            fcache.set(`bing-${md5(q)}`, res, 1000 * 60 * 60 * 24)
        }

        log&&log(`$gauge{{1}}`)

        return res

    }

}