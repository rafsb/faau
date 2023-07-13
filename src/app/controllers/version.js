/*---------------------------------------------------------------------------------------------
 * Version
 *--------------------------------------------------------------------------------------------*/

const md5 = require('md5') ;;

module.exports = class Version {

    static async init(args) {
        return VERSION
    }

    static async key(args) {
        if(args.params[0]) return md5(args.params[0])
        return ''
    }

}