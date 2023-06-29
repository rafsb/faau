// GENERAL
global.APP_LOCALE       = process.env.APP_LOCALE    || "pt-br"
global.CACHE_VERSION    = process.env.CACHE_VERSION || `0.0-prod`
global.ENC_KEY          = Buffer.from(require('crypto').createHash('sha256').update(global.KEY).digest('hex'), "hex")
global.IV               = Buffer.from(require('md5')(ENC_KEY), "hex")

// MISC
global.NOT_SET          = 0;
global.UTF8             = global.utf8 = 'utf8';

// VERBOSE
global.VERBOSE_PERSISTANCE_IO = process.env.VERBOSE_PERSISTANCE_IO*1 || 0
global.VERBOSE_PERSISTANCE_THRESHOLD = process.env.VERBOSE_PERSISTANCE_THRESHOLD*1 || 2

// ENUMS
global.EPaths = Object.freeze({
    APP:                ROOT + 'app/'
    , ETC:              ROOT + 'etc/'
    , LIB:              ROOT + 'lib/'
    , MODELS:           ROOT + 'app/models/'
    , CONTROLLERS:      ROOT + 'app/controllers/'
    , WEBROOT:          ROOT + 'app/webroot/'
    , ASSETS:           ROOT + 'app/webroot/assets/'
    , VIEWS:            ROOT + 'app/webroot/views/'
    , ENTITIES:         ROOT + 'lib/entities/'
})

global.EStatus = Object.freeze({
    NOT_SET:        NOT_SET
    , ACTIVE:       1
    , INACTIVE:     2
    , UNDEFINED:    9
})

global.EHTTPRequestCodes = Object.freeze({
    100:    'Continue'
    , 101:  'Switching Protocols'
    , 102:  'Processing'
    , 103:  'Early Hints'
    , 200:  'OK'
    , 201:  'Created'
    , 202:  'Accepted'
    , 203:  'Non-Authoritative Information'
    , 204:  'No Content'
    , 205:  'Reset Content'
    , 206:  'Partial Content'
    , 207:  'Multi-Status'
    , 208:  'Already Reported'
    , 226:  'IM Used'
    , 300:  'Multiple Choices'
    , 301:  'Moved Permanently'
    , 302:  'Found'
    , 303:  'See Other'
    , 304:  'Not Modified'
    , 305:  'Use Proxy'
    , 307:  'Temporary Redirect'
    , 308:  'Permanent Redirect'
    , 400:  'Bad Request'
    , 401:  'Unauthorized'
    , 402:  'Payment Required'
    , 403:  'Forbidden'
    , 404:  'Not Found'
    , 405:  'Method Not Allowed'
    , 406:  'Not Acceptable'
    , 407:  'Proxy Authentication Required'
    , 408:  'Request Timeout'
    , 409:  'Conflict'
    , 410:  'Gone'
    , 411:  'Length Required'
    , 412:  'Precondition Failed'
    , 413:  'Payload Too Large'
    , 414:  'URI Too Long'
    , 415:  'Unsupported Media Type'
    , 416:  'Range Not Satisfiable'
    , 417:  'Expectation Failed'
    , 418:  'I`m a Teapot'
    , 421:  'Misdirected Request'
    , 422:  'Unprocessable Entity'
    , 423:  'Locked'
    , 424:  'Failed Dependency'
    , 425:  'Too Early'
    , 426:  'Upgrade Required'
    , 428:  'Precondition Required'
    , 429:  'Too Many Requests'
    , 431:  'Request Header Fields Too Large'
    , 451:  'Unavailable For Legal Reasons'
    , 500:  'Internal Server Error'
    , 501:  'Not Implemented'
    , 502:  'Bad Gateway'
    , 503:  'Service Unavailable'
    , 504:  'Gateway Timeout'
    , 505:  'HTTP Version Not Supported'
    , 506:  'Variant Also Negotiates'
    , 507:  'Insufficient Storage'
    , 508:  'Loop Detected'
    , 509:  'Bandwidth Limit Exceeded'
    , 510:  'Not Extended'
    , 511:  'Network Authentication Required'
})

global.ETerminalColors = Object.freeze({
    FT_BLACK:        "\033[1;30m"
    , BG_BLACK:      "\033[1;40m"
    , FT_RED:        "\033[1;31m"
    , BG_RED:        "\033[1;41m"
    , FT_GREEN:      "\033[1;32m"
    , BG_GREEN:      "\033[1;42m"
    , FT_YELLOW:     "\033[1;33m"
    , BG_YELLOW:     "\033[1;43m"
    , FT_BLUE:       "\033[1;34m"
    , BG_BLUE:       "\033[1;44m"
    , FT_MAGENTA:    "\033[1;35m"
    , BG_MAGENTA:    "\033[1;45m"
    , FT_CYAN:       "\033[1;36m"
    , BG_CYAN:       "\033[1;46m"
    , FT_WHITE:      "\033[1;37m"
    , BG_WHITE:      "\033[1;47m"
    , RESET:         "\033[1;0m"
    , BOLD:          "\033[1;1m"
    , UNDERLINE:     "\033[1;4m"
    , INVERSE:       "\033[1;7m"
    , BOLD_OFF:      "\033[1;21m"
    , UNDERLINE_OFF: "\033[1;24m"
    , INVERSE_OFF:   "\033[1;27m"
})

global.lib  = name => require(EPaths.LIB + name.replace(/\.js\b/gui, '').replace(/\.+/g, '/'))
global.dump = obj => console.log(obj) || process.exit()

// END
module.exports = null