/*---------------------------------------------------------------------------------------------
 * Presets
 *--------------------------------------------------------------------------------------------*/

/*
 *
 * CONFIG
 *
 */
window.VERBOSE           = true
window.ANIMATION_LENGTH  = 400
window.AL 				 = ANIMATION_LENGTH
window.APP_DEFAULT_THEME = "light"
window.APP_NEEDS_LOGIN   = false

/*
 * ENUMS
 */

;;

window.ELocales = Object.freeze({
    BR              : "pt_br"
    , EN            : "en_us"
    , ES            : "es_es"
})

const
wsport = (location.port + "").slice(0, 2) + (location.port + "").slice(0, 2)
, ws = new WebSocket('wss://' + location.hostname + ':' + wsport)
, socket_callbacks = { }
, sock_sender = req => {
    if(ws.readyState === 1) ws.send(req)
    else setTimeout(_ => sock_sender(req), AL/2)
}
, sock = async (path, data) => {
    const
    callback = typeof data == "function" ? data : (data?.callback ? data.callback : (data?.cb ? data.cb : null))
    , emitter = callback ? "fn" + callback.toString().hash() : null
    , payload = blend(data?.data||{}, { ts: fdate.time(), path, emitter, device: app.device, token: app.token })
    ;;
    if(callback) socket_callbacks[emitter] = callback
    let req ;;
    try { req = JSON.stringify(payload) } catch(e) { if(VERBOSE) console.trace(e) }
    sock_sender(req)
}
;;

ws.onmessage = function(res) {
    try { res = JSON.parse(res.data) } catch(e) { console.warn(e); res = res.data }
    const data = typeof res == 'string' ? res : res.data ;;
    if(res.emitter && socket_callbacks[res.emitter]) Promise.resolve(socket_callbacks[res.emitter](data))
}

/**
 * LET THERE BE MAGIC
 */
blend(app, {
    components      : {}
    , caches         : {}
    , flags          : new Set()
    , locale         : app.storage("locale") || app.storage("locale", ELocales.BR)
    , theme          : app.storage("theme")  || app.storage("theme", APP_DEFAULT_THEME)
    , device         : app.storage("device") || app.storage("device", app.uuid())
    , uat            : app.storage("uat")
    , initial_pragma : null
    , onPragmaChange : new pool()
    , contextEvents  : {}
})

bootloader.dependencies = new Set([
    /*
     * Set the components to be loaded before
     * the system boot
     */
    "ready"
])

/*
 * These components are loaded at system boot times
 * the splash screen will let the system procede
 * after this execution queue and all bootloader`s
 * loaders are all done
 */
;; (async function() {

    /*** SPLASH ***/
    {
        bootloader.dependencies.add("splash")
        await app.load("views/splash.htm")
    }

    /*** VERSION ***/
    {
        bootloader.dependencies.add("v")
        try {
            sock(`version`, res => {

                app.v = res
                if(app.storage('version') != app.v) {

                    app.warning('Atualizando versão de sistema...')
                    app.clearStorage()
                    app.storage('version', app.v)
                    app.storage('uat', app.uat || "")
                    app.storage('device', app.device)
                    setTimeout(_ => location.reload(), AL * 4)

                } else {

                    function theme(callback) {
                        bootloader.dependencies.add("theme")
                        sock(`theme`, {
                            data: { theme: app.theme || APP_DEFAULT_THEME }
                            , cb: async res => {
                                blend(app.pallete, res)
                                callback && callback.apply()
                                bootloader.ready('theme')
                            }
                        })
                    }

                    if(APP_NEEDS_LOGIN) sock('users/check', { data: { uat: app.uat }, callback: res =>{
                        if(res.status) theme(_ => bootloader.loadComponents.fire())
                        else app.exec('login')
                    } })
                    else theme(_ => bootloader.loadComponents.fire())

                    bootloader.ready("v")

                }

            })
        } catch(e) {
            app.warning("Não foi possível verificar a versão atual do sistema, tentaremos trabalhar com as informações que temos!")
            if(VERBOSE) console.trace(e)
        }
    }

    /*** PRAGMAS ***/
    {
        fw.spy('pragma', value => {
            fw.last_pragma = fw.current_pragma
            fw.current_pragma = value
            fw.onPragmaChange.fire(value)
        })
    }

    setTimeout(_ => bootloader.ready("ready"), AL)

})()

/*
 * This pool will fire after all loaders are true
 */
bootloader.onFinishLoading.add(function() {

    /**
     * commonly used helpers, uncommnt to fire
    */
    app.pragma = app.initial_pragma

    sock('stats/device/'+app.device)


})

/*
 * a key pair value used for tooltips
 * tooltip() function must be fired to
 * make these hints work
 */
app.hints = {
    // some_id: "A simple tootlip used as example"
}

/*
 * The system will boot with bootloader rules
 * comment to normal initialization without
 * possible system dependencies
 */
// initpool.add(_ => bootloader.loadComponents.fire())