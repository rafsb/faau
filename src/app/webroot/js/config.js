/*---------------------------------------------------------------------------------------------
 * CONFIG
 *--------------------------------------------------------------------------------------------*/

/*
 *
 * GLOBALS
 *
 */
window.VERBOSE            = true

/*
 * ENUMS
 */

;;

window.EPaths = Object.freeze({
    API             : "api/"
})

window.EPragmas = Object.freeze({
	WELCOME         : 0
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
bootloader.dependencies.add('home')
bootloader.loadComponents.add(async _ => {
    /**
     * HOME
    */
    fw.load((fw.is_mobile() ? 'm.' : '') + `home.htm`)
})

bootloader.loadComponents.add(async _ => {
    /**
     * PRAGMAS
    */
    [ "welcome", "ai", "bigdata", "gpt", "consulting", "dev", "contact" ].forEach(addr => {
        bootloader.dependencies.add(addr)
        fw.call(`pragmas/${fw.is_mobile() ? 'm.' : ''}${addr}.htm`).then(res => {
            fw.components[addr] = res.data.prepare()
            bootloader.ready(addr)
        })
    })
})

/**
 * LET THERE BE MAGIC
 */
fw.initial_pragma = EPragmas.WELCOME

const pragma_names = Object.keys(EPragmas).map(i => i.toLowerCase()) ;;
fw.onPragmaChange.add((pragma, args) => {

    if(pragma === fw.last_pragma) return

    $('.--big-picture').desappear(AL, true)

    if(pragma != EPragmas.WELCOME) $('.--self').at()?.desappear()
    else $('.--self').at()?.appear()

    const stage = $('main#stage')[0] ;;
    stage?.stop().anime({
        transform: `translateY(2em)`
        , filter: 'opacity(0)'
    }).then(stage => {
        const content = fw.components[pragma_names[pragma]].morph() ;;
        stage.empty().app(content).anime({
            transform: `translateY(0)`
            , filter: 'opacity(1)'
        })
        stage.evalute()
    })
})

/*
 * a key pair value used for tooltips
 * tooltip() function must be fired to
 * make these hints work
 */
blend(fw.hints, {
    // some_id: "A simple tootlip used as example"
})

const swip = new swipe($('#app').at()) ;;
swip.right(_ => {
    if(fw.current_pragma) fw.pragma = fw.current_pragma - 1
    else fw.pragma = Object.keys(EPragmas).length - 1
})
swip.left(_ => {
    if(fw.current_pragma == Object.keys(EPragmas).length - 1) fw.pragma = 0
    else fw.pragma = fw.current_pragma + 1
})
swip.fire()

$('#app')[0].on('mousemove', e => {
    maxis.x = e.clientX
    maxis.y = e.clientY
})

bootloader.loadComponents.fire()

window.onresize = _ => location.reload()