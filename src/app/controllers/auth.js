/*---------------------------------------------------------------------------------------------
 * Auth
 *--------------------------------------------------------------------------------------------*/

const
initiator = require('../interfaces/initiator')
, user = require('../../lib/entities/user')
, ftext = require('../../lib/utils/ftext')
, fdate = require('../../lib/utils/fdate')

// userspace
, SESSION_DURATION = 1000 * 60 * 60 * 24 * 365

;;

/**
 *
 */
module.exports = class CAuth extends initiator {

    wrap(obj) {
        try { return Buffer.from(ftext.encrypt(JSON.stringify(obj)), 'utf8').toString('base64') } catch(e) {}
    }

    unwrap(token) {
        try { return JSON.parse(ftext.decrypt(Buffer.from(token, 'base64').toString('utf8'))) } catch(e) { }
    }

    static async pass(req) {
        let res = false ;;
        if(req.access_token) {
            try {
                const authobj = (new CAuth).unwrap(req.access_token) ;;
                if(authobj && authobj.userid && req.device == authobj.device) {
                    const u = await user.load(authobj.userid) ;;
                    if(u && authobj.ts + SESSION_DURATION > fdate.time() && req.access_level<=u.access_level_) res = true
                }
            } catch(e) {}
        }
        return res
    }

    static async check(req) {
        let res = { status: false } ;;
        if(req.access_token) {
            try {
                const authobj = (new CAuth).unwrap(req.access_token) ;;
                if(authobj.userid && req.device == authobj.device) {
                    const u = await user.load(authobj.userid) ;;
                    if(u && authobj.ts+SESSION_DURATION > fdate.time()) res.status = true
                }
            } catch(e) {}
        }
        return res
    }

    static async sign(req) {
        const res  = { status: false } ;;
        if(req.access_token) {
            res.status = CAuth.check(req)
            if(res.status) res.access_token = req.access_token
        } else {
            const u = (await user.filter([ [ 'user_', req.user ], [ 'pswd_', req.pswd ] ]))[0] ;;
            if(u) {
                res.access_token = (new CAuth).wrap({ userid: u.id, device: req.device, ts: fdate.time() })
                if(res.access_token) res.status = true
            }
        }
        return res
    }

}