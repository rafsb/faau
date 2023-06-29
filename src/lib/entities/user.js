/*---------------------------------------------------------------------------------------------
 * User
 *--------------------------------------------------------------------------------------------*/

if(!global.EUserLevels) global.EUserLevels = Object.freeze({
    ANONIMOUS   : 0
    , SIGNED    : 1
    /* ... */
    , ADMIN     : 8
    , ROOT      : 9
})

const
md5 = require('md5')
, entity = require('../interfaces/entity')
, fobject = require('../utils/fobject')
;;

module.exports = class User extends entity {

    validate() { return this.user() && this.pswd() ? true : false }

    id_builder() {
        this.id = md5(this.user())
    }

    pass(alvl=EUserLevels.SIGNED) {
        return this.alvl() >= alvl
    }

    constructor(obj){
        super(fobject.blend({ user_:"", name_: "", pswd_: "", mail_: "", alvl_: 1 }, obj))
    }

}