/*---------------------------------------------------------------------------------------------
 * RSS
 *--------------------------------------------------------------------------------------------*/
const
rss = require('../../lib/entities/rss')
;;

module.exports = class RssController {

    static async add(args) {

        const
        name_ = args.name ? args.name : args.argv[0]
        , url_ = args.url ? args.url : args.argv[1]
        ;;

        if(name_ && url_) {
            rss.cast({ name_, url_ }).save()
        } else console.error(new Date(),)

    }

}