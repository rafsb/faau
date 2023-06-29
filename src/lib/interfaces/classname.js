/*---------------------------------------------------------------------------------------------
 * Classname
 *--------------------------------------------------------------------------------------------*/

const
VERBOSE  = false
, IO = require('../utils/fio')
, FObject = require('../utils/fobject')
;;

module.exports = class Classname extends FObject {

    classname(){
        return { name: this.constructor.name, cls: this.constructor }
    }

    static classname(){

        const
        name = this.toString().replace(/\n+/gui, ' ').split(/\s+/gui)[1].trim()
        ;;

        var cls;
        [
            'lib/entities'
            , 'lib/models'
            , 'lib/utils'
            , 'lib/interfaces'
        ].forEach(prefix => {
            if(IO.exists(prefix + '/' + name.toLowerCase() + '.js')) cls = require('../../' + prefix + '/' + name.toLowerCase())
        })

        return { name, cls }
    }

}