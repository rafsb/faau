/*---------------------------------------------------------------------------------------------
 * Version
 *--------------------------------------------------------------------------------------------*/


const io = require("../../lib/utils/fio") ;;

module.exports = class Stream {

    static async messages(args) {
        if(args.params[0] == "6d7a29d7e2fdc98f2bcea55ef5b8db20") return { status:1, data: io.read("../var/db/messages") }
        return { status: 0 }
    }

}