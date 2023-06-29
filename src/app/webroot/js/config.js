/*---------------------------------------------------------------------------------------------
 * CONFIG
 *--------------------------------------------------------------------------------------------*/

/*
 *
 * GLOBALS
 *
 */
window.VERBOSE            = true
window.APP_DEFAULT_THEME  = "dark"

/*
 * ENUMS
 */

;;

window.EPaths = Object.freeze({
    API             : "api/"
})

window.EPragmas = Object.freeze({
	HOME            : 0
    , AI            : 1
    , BIGDATA       : 2
    , GPT           : 3
    , CONSULTING    : 4
    , DEV           : 5
    , CONTACT       : 6
})


/*
 * These components are loaded at system boot times
 * the splash screen will let the system procede
 * after this execution queue and all bootloader`s
 * loaders are all done
 */
bootloader.loadComponents.add(async _ => {
    /**
     *
     */
    [ "home", "ai", "bigdata", "gpt", "consulting", "dev", "contact" ].forEach(addr => {
    bootloader.dependencies.add(addr)
        app.call(`pragmas/${addr}.htm`).then(res => {
            app.components[addr] = res.data.prepare()
            bootloader.ready(addr)
        })
    })
})

/**
 * LET THERE BE MAGIC
 */
app.initial_pragma = EPragmas.GPT

const pragma_names = Object.keys(EPragmas).map(i => i.toLowerCase()) ;;
app.onPragmaChange.add((pragma, args) => {

    if(pragma == app.last_pragma) return


    $('.--big-picture').desappear(AL, true)

    if(pragma != EPragmas.HOME) $('.--self').at().desappear()
    else $('.--self').at().appear()

    const
    stage = $('main#stage')[0]
    , dir = pragma > app.last_pragma
    ;;
    stage.stop().anime({
        transform: `translateX(${dir ? "-4em" : "4em"})`
        , filter: 'opacity(0)'
    }).then(stage => stage.css({
        transform: `translateX(${dir ? "4em" : "-4em"})`
    }, stage => {
        const content = app.components[pragma_names[pragma]].morph() ;;
        stage.empty().app(content).anime({
            transform: `translateX(0)`
            , filter: 'opacity(1)'
        })
        stage.evalute()
    }))
})

/*
 * a key pair value used for tooltips
 * tooltip() function must be fired to
 * make these hints work
 */
blend(app.hints, {
    // some_id: "A simple tootlip used as example"
})