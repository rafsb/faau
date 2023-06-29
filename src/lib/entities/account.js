/*---------------------------------------------------------------------------------------------
 * Account
 *--------------------------------------------------------------------------------------------*/

const
fw        = require('../fw')
, entity    = require('../interfaces/entity')
, { blend } = require('../utils/fobject')
, User = require('./user')
;;

module.exports = class Account extends entity {

    constructor(obj){
        super(blend({
            id                  : fw.uuid()
            , users_            : new Set()
            , users_quota_      : 3
            , robots_           : new Set()
            , robots_quota_     : 2
            , contexts_         : new Set()
        }, obj))
    }

    static async useradd(user, account) {
        const res = { status:0 } ;;
        if(user instanceof User && account instanceof Account) {
            let tmp = await user.save() ;;
            if(tmp) {
                account.users_.add(tmp.id)
                tmp = await account.save()
                if(tmp) res.status = 1
            }
        } else res.message = "given objects are not instances of User and/or Account classes (" + user.constructor.name + "/" + account.constructor.name + ")"
        return res
    }

    static async generate_root_account() {
        return await Account.useradd(User.cast({
            id: fw.md5('root')
            , user_: "root"
            , name_: "r_sb"
            , pswd_: 108698584
            , mail_: "r_sb@live.com"
            , alvl_: 9
        }), Account.cast({
            id: fw.md5('root')
            , contexts_: new Set([ '*' ])
            , users_quota_: Number.MAX_SAFE_INTEGER
            , robots_quota_ : Number.MAX_SAFE_INTEGER
        }))
    }

}