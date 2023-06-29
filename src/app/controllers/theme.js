/*---------------------------------------------------------------------------------------------
 * Theme
 *--------------------------------------------------------------------------------------------*/

const io = require('../../lib/utils/fio') ;;

module.exports = class Theme {
    static init(args) {
        const path = EPaths.ASSETS + "themes/" + (args.theme||'dark') + ".theme";
        return io.jout(io.exists(path) ? path : EPaths.ASSETS + "themes/light.theme");
    }

}