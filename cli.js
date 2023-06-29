/*---------------------------------------------------------------------------------------------
 * CLI.JS
 *---------------------------------------------------------------------------------------------
 */
 process.env.UV_THREADPOOL_SIZE = require('os').cpus().length * 2

 require('dotenv').config({ path: `./.env` })

 global.HOST             = process.env.HOST
 global.PORT             = process.env.PORT             || 3000
 global.VERBOSE          = process.env.VERBOSE * 1      || 0
 global.DB_DOC_SIZE      = process.env.DB_DOC_SIZE * 1  || 1024
 global.DB_DRIVER        = process.env.DB_DRIVER        || "iostore"
 global.DB_NAME          = process.env.DB_NAME          || "core"
 global.DB_PK            = process.env.DB_PK            || "default"
 global.DB_KEY           = process.env.DB_KEY           || ""
 global.DB_ENDPOINT      = process.env.DB_ENDPOINT      || ""
 global.SESSION_DURATION = process.env.SESSION_DURATION || 24 * 60
 global.ROOT             = __dirname + '/src/'


 const
 md5  = require('md5')
 , io = require('./src/lib/utils/fio')
 , fText = require('./src/lib/utils/ftext')
 ;;

 global.KEY = io.read('/etc/keys/private.key')
 require('./src/lib/constants');

console.log()
console.log(fText.fill("", "-", process.stdout.columns))
console.log(`  ____ _     ___   __  __  ___  ____  _____\n / ___| |   |_ _| |  \\/  |/ _ \\|  _ \\| ____|\n| |   | |    | |  | |\\/| | | | | | | |  _|\n| |___| |___ | |  | |  | | |_| | |_| | |___\n \\____|_____|___| |_|  |_|\\___/|____/|_____|\n\n`);
console.log(fText.fill("", "-", process.stdout.columns))
console.log(
    ETerminalColors.BOLD + ' ENV VARS: \n   ' + ETerminalColors.BOLD_OFF
    + io.read("../.env")
        .trim()
        .split(/\n/g)
        .filter(line => line.split('#')[0])
        .map(line => ETerminalColors.FT_BLUE + line.replace('=', ETerminalColors.FT_BLACK+'='+ETerminalColors.BOLD + ETerminalColors.FT_WHITE) + ETerminalColors.BOLD_OFF + ETerminalColors.RESET)
        .join("\n   ")
);
console.log(fText.fill("", "-", process.stdout.columns))
console.log(ETerminalColors.RESET)

if(true){
    const
    argv = process.argv.slice(2)
    , classname = argv.splice(0, 1)[0]
    , action    = argv.splice(0, 1)[0] || 'init'
    ;;

    let found = false ;;

    [ EPaths.CONTROLLERS, EPaths.APP, EPaths.ENTITIES, '' ].forEach(prefix => {
        if(found) return;
        const fullpath = prefix + classname + '.js';
        if(io.exists(fullpath)) {
            found = true
            const tmp = require(prefix + classname) ;;
            try{
                const a = tmp[action]({ argv });
                if(a) Promise.resolve(a).then(console.log)
            } catch(e){
                console.error(`app`, `error`, classname + '::' + action + '(' + argv.join(',') + ')' + e.toString())
                if(VERBOSE>2) console.trace(e)
            }
        }
    })
}