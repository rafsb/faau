const
zlib = require('zlib')
, crypto = require('crypto')
, io = require('./fio')
;;

module.exports = class fText {

    static stopwords = Array.from(new Set(io.read(`etc/dicts/${process.env.APP_LOCALE}/stopwords.txt`).split(/\s+/gui)))

	static flex = [ 's', '(a|á|à|ã)s', '(e|é|ê)s', '(i|í)s', '(o|ó|ô|õ)s', '(u|ú)s'	]

    static phrase_boundaries = ".;?!|\n"

    rx(wrule=2, b="\\b", asrx=true, flags="guim"){

        const flex = fText.flex ;;

        const
        word_start = b //`(^|[ .,?!:;('>\`])`
        , midrule = ".{1," + wrule + "}"
        , replaced = this.value
            // , replaced = `([ .,?!:;(]{1,}` + w.trim()
            .replace(/[^-'0-9a-zÀ-ÿ| ]/gui, " ")
            .split('|').join(`(${flex.join('|')}){0,}${b})${midrule}|(${word_start}`)
            .replace(/\s+/giu, " ")
            .trim()
            .replace(/(a|á|à|ã)/giu, "(a|á|à|ã)")
            .replace(/(e|é|ê)/giu,	 "(e|é|ê)")
            .replace(/(i|í)/giu,	 "(i|í)")
            .replace(/(o|ó|ô|õ)/giu, "(o|ó|ô|õ)")
            .replace(/(u|ú)/giu,	 "(u|ú)")
            .replace(/(c|ç)/giu,	 "(c|ç)")
            .replace(/\s+/giu, `(${flex.join('|')}){0,}${b})${midrule}(`) + `(${flex.join('|')}){0,}${b}`
		;;
        return asrx ? new RegExp(`(${word_start}${replaced})`, flags) : `(${word_start}${replaced})`
    }

    clear() {
        return this.value.replace(/<(.|\n)*?>/g, ' ').replace(/[^-0-9a-zÀ-ÿ]/gui, ' ').replace(/\s+/gui, ' ').trim()
    }

    compress() {
        this.value = zlib.deflateSync(Buffer.from(this.value, 'utf-8').toString()).toString('hex')
        return this.value
    }

    decompress(){
        this.value = zlib.inflateSync(new Buffer.from(this.value, 'hex')).toString('utf-8');
        return this.value
    }

    encrypt() {
        const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV) ;;
        this.value = cipher.update(this.value, 'utf8', 'base64')
        this.value += cipher.final('base64')
        return this.value
    }

    decrypt() {
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV) ;;
        this.value = decipher.update(this.value, 'base64', 'utf8')
        this.value += decipher.final('utf8')
        return this.value
    }

    fill(c=' ', l=12, d=1) {
        let str = this.value ;;
        c = !c ? " " : c;
        d = d==0||d==null||d==undefined ? -1 : d;
        while((str).length < Math.abs(l)) str = (d<0?c:"")+str+(d>0?c:"");
        return str
    }

    json() {
        let res = null ;;
        try{ res = JSON.parse(this.value) } catch(e) { console.error(e) }
        return res
    }

    prepare(obj){
        let res = this.value ;;
        obj && Object.keys(obj).map(pattern => {
            let rgx = new RegExp("\\{\\{" + pattern + "\\}\\}", "guim") ;;
            res = res.replace(rgx, obj[pattern])
        })
        return res
    }

    sanitize(){
        return encodeURIComponent(this.value).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+')
    }

    sanitized_compare(w) {
        return this.rx().test(w.trim().replace(/\s+/gi, ' ')) ? true : false
    }

    summarize(conf){

        if(typeof conf == 'string') conf = { text: conf}

        if(conf?.text) this.value = conf.text
        if(conf?.maxTokens) this.maxTokens = conf.maxTokens
        if(conf?.sentenseThreshold) this.sentenseThreshold = conf.sentenseTheshold
        if(conf?.wordThreshold) this.wordThreshold = conf.wordThreshold

        const
        sentences = this.value.split(new RegExp("["+fText.phrase_boundaries+"]", "gui")).filter(sentense => sentense.split(/\s+/g).length > wordMinAvaiable)
        , freq = {}
        ;;

        io.jin('var/sentences.json', sentences)

        for (const sentence of sentences) {
            const words = sentence.split(/[^\w']/u) ;;
            for (const word of words) {
                const lword = word.toLowerCase() ;;
                if (!freq[lword]) freq[lword] = 0
                ++freq[lword]
            }
        }

        Object.keys(freq).forEach(word => {
            for(let stop of fText.stopwords) {
                if(!isNaN(word) || fText.sanitized_compare(word, stop)) {
                    freq[word] = 0
                    continue
                }
            }
        })

        io.jin('var/freq.json', freq)

        let
        sortedWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a])
        , summary = []
        ;;

        io.jin('var/sortedWords.json', sortedWords)

        for (const sentence of sentences) {
            const words = sentence.split(/[^\w']/u).filter(i => i) ;;
            const meta = [] ;;
            let sentenceScore = 0;
            for (const word of words) {
                const lword = word.toLowerCase();
                if (sortedWords.indexOf(lword) < wordThreshold) ++sentenceScore
                // sentenceScore += freq[lword] || 0
                if(freq[lword]) meta.push([ lword, freq[lword] ])
            }
            summary.push({ sentence: sentence.trim(), score: sentenceScore, meta })
        }

        let
        tmp = summary.sort((a, b) => b.score - a.score)
        , topSentences = []
        ;;

        let i = 0 ;;
        while(topSentences.map(t => t.sentence).join(' ').split(/\s+/g).length < ntokens && i < tmp.length) topSentences.push(tmp[i++])

        io.jin('var/summary.json', topSentences)

        topSentences.sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))

        return topSentences.map(s => s.sentence).join('.\n')
    }

    crop(colls=-1) {
        return colls > 0 ? this.value.slice(0, colls) : this.value
    }

    toString(encode='utf-8') {
        return this.value.toString(encode)
    }

    valueOf() {
        return this.value
    }

    constructor(value) {
        this.value              = value||""
        this.maxTokens          = 2048
        this.sentenseThreshold  = 10
        this.wordThreshold      = 10
    }

    static cast(str) { return new fText(str) }

    static rx(str, wrule, b, asrx, flags) {  return (new fText(str)).rx(wrule, b, asrx, flags) }

    static clear(str) { return (new fText(str)).clear() }

    static compress(str) { return  zlib.deflateSync(Buffer.from(str||'', 'utf-8').toString()).toString('hex') }

    static decompress(str) { return zlib.inflateSync(new Buffer.from(str||'', 'hex')).toString('utf-8') }

    static encrypt(str) {
        const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV) ;;
        str = cipher.update(str, 'utf8', 'base64')
        str += cipher.final('base64')
        return str
    }

    static  decrypt(str) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV) ;;
        str = decipher.update(str, 'base64', 'utf8')
        str += decipher.final('utf8')
        return str
    }

    static fill(str, char, len, dir) { return (new fText(str)).fill(char, len, dir) }

    static prepare(str, obj) { return (new fText(str)).prepare(obj) }

    static sanitize(str) { return (new fText(str)).sanitize() }

    static sanitized_compare(str1, str2) { return (new fText(str1)).sanitized_compare(str2) }

    static summarize(str, ns, wt) { return (new fText(str)).summarize(ns, wt) }

    static json(o) {
        let res = null ;;
        try{
            if(typeof o != "string") res = JSON.stringify(o, null, 4)
            else res = JSON.parse(o);
        } catch(e) { console.error(e); }
        return res;
    }

    static nerdify(n){
        n *= 1
        return n > 1000000000000 ? ((n / 1000000000000).toFixed(1))+"tri" : (
            n > 1000000000 ? ((n / 1000000000).toFixed(1))+"bi" : (
                n > 1000000 ? ((n / 1000000).toFixed(1))+"mi" : (
                    n > 1000 ? ((n / 1000).toFixed(1))+"k" : Math.ceil(n)
                )
            )
        )
    }

    static desnerdify(x){
        let
        n = Number(x.replace(/[^0-9\.]/g,'').replace(',','.'))
        , s = x.replace(/[^a-zA-Z]/g,'');
        switch(s){
            case "tri": n *= 1000000000000; break;
            case "bi" : n *= 1000000000; break;
            case "mi" : n *= 1000000; break;
            case "k"  : n *= 1000; break;
            default   : n *= 1; break;
        }
        return n
    }

    static crop(tx, colls=-1) {
        return colls > 0 ? tx.slice(0, colls) : tx
    }

    static gauge(x, pre = '', ch = '=', maxwidth=1024) {
        x = x ? Math.max(0, x*1) : .001;
        pre = pre ? `${pre} `: '';
        const
        gaugelen = Math.ceil((Math.min(maxwidth, GAUGE_LEN) - pre.length - 8)*x)
        , filllen = fText.fill((new Array(gaugelen)).map(_ => ch+'').join(''), ' ', Math.min(maxwidth, GAUGE_LEN) - pre.length - 8)
        ;;
        process.stdout.write(`\r${pre}[${filllen}]${fText.fill(Math.ceil(x*100), ' ', 5, -1)}%`)
        return `\r${pre}[${filllen}]${fText.fill(Math.ceil(x*100), ' ', 5, -1)}%`
    }

}