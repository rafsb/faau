/*---------------------------------------------------------------------------------------------
 * Interface initiator
 *--------------------------------------------------------------------------------------------*/

const
{ fDate: date } = require('../../lib/fw')
;;

/**
 *
 *
 */
module.exports = class __initiator {

    /**
     * init
     */
    static async init() {
        return { ts: date.time() }
    }

}