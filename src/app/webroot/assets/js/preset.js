/*---------------------------------------------------------------------------------------------
 * Presets
 *--------------------------------------------------------------------------------------------*/

/*
 *
 * CONFIG
 *
 */
window.ANIMATION_LENGTH  = 400
window.AL 				 = ANIMATION_LENGTH
window.APP_DEFAULT_THEME = "light"

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
wsport = location.port
, ws = new WebSocket('ws'+(location.protocol == "https:" ? 's' : '')+'://' + location.hostname + ':' + wsport)
, socket_callbacks = { }
, sock_sender = async req => {
    if(ws.readyState === 1) ws.send(req)
    else setTimeout(_ => sock_sender(req), 128)
}
, sock = (path, data) => {
    const
    callback = typeof data == "function" ? data : ((data.callback ?  data.callback : data.cb) || null)
    , emitter = callback ? "fn" + callback.toString().hash() : null
    , payload = blend(data?.data||{}, { ts: fdate.time(), path, emitter, device: fw.device })
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
blend(fw, {
    components      : {}
    , caches         : {}
    , flags          : new Set()
    , locale         : fw.storage("locale") || fw.storage("locale", ELocales.BR)
    , theme          : fw.storage("theme")  || fw.storage("theme", APP_DEFAULT_THEME)
    , device         : fw.storage("device") || fw.storage("device", fw.nuid(32))
    , uat            : fw.storage("uat")
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
;; (async function(app) {

    /*** SPLASH ***/
    {
        bootloader.dependencies.add("splash")
        await fw.load("views/splash.htm")
    }

    /*** VERSION ***/
    {
        bootloader.dependencies.add("v")
        try {
            sock(`version`, res => {

                fw.v = res
                if(fw.storage('version') != fw.v) {

                    fw.warning('Atualizando versão de sistema...')
                    fw.clearStorage()
                    fw.storage('version', fw.v)
                    fw.storage('uat', fw.uat || "")
                    fw.storage('device', fw.device)
                    setTimeout(_ => location.reload(), AL * 4)

                } else {

                    // sock('auth/check', { data: { uat: fw.uat }, callback: res =>{
                    //     if(res.status) {
                            bootloader.dependencies.add("theme")
                            try {
                                sock(`theme`, {
                                    data: { theme: fw.theme }
                                    , cb: async res => {
                                        blend(fw.pallete, res)
                                        bootloader.loadComponents.fire()
                                        bootloader.onFinishLoading.add(_ => [ "background", "foreground" ].forEach(i => $(`.--${i}`).anime({ background: fw.pallete[i.toUpperCase()] })))
                                        bootloader.ready('theme')
                                    }
                                })
                            } catch(e) {
                                fw.warning("Não foi possível carregar o tema escolhido, usaremos o padrão do sistema!")
                                bootloader.loadComponents.fire()
                            }
                    //     } else fw.exec('login')
                    // } })

                    bootloader.ready("v")

                }

            })
        } catch(e) {
            fw.warning("Não foi possível verificar a versão atual do sistema, tentaremos trabalhar com as informações que temos!")
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

})(window.app)

/*
 * This pool will fire after all loaders are true
 */
bootloader.onFinishLoading.add(function() {

    /**
     * commonly used helpers, uncommnt to fire
    */
    fw.pragma = fw.initial_pragma


})

/*
 * a key pair value used for tooltips
 * tooltip() function must be fired to
 * make these hints work
 */
fw.hints = {
    // some_id: "A simple tootlip used as example"
}

/*
 * The system will boot with bootloader rules
 * comment to normal initialization without
 * possible system dependencies
 */
// initpool.add(_ => bootloader.loadComponents.fire())