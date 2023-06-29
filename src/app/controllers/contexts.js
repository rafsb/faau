/*---------------------------------------------------------------------------------------------
 * Context Controller
 *--------------------------------------------------------------------------------------------*/
const entity = lib("entities.context"), Interface = require('./interface') ;;
module.exports = class Controller extends Interface {

    static entity = entity
    static cached = true
    static cached_persistence_period = 24 // hours

}