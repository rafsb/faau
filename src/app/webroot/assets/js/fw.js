// /**************************************************************************
//      ___                                             _
//     /  _|_ __ __ _ _ __ ___   _____      _____  _ __| | __
//     | |_| '__/ _` | '_ ` _ \ / _ \ \ /\ / / _ \| '__| |/ /
//     |  _| | | (_| | | | | | |  __/\ V  V / (_) | |  |   <
//     |_| |_|  \__,_|_| |_| |_|\___| \_/\_/ \___/|_|  |_|\_\
//
// ****************************************************************************/
const
DEBUG = false
, SUM = 0
, AVERAGE = 1
, HARMONIC = 2
, TREND = 3
, PROGRESS = 4
, INTERPOLATE = 5
, MAX = 6
, MIN = 7
, RELATIFY = 8
, SMOOTH = 9
, SIMILARITY = 10
, PASSWD_AUTO_HASH = 1
, LOCALE_OFFSET = 1 // pt-br-full=0 pt-br=1 en-us-full=2 en-us=3
, MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
, DAYS = [ "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "dom", "seg", "ter", "qua", "qui", "sex", "sáb", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "sun", "mon", "tue", "wed", "thu", "fri", "sat" ]
, PTBR_FULL = 0
, PTBR = 12
, ENUS_FULL = 24
, ENUS = 36
, TS_MASK = "Y-m-dTh:i:s.000Z"
// , NUMBER            = 0
// , STRING            = 1
, TAG = (n = "div", c, s, t) => fw.new(n, c, s)[typeof t == "object" ? "app" : "html"](t || "")
, DIV = (c, s, t) => TAG("div", c, s, t)
, WRAP = (h, c, s) => DIV((c || "") + " -wrapper", s)[h instanceof Object || h instanceof Array ? 'app' : 'html'](h || "")
, IMG = (path = "img/icons/cross.svg", cls = "--self-generated", css = {}) => TAG("img", cls, css).attr({ src: path, role: "img" })
, SVG = (t = "svg", c = "--self-generated", a = { focusable: "false" }, s = {}) => {
    const
    node = document.createElementNS("http://www.w3.org/2000/svg", t)
        .addClass(c)
        .attr(a || {})
        .css(s || {})
        .html(t == "svg" ? "<defs></defs>" : "")
    ;;
    node.attr = function(o, ns) {
        if(o) {
            if(typeof o === "object") Object.keys(o).map(k => this.setAttributeNS(ns, k, o[k]));
            else if(typeof o === "string") return this.getAttribute(o)
        }
        return this
    }
    return node
}
, SPATH = (d, c, a, s) => SVG("path", c, blend({ d: d }, a), s)
, TEXT  = (t,c,s,n="p") => TAG(n,c,s,t)
, SPAN = (t, c, s, n = "span") => TAG(n, c, s, t)
, BOLD = (t,c,s) => TAG("b",c,s,t)
, ITALIC = (t,c,s) => TAG("i",c,s,t)
, ROW = (c, s, e) => { const x = DIV("-row " + (c || ''), s); if (e) { typeof e == "string" ? x.html(e) : x.app(e); } return x }
, WSPAN = (t,c,s,n="span") => TAG(n,c,blend({ paddingLeft:"1em" }, s||{}),t)
, blend = function (e = {}) {
    for (let i = 1; i <= arguments.length - 1; i++) for (let j in arguments[i]) e[j] = arguments[i][j];
    return e
}
, EEvents = Object.freeze({
    CLICK: "click"
    , MOUSEENTER: "mouseenter"
    , MOUSELEAVE: "mouseleave"
    , MOUSEMOVE: "mousemove"
    , SUBMIT: "submit"
    , KEYUP: "keyup"
    , CHANGE: "change"
    , SEARCH: "search"

    , TCLICK: new Event("click")
    , TMOUSEENTER: new Event("mouseenter")
    , TMOUSELEAVE: new Event("mouseleave")
    , TMOUSEMOVE: new Event("mousemove")
    , TSUBMIT: new Event("submit")
    , TKEYUP: new Event("keyup")
    , TCHANGE: new Event("change")
    , TSEARCH: new Event("search")
})
;;

blend(Number.prototype, {
    fill: function (c, l, d) { return (this + "").fill(c, l, d) }
    , nerdify: function () {
        let n = this * 1;
        return n >= 1000000000000 ? ((n / 1000000000000).toFixed(1)) + "tri" : (
            n >= 1000000000 ? ((n / 1000000000).toFixed(1)) + "bi" : (
                n >= 1000000 ? ((n / 1000000).toFixed(1)) + "mi" : (
                    n >= 1000 ? ((n / 1000).toFixed(1)) + "k" : Math.ceil(n)
                )
            )
        )
    }
});

blend(NodeList.prototype, {
    array: function () {
        return [].slice.call(this);
    }
    , each: function (f) {
        return this.array().each(f)
    }
    , extract: function (f) {
        return this.array().extract(f)
    }
});

blend(HTMLCollection.prototype, {
    array: function () {
        return [].slice.call(this);
    }
    , each: function (f) {
        return this.array().each(f)
    }
    , extract: function (f) {
        return this.array().extract(f)
    }
    , evalute: function () {
        this.array().each(el => el.evalute())
    }
})

blend(HTMLFormElement.prototype, {
    json: function () {
        let tmp = {} ;;
        this.$("input, textarea, select, .-value, .-field").forEach(o => {
            if (o.name || o.dataset.name) {
                let
                name = o.name || o.dataset.name
                , value = o.value || o.dataset.value || o.textContent
                ;;
                if (o.has("-list")) value = value.split(/\s+/gi).filter(i=>isNaN(i) ? i : i*1);
                if (o.has("-hash")) value = Array.isArray(value) ? value.extract(x => { return x.hash() }) : value.hash();
                if(typeof value == 'string') value = isNaN(value) ? value : value*1
                tmp[name] = value;
            }
        })
        return tmp
    }
    , stringify: function () {
        return JSON.stringify(this.json())
    }
});

blend(Element.prototype, {
    at: function () { return this }
    , anime: function (obj, len = ANIMATION_LENGTH, delay = 0, trans = null) {
        const el = this;;
        return new Promise(function (ok) {
            len /= 1000;
            trans = trans ? trans : "ease";
            el.style.transition = "all " + len.toFixed(2) + "s " + trans;
            el.style.transitionDelay = (delay ? delay / 1000 : 0).toFixed(2) + "s";
            for (let i in obj) el.style[i] = obj[i];
            setTimeout(function (e) { return ok(e) }, len * 1000 + delay, el)
        })
    }
    , mime: function () {
        return this.cloneNode(true)
    }
    , stop: function () {
        if (this.dataset.animationFunction) clearInterval(this.dataset.animationFunction);
        this.dataset.animationFunction = "";
        return this
    }
    , empty: function () {
        this.html("");
        return this
    }
    , css: function (o = null, fn = null) {
        if (o === null) return this;
        this.style.transition = "none";
        this.style.transitionDuration = 0;
        for (let i in o) this.style[i] = o[i];
        if (fn !== null && typeof fn == "function") setTimeout(fn.bind(this), 16, this);
        return this
    }
    , text: function (t = null, fn = null) {
        if (t == null || t == undefined) return this.textContent;
        this.textContent = t;
        if (fn) return fn.bind(this)(this);
        return this;
    }
    , html: function (tx = null) {
        if (tx !== null && tx !== false) {
            if(typeof tx == 'string') this.innerHTML = tx;
            else try {
                const p = this ;;
                Array.from(tx).forEach(e => p.app(e))
            } catch(e) {}
            this.evalute()
        } else return this.innerHTML;
        return this
    }
    , data: function (o = null, fn = null) {
        if (o === null) return this.dataset;
        blend(this.dataset, o);
        if (fn !== null && typeof fn == "function") fn.bind(this)(this);
        return this;
    }
    , attr: function (o = null, fn = null) {
        if (o === null) return null;
        let el = this;
        Object.keys(o).forEach(x => el.setAttribute(x, o[x]));
        if (fn !== null && typeof fn == "function") return fn(this);
        return this;
    }
    , _put_where_: function (obj = null, w = "beforeend") {
        let el = this;
        if (Array.isArray(obj) || HTMLCollection.prototype.isPrototypeOf(obj) || NodeList.prototype.isPrototypeOf(obj)) {
            Array.from(obj).forEach(o => el._put_where_(o, w));
        } else if (obj) el.insertAdjacentElement(w, obj);
        return this
    }
    , aft: function (obj = null) { return this._put_where_(obj, "afterend") }
    , bef: function (obj = null) { return this._put_where_(obj, "beforebegin") }
    , app: function (obj = null) { return this._put_where_(obj, "beforeend") }
    , pre: function (obj = null) { return this._put_where_(obj, "afterbegin") }
    , append: function (obj = null) { return this._put_where_(obj, "beforeend") }
    , prepend: function (obj = null) { return this._put_where_(obj, "afterbegin") }
    , has: function (cls = null) {
        if (cls) return this.classList.contains(cls);
        return false
    }
    , dataSort: function (data = null, dir = "desc", noheader=true, str=false) {
        data = data || 'sort'
        let all = [].slice.call(this.children) ;;
        if(!noheader) all = all.slice(1)
        if (all.length) all.sort(function (a, b) {
            if (str) return dir == "asc" ? (a.dataset[data]||'').localeCompare(b.dataset[data]||'') : (b.dataset[data]||'').localeCompare(a.dataset[data]||'')
            else return dir == "asc" ? (a.dataset[data]||0) - (b.dataset[data]||0) : (b.dataset[data]||0) - (a.dataset[data]||0)
        })
        all.forEach(el => el.raise())
        return this
    }
    , index: function () {
        return [].slice.call(this.parent().children).indexOf(this)
    }
    , evalute: function () {
        if (this.tagName == 'SCRIPT') {
            // console.log(this.textContent)
            eval(this.textContent);
            this.remove()
        } else {
            fw.get("script", this).each(x => {
                eval(x.textContent);
                x.remove()
            })
        }
        return this
    }
    , on: function (action, fn, passive = { passive: true }) {
        const _self = this;
        if (Array.isArray(action)) action.map(act => _self.addEventListener(act, fn, passive))
        else _self.addEventListener(action, fn, passive);
        return this
    }
    , parent: function (pace = 1) {
        let
            tmp = this;
        while (pace--) tmp = tmp.parentElement;
        return tmp;
    }
    , upFind(tx = null) {
        if (tx) {
            let
                x = this;
            while (x.parentElement.tagName.toLowerCase() != "body" && !(x.parentElement.tagName.toLowerCase() == tx || x.parentElement.has(tx))) x = x.parentElement;
            return x.parentElement
        }
        return this.parentElement
    }
    , inPage: function(parent_pace=1) {
        const
        me = this
        , parent = this.parent(parent_pace)
        ;;
        return (
            me.offsetTop > parent.scrollTop + parent.offsetHeight || me.offsetTop + me.offsetHeight < parent.scrollTop
        ) ? false : {
            offset: me.offsetTop - parent.scrollTop,
            where: (me.offsetTop - parent.scrollTop) / parent.clientHeight
        }
    }
    , scrolls: function(el,fn=null) {
        if (!el) return -1;
        let
        length = 0;
        do {
            length += el.offsetTop;
            el = el.parentElement;
        } while (el.uid() != this.uid());
        this.scroll({top:length,behavior:"smooth"});
        fn&&fn();
    }
    , stopScroll: function() {
        this.scroll({top:this.scrollTop+1});
    }
    , get: function (el) {
        if (el) return [].slice.call(this.querySelectorAll(el));
        else return this;
    }
    , $: function (el) {
        if (el) return [].slice.call(this.querySelectorAll(el));
        else return this;
    }
    , remClass: function (c) {
        if (this.classList.contains(c)) {
            this.classList.remove(c);
        }
        return this;
    }
    , removeClass: function (c) {
        return this.remClass(c);
    }
    , addClass: function (c) {
        if (c) {
            let
                tmp = c.trim().split(/\s+/g)
                , i = tmp.length;
            if (c.length) while (i--) this.classList.add(tmp[i]);
        }
        return this;
    }
    , toggleClass: function(c) {
        let
        tmp = c.split(/\s+/g), i=tmp.length;
        while(i--) {
            if (tmp[i]) {
            if(!this.classList.contains(tmp[i]))
                this.classList.add(tmp[i]); else this.classList.remove(tmp[i]);
            }
            } return this;
    }
    , uid: function (name = null, hash = false) {
        if (name) this.id = name.replace(/[^0-9a-zA-Z]/g, "");
        if (!this.id) this.id = fw.nuid();
        return (hash ? "#" : "") + this.id;
    }
    , move: function(obj,len=ANIMATION_LENGTH, anim="linear") {
        len /= 1000;
        this.style.transition = "all "+len+"s "+anim;
        if(obj.top!==undefined)this.style.transform = "translateY("+(this.offsetTop-obj.top)+")";
        if(obj.left!==undefined)this.style.transform = "translateX("+(this.offsetLeft-obj.left)+")";
    }
    , raise: function () {
        this.parentElement.appendChild(this)
        return this
    }
    , show: function (display = 'inline-block') {
        this.style.display = display || 'inline-block'
        return this
    }
    , appear: function (len = ANIMATION_LENGTH, fn = null) {
        return this.stop().css({ display: 'inline-block' }, x => x.anime({ opacity: 1 }, len).then(fn))
    }
    , hide: function () {
        this.style.display = 'none'
        return this
    }
    , desappear: function (len = ANIMATION_LENGTH, remove = false, fn = null) {
        return this.stop().anime({ opacity: 0, top:'1em' }, len).then(x => { if (remove) x.remove(); else x.css({ display: "none", top:0 }); if (fn) fn(remove ? null : this); });
    }
    , remove: function () { if (this && this.parentElement) this.parentElement.removeChild(this) }
});

blend(String.prototype, {
    hash: function () {
        let
            h = 0, c = "", i = 0, j = this.length;
        if (!j) return h;
        while (i++ < j) {
            c = this.charCodeAt(i - 1);
            h = ((h << 5) - h) + c;
            h |= 0;
        }
        return Math.abs(h).toString();
    }
    , sanitized_compare: function (word) {
        const w = this ;;
        return (new RegExp(
            w
                .trim()
                .replace(/\s+/giu, ' ')
                .replace(/(a|á|à|ã)/giu, "(a|á|à|ã)")
                .replace(/(e|é|ê)/giu,   "(e|é|ê)")
                .replace(/(i|í)/giu,     "(i|í)")
                .replace(/(o|ó|ô|õ)/giu, "(o|ó|ô|õ)")
                .replace(/(u|ú)/giu,     "(u|ú)")
                .replace(/(c|ç)/giu,     "(c|ç)")
            , 'giu')).test(word.trim().replace(/\s+/gi, ' ')) ? true : false
    }
    , btoa: function () {
        return btoa(this);
    }
    , atob: function () {
        return atob(this);
    }
    , list: function () {
        return this.split(/\s+/gi) || []
    }
    , fill: function (c = " ", l = 8, d = -1) {
        let
            s = this;
        c = !c ? " " : c;
        d = d == 0 || d == null || d == undefined ? -1 : d;
        while (s.length < l) s = (d < 0 ? c : "") + s + (d > 0 ? c : "");
        return s
    }
    , nerdify: function () {
        return (this * 1).nerdify()
    }
    , desnerdify: function () {
        let
        n = Number(this.replace(/[^0-9\.]/g, '').replace(',', '.'))
        , s = this.replace(/[^a-zA-Z]/g, '')
        ;;
        switch (s) {
            case "tri": n *= 1000000000000; break;
            case "bi": n *= 1000000000; break;
            case "mi": n *= 1000000; break;
            case "k": n *= 1000; break;
            default: n *= 1; break;
        }
        return n
    }
    , json: function () {
        let
            result = null;
        try {
            result = JSON.parse(this);
        } catch (e) {
            console.trace(e)
        }
        return result;
    }
    , morph: function () {
        const
            x = document.createElement("div");;
        x.innerHTML = this
        return x.firstChild.tagName.toLowerCase() == "template" ? x.firstChild.content.children : x.children;;
    }
    , prepare: function (obj = null) {
        let str = this.trim() ;;
        obj = blend(fw.pallete, obj)
        const founds = str.match(/{{([^{}]+)}}/gi)?.map(i => i.replace(/{|}/g, '')) || [] ;;
        founds.forEach(x => {
            let rgx = new RegExp("{{" + x.trim() + "}}", "gi") ;;
            str = str.replace(rgx, (obj[x]||obj[x.toLowerCase()]||obj[x.toUpperCase()]||""))
        })
        return str.replace(/[ ]+/g, ' ')
    }
});

blend(Array.prototype, {
    json: function (pretty = true) { return JSON.stringify(this, null, pretty ? 4 : null); }
    , clone: function () { return this.slice(0) }
    , each: function (fn) { if (fn && typeof fn == 'function') { for (let i = 0; i++ < this.length;) fn(this[i - 1], i - 1); } return this }
    , extract: function (fn = null) {
        if (!fn || !this.length) return this;
        let narr = [];
        this.each((o, i) => {
            let x = fn(o, i);
            if (x != null && x != undefined) narr.push(x)
        })
        return narr
    }
    , merge: function () {
        return [].concat.apply([], this)
    }
    , mutate: function (fn) {
        if (!fn) return this;
        return this.extract((x, i) => { return fn(x, i) })
    }
    , cast: function (filter = STRING) {
        return this.extract(x => { return filter == STRING ? x + "" : (filter == NUMBER ? x * 1 : x) })
    }
    , fit: function (n = 10) {
        let
            narr = [this.first()]
            , x = this.length / (n - 1)
            , i = x
            ;
        while (i < this.length) {
            narr.push(this.calc(TREND, i));
            i += x;
        }
        narr.push(this.last())
        return narr
    }
    , tiny: function (n = 10) {
        if (this.length <= n) return this;
        let
            arr = this.calc(SMOOTH, Math.floor(this.length / (n - 1)))
            , narr = [this.first()]
            , x = this.length / (n - 1)
            , i = Math.floor(x)
            ;
        while (i > 0 && i < this.length - 1) {
            narr.push(this[i] || null);
            i += Math.floor(x);
        }
        narr.push(this.last())
        return narr
    }
    , calc: function (type = SUM, helper = null) {
        let res = 0 ;;
        switch (type) {
            case (SUM): this.forEach(x => res += x); break
            case (AVERAGE): this.forEach(x => res += x); res = res / this.length; break
            case (HARMONIC): this.forEach(x => res += 1 / x); res = this.length / res; break
            case (TREND): {
                let m, b, x, y, x2, xy, z, np = this.length ;;
                m = b = x = y = x2 = xy = z = 0*0;
                if (!helper) helper = np;
                this.forEach((n, i) => {
                    x = x + i;
                    y = y + n;
                    xy = xy + i * n;
                    x2 = x2 + i * i;
                });
                z = np * x2 - x * x
                if (z) {
                    m = (np * xy - x * y) / z;
                    b = (y * x2 - x * xy) / z;
                }
                res = m * helper + b
            } break
            case (INTERPOLATE): {
                if (helper == null || helper == undefined) {
                    fw.error("Ops! a 'x' value is needed for array basic interpolation...")
                    return 0
                }
                res = this.linearInterpolation(helper)
            } break;
            case (PROGRESS): {
                let me = this ;;
                res = this.extract((x, i) => { return i ? me[i] / me[i - 1] : 1 }).calc(AVERAGE)
            } break;
            case (MAX): {
                if (!this.length) return 0;
                res = Math.max(...this)
            } break;
            case (MIN): {
                if (!this.length) return 0;
                res = Math.min(...this)
            } break;
            case (RELATIFY): {
                res = this.calc(MAX);
                res = this.map(x => x / res)
            } break;
            case (SIMILARITY): {
                if (helper == null || helper == undefined) {
                    fw.error("Ops! a 'y' array is needed for Pearson similarity algorythm to work...")
                    return 0
                }
                res = this.pearsonSimilarity(helper);
            } break;
            case (SMOOTH): {
                const
                narr = []
                , arr = this
                , len = this.length
                , xx = Math.max(1, Math.floor(helper / 2))
                ;;
                this.forEach((x, i) => narr.push(fw.iterate(Math.max(0, i - xx), Math.min(len, i + xx)).extract(x => arr[x]).calc(AVERAGE)))
                return narr
            } break;
        }
        return res;
    }
    , pearsonSimilarity(y) {
        const
        x = this
        , n = x.length
        ;;
        if (n !== y.length) return undefined

        const
        sumx    = x.reduce((a, b) => a + b, 0)
        , sumy  = y.reduce((a, b) => a + b, 0)
        , xab2  = x.reduce((a, b) => a + b * b, 0)
        , yab2  = y.reduce((a, b) => a + b * b, 0)
        , sumxy = x.reduce((a, b, i) => a + b * y[i], 0)
        , num   = n * sumxy - sumx * sumy
        , diff  = Math.sqrt((n * xab2 - sumx * sumx) * (n * yab2 - sumy * sumy))
        ;;

        if (diff === 0) return 0
        return num / diff
    }
    , linearInterpolation(z) {
        if(!z) return this[0] || 0
        let x0=0, x1=Number.MAX_SAFE_INTEGER ;;
        for (let i = 0; i < this.length; i++) {
            if (this[i] !== null && this[i] !== undefined) {
                if(i<z) x0 = Math.max(x0, i)
                if(i>z) x1 = Math.min(x1, i)
            }
        }
        let y0 = this[x0]||0, y1 = this[x1]||0 ;;
        return y0 + (y1 - y0) * ((z - x0) / (x1 - x0))
    }
    , lagrangeInterpolation(z) {
        const x=[], y=[] ;;
        for (let i = 0; i < this.length; i++) {
            if (this[i] !== null && this[i] !== undefined) {
                x.push(i)
                y.push(this[i])
            }
        }
        let n = x.length, sum = 0 ;;
        for (let i = 0; i < n; i++) {
            let term = y[i] ;;
            for (var j = 0; j < n; j++) if(j!==i) term = term * (z - x[j]) / (x[i] - x[j])
            sum += term
        }
        return sum
    }
    , fillNulls: function () {
        let
            final
            , nulls = []
            , narr = this.extract((el, i) => {
                let
                    y = Array.isArray(el) ? el[1] : el
                    , x = Array.isArray(el) ? el[0] : i
                    ;;
                if (y == null || y == undefined) nulls.push(x);
                else return [x, y];
            })
        nulls.each((x, n) => narr.push([n, narr.calc(INTERPOLATE, n)]));
        narr.sort(function (a, b) { return a[0] - b[0] })
        return narr;
    }
    , last: function (n = null) {
        if (!this.length) return null;
        if (n === null) return this[this.length - 1];
        return this.slice(Math.max(this.length - n, 0));
    }
    , first: function (n = null) {
        if (!this.length) return null;
        if (n === null) return this[0];
        return this.slice(0, n);
    }
    , at: function (n = 0) {
        if (n >= 0) return this.length >= n ? this[n] : null;
        return this.length > n * -1 ? this[this.length + n] : null
    }
    , rand: function () {
        return this[Math.floor(Math.random() * this.length)]
    }
    , not: function (el) {
        let
            arr = this;
        while (arr.indexOf(el) + 1) arr.splice(arr.indexOf(el), 1);
        return arr;
    }
    , anime: function (obj, len = ANIMATION_LENGTH, delay = 0, trans = null) {
        this.each(x => x.anime(obj, len, delay, trans));
        return this
    }
    , stop: function () {
        this.each(x => x.stop())
        return this
    }
    , raise: function () {
        this.each(x => x.raise());
        return this
    }
    , css: function (obj, fn = null) {
        this.each(x => x.css(obj, fn));
        return this
    }
    , data: function (obj, fn = null) {
        this.each(x => x.data(obj, fn));
        return this
    }
    , attr: function (obj, fn = null) {
        this.each(x => x.attr(obj, fn));
        return this
    }
    , text: function (txt, fn = null) {
        this.each(x => x.text(txt, fn));
        return this
    }
    , addClass: function (cl = null) {
        if (cl) this.each(x => x.addClass(cl));
        return this
    }
    , remClass: function (cl = null) {
        if (cl) this.each(x => x.remClass(cl));
        return this
    }
    , removeClass: function (cl = null) {
        return this.remClass(cl)
    }
    , toggleClass: function(cl=null) {
        if(cl) this.each(x => x.toggleClass(cl));
        return this
    }
    , remove: function () {
        this.each(x => x.remove());
        return this
    }
    , on: function (act = null, fn = null) {
        if (act && fn) this.each(x => x.on(act, fn));
        return this
    }
    , empty: function () {
        this.each(x => x.empty())
        return this
    }
    , clear: function () {
        return this.extract(n => {
            return n != null && n != undefined && n != NaN && n != window ? (n instanceof String ? n + "" : (n instanceof Number ? n * 1 : n)) : null
        })
    }
    , evalute: function () {
        this.each(el => el.evalute())
    }
    , html: function (v) {
        this.each(el => el.html(v));
        return this
    }
    , show: function (display = 'inline-block') {
        return this.map(x => x.style.display = display || 'inline-block')
    }
    , appear: function (len = ANIMATION_LENGTH) {
        return this.each(x => x.css({ display: 'block', top:'1em' }, x => x.anime({ opacity: 1, top:0 }, len, 1)))
    }
    , hide: function () {
        return this.map(x => x.style.display = 'none')
    }
    , desappear: function (len = ANIMATION_LENGTH, remove = false, fn = null) {
        return this.each(x => x.desappear(len, remove, fn))
    }
    , val: function(v=null){
        if(v) this.each(x => { if(x.tagName.toLowerCase()=="input") x.value = v })
        return this
    }
    , app: function (el = null) {
        if (el) this.forEach(x => x.app(el))
        return this
    }
});

Object.defineProperty(Object.prototype, "spy", {
    value: function (p, fn) {
        let
            o = this[p]
            , set = function (v) { return fn(v, p, this) };
        if (delete this[p]) { // can't watch constants
            Object.defineProperty(this, p, { set: set })
        }
    }
});

//       _
//   ___| | __ _ ___ ___  ___  ___
//  / __| |/ _` / __/ __|/ _ \/ __|
// | (__| | (_| \__ \__ \  __/\__ \
//  \___|_|\__,_|___/___/\___||___/

class FDate extends Date {

    plus(n) {
        let
        date = new Date(this.valueOf());
        date.setDate(date.getDate() + n);
        return new FDate(date)
    }

    export(format = TS_MASK){
        let
        d = this || FDate.now()
        , arr = format.split("")
        ;;
        arr.each(n => {
            switch(n){
                case "Y": format = format.replace(n, d.getFullYear());                             break;
                case "y": format = format.replace(n, ((d.getYear()-100)   + "").fill("0", 2, -1)); break;
                case "m": format = format.replace(n, ((d.getMonth()+1)    + "").fill("0", 2, -1)); break;
                case "d": format = format.replace(n, (d.getDate()         + "").fill("0", 2, -1)); break;
                case "h": format = format.replace(n, (d.getHours()        + "").fill("0", 2, -1)); break;
                case "i": format = format.replace(n, (d.getMinutes()      + "").fill("0", 2, -1)); break;
                case "s": format = format.replace(n, (d.getSeconds()      + "").fill("0", 2, -1)); break;
                case "k": format = format.replace(n, (d.getMilliseconds() + "").fill("0", 3, -1)); break;
                case "t": format = format.replace(n, d.getTime());                                 break;
                case "M": format = format.replace(n, MONTHS[d.getMonth()+(12*LOCALE_OFFSET)]);          break;
                case "D": format = format.replace(n, DAYS[d.getDay()+(7*LOCALE_OFFSET)]);              break;
            }
        })
        return format
    }

    as(format){
        return this.export(format)
    }

    format(format){
        return this.export(format)
    }

    isValid(date){
        if(date) return (new FDate(date)).isValid();
        else if(this.getTime()) return this
        return null
    }

    now(){
        return new FDate()
    }

    time(){
        return this.getTime()
    }

    static guess(datestr){
        /**
         * possibilities:
         *     - Tue Jun 08 19:34:03 +0000 2021
         */
        if(!datestr) return false;

        var dat ;;

        if(!isNaN(datestr)) {
            dat = new FDate();
            dat.setTime(datestr);
        }
        if(dat&&dat.getTime()) return dat

        let
        datefound = null
        , hourfound = null
        , fmatch
        ;;

        fmatch = datestr.match(/\b\d{2,4}([\-\/ ])\d{2}\1\d{2,4}(T|\b)/)
        if(fmatch?.length) {
            const tmp = fmatch[0].replace("T", "") ;;
            if(tmp.match(/^\d{2}([\-\/ ])\d{2}([\-\/ ])\d{2,4}$/)) datefound = tmp
                .split(/[\-\/ ]/)
                .reverse()
                .map((x, i) => !i && x.length==2 ? `20${x}` : x)
                .map(x => x*1 > (new Date).getFullYear() ? (x*1 - 100)+'' : x)
                .join('-')
            ; else datefound = tmp
        }

        fmatch = datestr.match(/(T|\b)\d{1,2}:\d{2}/)
        if(fmatch?.length) hourfound = fmatch[0].replace("T", "")+":00.000Z"

        return datefound + (hourfound ? `T${hourfound}` : '')


        dat = new FDate(datestr)
        if(dat&&dat.getTime()) return dat

        MONTHS.map((m, i) => datestr = datestr.replace(m, (((i++%12)+1)+"").fill("0", 2, -1)));
        datestr = datestr.replace(/[^a-z0-9:]|(rd|th|nd|de)/gi, ' ').replace(/\s+/gi, ' ').trim();

        const dt = datestr.match(/\d{2,4}([.\-/ ])\d{2}\1\d{2,4}\b/);
        if(dt&&dt.length) {
            datefound = dt[0].replace(/\s+/gi, '-')
            let dat ;;
            dat = datefound.match(/\d{2}\-\d{2}\-\d{4}/gi) // xx/xx/xxxx
            if(dat&&dat.length) datefound = dat[0].split('-').reverse().join('-')
            dat = datefound.match(/\d{2}\-\d{2}\-\d{2}\b/gi) // xx/xx/xx
            if(dat&&dat.length) datefound = dat[0].split('-').reverse().map((x, i) => i ? x : `20${x}`).join('-')

            datefound = datefound.slice(0, 10)
        }

        datefound = datefound ? new FDate(datefound+"T03:00:00.000Z") : false;

        return datefound //&& datefound.as('Y')*1 > 1000 ? datefound : false
    }

    static now(){
        return new FDate()
    }

    static plus(n=1){
        return FDate.now().plus(n)
    }

    static time(){
        return Date.now()
    }

    static at(n){
        return FDate.now().plus(n)
    }

    static as(format=TS_MASK){
        return FDate.now().export(format)
    }

    static format(format){
        return FDate.now().export(format)
    }

    static cast(date){
        return new FDate(date || new Date)
    }

    static yday(){
        return parseInt(FDate.plus(-1).getTime()/1000)*1000
    }

    static tday(){
        return parseInt(FDate.time()/1000)*1000
    }
}

class pool {
    add(x = null) {
        if (x) {
            const pool = this ;;
            if (Array.isArray(x)) x.forEach(y => pool.add(y))
            if (typeof x === 'function') this.execution.push(x)
            else this.conf(x)
        }
        return this;
    }
    push(x) {
        this.add(x);
        return this
    }
    conf(o = null) {
        if(o) {
            if (typeof o == 'object') blend(this.setup, o)
            else this.setup.args.push(o)
        }
        return this
    }

    fire(x = null) {
        if (x && typeof x == "function") {
            this.add(x);
            x = null
        }
        const
        pool = this
        , initlen = pool.execution.length
        , fn = i => i < initlen && Promise.resolve(pool.execution[i](x, i, pool.setup)).then(_ => fn(++i))

        return fn(0)
    }
    stop() {
        this.stop_flag = true
        return this
    }
    clear() {
        this.stop()
        this.execution = []
        this.setup = {}
        return this
    }
    constructor(x) {
        this.execution = [];
        this.setup = { args: [] };
        this.add(x)
    }
};

class swipe {
    constructor(el,len=40) {
        this.len = len;
        this.x = null;
        this.y = null;
        this.e = typeof(el) === 'string' ? $(el).at() : el;
        if(!this.e) return;
        this.e.on('touchstart', function(v) {
            this.x = v.touches[0].clientX;
            this.y = v.touches[0].clientY;
        }.bind(this));
    }

    static cast(e, l) {
        return new Swipe(e, l)
    }

    left(fn) { this.__LEFT__ = new throttle(fn,this.len); return this }

    right(fn) { this.__RIGHT__ = new throttle(fn,this.len); return this }

    up(fn) { this.__UP__ = new throttle(fn,this.len); return this }

    down(fn) { this.__DOWN__ = new throttle(fn,this.len); return this }

    move(v) {
        if(!this.x || !this.y) return;
        let
        diff = (x,i)=>{ return x-i },
        X = v.touches[0].clientX,
        Y = v.touches[0].clientY;

        this.xdir = diff(this.x,X);
        this.ydir = diff(this.y,Y);

        if(Math.abs(this.xdir)>Math.abs(this.ydir)) { // Most significant.
            if(this.__LEFT__&&this.xdir>0) this.__LEFT__.fire();
            else if(this.__RIGHT__) this.__RIGHT__.fire();
        }else{
            if(this.__UP__&&this.ydir>0) this.__UP__.fire();
            else if(this.__DOWN__) this.__DOWN__.fire()
        }
        this.x = this.y = null
    }

    fire() { this.e&&this.e.on('touchmove', function(v) { this.move(v) }.bind(this)) }
};

/*
 * @class
 *
 * handle the minimum amount of time to wait until executions of a given function
 * good to prevent events like scroll and typing to fire some actions multiple
 * times decreasing performance affecting user's experience
 *
 */
class throttle {
    /*
     * @constructor
     *
     * f = javascript function to be applied
     * t = time betwin executions of 'f' (250ms is the default)
     * ex.: new __self.throttle(minha_funcao,400);
     *
     */
    constructor(f, t = ANIMATION_LENGTH/2) {
        this.assign(f,t);
    }

    /*
     * @member function
     *
     * assign values to inner class attributes
     * f = javascript function to be applied
     * t = time betwin executions of 'f' (250ms is the default)
     * ex.: (new __self.throttle).assign(minha_funcao) // assuming default delay time
     *
     */
    assign(f, t) {
        this.func = f;
        this.delay = t;
        this.timer = (new Date()).getTime();
    }

    /*
     * @member function
     *
     * execute given function assigned on constructor or assign() mmber function
     * ex.: (new __self.throttle).apply()
     * obs.: the fire() member function will only execute the inner function if the
     * given ammount of time is passed, otherway if won't do anything
     *
     */
    fire() {
        if(!this.func) return;
        let
        now = (new Date()).getTime();
        if (now - this.delay > this.timer) {
            eval(this.func)( ... arguments);
            this.timer = now;
        }
    }
};

class Loader {

    loadLength() {
        return Object.values(this.Loaders).filter(i => i).length / Object.keys(this.Loaders).length
    }

    check(scr) {
        return scr ? this.Loaders[scr] : this.alreadyLoaded
    }

    ready(scr) {
        const tmp = this ;;
        this.dependencies.forEach(x => tmp.Loaders[x] = tmp.Loaders[x]*1 ? 1 : 0)
        if (scr!=null&&scr!=undefined) this.Loaders[scr] = 1;

        let perc = this.loadLength();

        if (!this.alreadyLoaded && perc >= 1) {
            this.alreadyLoaded = true;
            this.onFinishLoading.fire()
        } else if (!this.alreadyLoaded) this.onReadyStateChange.fire(perc)

        return this.alreadyLoaded || false;
    }

    pass() {
        this.dependencies = new Set(["pass"]);
        return this.ready("pass");
    }

    constructor(dependencies) {
        this.alreadyLoaded = false;
        this.loadComponents = new pool();
        this.onReadyStateChange = new pool();
        this.onFinishLoading = new pool();
        this.dependencies = new Set(dependencies || ["pass"]);
        this.Loaders = {};
    }

};

class CallResponse {
    constructor(url = location.href, args = {}, method = "POST", header = {}, data = null) {
        this.url = url;
        this.args = args;
        this.method = method;
        this.headers = header;
        this.data = data;
        this.status = this.data ? true : false;
    }
};

class FObject extends Object {

    static cast(o){
        return new FObject(o)
    }

    isNull(){
        return Object.values(this).length && true
    }
    static isNull(o){
        return FObject.cast(o).isNull()
    }

    map(fn){
        const me = {...this}, res = [] ;;
        Object.keys(me).map(k => res.push(fn(me[k], k)))
        return res
    }
    static map(o, fn){
        return FObject.cast(o).map(fn)
    }

    json(){
        return JSON.stringify({...this})
    }
    static json(o){
        var res;
        try {
            if(typeof o == 'string') res = JSON.parse(o)
            else res = JSON.stringify(o)
        } catch(e) {}
        return res
    }

    spread(){
        return this.isNull() ? null : {...this}
    }
    static spread(o){
        return FObject.cast(o).spread()
    }

    constructor(o){
        super()
        const me = this ;;
        Object.keys(o||{}).forEach(k => me[k] = o[k]);
        const attrs = Object.keys(me) ;;
        attrs.map(attr => {
            const l = attr.length ;;
            if(attr == 'id_') return;
            if(attr[l-1] == '_' && me[attr.slice(0, l-1)] === undefined) me[attr.slice(0, l-1)] = function(x) {
                if(undefined!==x && null!==x) me[attr]=x;
                return typeof me[attr] == "string" && !isNaN(me[attr]) ? me[attr]*1 : me[attr]
            }
        })
    }

}

class fw {

    static pallete = {
        ALIZARIN: "#E84C3D"
        , PETER_RIVER: "#2C97DD"
        , ICE_PINK: "#CA179E"
        , EMERLAND: "#53D78B"
        , SUN_FLOWER: "#F2C60F"
        , AMETHYST: "#9C56B8"
        , CONCRETE: "#95A5A5"
        , WET_ASPHALT: "#383C59"
        , TURQUOISE: "#00BE9C"
        , PURPLE_PINK: "#8628B8"
        , PASTEL: "#FEC200"
        , CLOUDS: "#ECF0F1"
        , CARROT: "#E67D21"
        , MIDNIGHT_BLUE: "#27283D"
        , WISTERIA: "#8F44AD"
        , BELIZE_HOLE: "#2A80B9"
        , NEPHRITIS: "#30AD63"
        , GREEN_SEA: "#169F85"
        , ASBESTOS: "#7E8C8D"
        , SILVER: "#BDC3C8"
        , POMEGRANATE: "#C0382B"
        , PUMPKIN: "#D35313"
        , ORANGE: "#F39C19"
        , BURRO_QNDO_FOJE: "#8C887B"
        , LIME: "#BAF702"
        /*** SYSTEM***/
        , BACKGROUND: "#FFFFFF"
        , FOREGROUND: "#ECF1F2"
        , FONT: "#2C3D4F"
        , FONTINVERTED: "#F2F2F2"
        , FONTBLURED: "#7E8C8D"
        , SPAN: "#2980B9"
        , DISABLED: "#BDC3C8"
        , DARK1: "rgba(0,0,0,.08)"
        , DARK2: "rgba(0,0,0,.16)"
        , DARK3: "rgba(0,0,0,.32)"
        , DARK4: "rgba(0,0,0,.64)"
        , LIGHT1: "rgba(255,255,255,.08)"
        , LIGHT2: "rgba(255,255,255,.16)"
        , LIGHT3: "rgba(255,255,255,.32)"
        , LIGHT4: "rgba(255,255,255,.64)"
        /*** PALLETE ***/
        , WHITE: "#FFFFFF"
        , BLACK: "#000000"
        , CYAN:"#01F2F2"
        , MAGENTA:"#E10085"
        , YELLOW:"#F2DE00"
        , RED:"#FF0000"
        , GREEN:"#00FF00"
        , BLUE:"#0000FF"
    }

    static rx(w, wrule=2, b="\\b", asrx=true, flags='guim'){
        const
        hasnum = parseInt((0+(w||'')).replace(/[^0-9]/gui, ''))
        , midrule = "([^-'0-9a-zÀ-ÿ]{0,2}[-'0-9a-zÀ-ÿ]+[^-'0-9a-zÀ-ÿ]{0,2}){0," + wrule + "}"
        , replaced = `(${b}` + (w||'').trim()
        .replace(/(a|á|à|ã)/giu, "(a|á|à|ã)")
        .replace(/(e|é|ê)/giu,   "(e|é|ê)")
        .replace(/(i|í)/giu,     "(i|í)")
        .replace(/(o|ó|ô|õ)/giu, "(o|ó|ô|õ)")
        .replace(/(u|ú)/giu,     "(u|ú)")
        .replace(/(c|ç)/giu,     "(c|ç)")
        .replace(/\s+/giu, `.{0,2}${b})${midrule}(`) + `.{0,2}${b})`
        ;;
        return asrx ? new RegExp(replaced, flags) : replaced
    }

    static color(c){
        var res;
        if(c){
            if(this.pallete[c]) res = this.pallete[c];
        } else res = this.pallete
        return res
    }

    static async client_ip(){
        if(!this.client_ip_) this.client_ip_ = await (await fetch("https://ipinfo.io/ip")).text();
        return this.client_ip_
    }

    static initialize() { initpool.fire() }

    static async call(url, args = null, method = null, head = null) {
        try {
            method = method ? method : (args ? "POST" : "GET")
            var tmp;
            if (method == "POST") tmp = blend({
                'Accept'        : 'application/json'
                , 'Content-Type': 'application/json;charset=UTF-8'
            }, head);
            head = tmp

            const
            req = await fetch(url, args ? {
                method
                , headers : new Headers(head)
                , body    : FObject.json(blend(args || {}, { _ts: FDate.time() }))
            } : { method, headers: new Headers(head) })
            , res = await req.text()
            ;;
            return new CallResponse(url, args, method, req, res);
    } catch(e) {
            console.log({ err: e, url, args, head })
        }
    }

    static async post(url, args, head = null) {
        return fw.call(url, args, "POST", head)//blend({ 'Accept': 'application/json', 'Content-Type': 'application/json; charset=UTF-8' }, head || {}))
    }

    static async load(url, args = null, target = null, bind = null) {
        return fw.call(url, args).then(r => {
            if (!r.status) return fw.error("error loading " + url);
            r = r.data.prepare(bind).morph()
            if (!target) target = $('#app')[0];
            r instanceof HTMLCollection ? r.array().each(e => { target.app(e); e.evalute() }) : target.app(r) && r.evalute();
            return r
        })
    }

    static async exec(url, args = null, prepare = null) {
        if(!fw.execs) fw.execs = {}
        else if(fw.execs[url]) return eval(fw.execs[url].prepare(prepare))
        const res = await this.call(`js/${url.indexOf('.js')+1 ? url : url+'.js'}`) ;;
        if(!res.status) return this.error("error loading " + url)
        fw.execs[url] = res.data
        return eval(fw.execs[url].prepare(prepare))
    }

    static uuid(pre='f') {
        return ((pre||'x')+'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        })
    }

    static nuid(n = 36, prefix = "f") {
        let a = prefix + "";
        n -= a.length;
        const keyspace = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('')
        while (n-- >= 0) a += String(keyspace[Math.floor((Math.random() * keyspace.length))])
        return a
    }

    static sanitized_compare(w1, w2) {
        return w1.sanitized_compare(w2)
    }

    /*
     * @Override
     */
    static loading(show = true, target, txt = '<img src="assets/img/spin.svg" style="transform:scale(.25)"/>') {
        $('toast').remove();
        $('tooltip').hide();

        const loading_list = $(".--loading", (target || $("#app")[0])) ;;

        if (show && loading_list.length) {
            $(".-pulse", loading_list[0])[0].html(txt);
            return
        }

        if (!show) {
            loading_list.forEach(e => e.anime({ transform: 'scale(1.5)', filter: 'opacity(0)' }).then(e => e.remove()))
            return loading_list
        } else {
            const
            load = WRAP(DIV('-centered').app(SPAN(txt, "-pulse", {
                fontSize: "4em"
                , color: "#0004"
            }, "i")), "-absolute -zero --loading", {
                background: fw.color('BACKGROUND')
                , opacity: .8
                , zIndex: 10000
            })
            ;;
            (target || $("#app")[0]).app(load);
            load.anime({ transform: 'scale(1)', filter: 'opacity(1)' })
            return load
        }

    }

    static notify(n, c = null) {
        const
        toast = document.createElement("toast")
        , clr = fw.pallete
        ;;
        toast.addClass("-fixed -tile -content-left --notification").css({
            background: c && c[0] ? c[0] : clr.FOREGROUND
            , color: c && c[1] ? c[1] : clr.FONT
            , boxShadow: "0 0 .5em " + clr.DARK2
            , borderRadius: ".25em"
            , padding: "1em"
            , display: 'block'
            , opacity: 0
            , fontWeight: "bolder"
            , zIndex: 10010
        }).innerHTML = n ? n : "Hello <b>World</b>!!!";
        if (!fw.is_mobile()) {
            toast.css({
                top: 0,
                right: 0,
                width: "20vw",
                margin: ".5em"
            });
        } else {
            toast.css({
                top: 0,
                left: 0,
                width: "100vw"
            })
        }
        toast.onclick = function () { clearTimeout(this.dataset.delay); this.desappear(ANIMATION_LENGTH / 2, true); };
        toast.onmouseenter = function () { clearTimeout(this.dataset.delay); };
        toast.onmouseleave = function () {
            this.dataset.delay = setTimeout(t => { t.desappear(ANIMATION_LENGTH / 2, true); }, ANIMATION_LENGTH, this);
        };
        document.getElementsByTagName('body')[0].appendChild(toast);
        this.tileClickEffectSelector(".-tile");

        toast.raise()

        let
        notfys = $("toast.--notification")
        , ht = 0
        ;
        notfys.forEach(x => {
            x.anime({ transform: "translateY(" + ht + "px)", opacity: 1 }, ANIMATION_LENGTH / 4)
            ht += x.getBoundingClientRect().height + 8;
        });
        toast.dataset.delay = setTimeout(function () { toast.desappear(ANIMATION_LENGTH / 2, true); }, ANIMATION_LENGTH * 5);
        return toast
    }

    static error(message = null) {
        return fw.notify(message || "Ops! Something went wrong...", [fw.color().POMEGRANATE, fw.color().CLOUDS])
    }
    static success(message = null) {
        return fw.notify(message || "Hooray! Success!", [fw.color().GREEN_SEA, fw.color().WHITE])
    }
    static warning(message = null) {
        return fw.notify(message || "Ops! take attention...", [fw.color().SUN_FLOWER, fw.color().WET_ASPHALT])
    }
    static working(message = null) {
        return fw.notify(message || "Hooray! Success!", [fw.color().PETER_RIVER, fw.color().WHITE])
    }

    //static hintify(n = null, o = {}, delall = true, keep = false, special = false, evenSpecial = false) {
    static hintify(opts={}) {

        if (opts.delall) $(".--hintifyied" + (opts.special ? ", .--hintifyied-sp" : "")).forEach(x => x.desappear(ANIMATION_LENGTH, true));

        opts.css = blend({
            top: Math.min(window.innerHeight * .95, maxis.clientY) + "px"
            , left: Math.min(window.innerWidth * .8, maxis.clientX) + "px"
            , boxShadow: "0 0 2em " + fw.color("DARK4")
            , padding:".5em"
            , borderRadius: ".25em"
            , background: fw.color("BACKGROUND")
            , color: fw.color("FONT")
            , zIndex: 9000
        }, opts.css);

        if (opts.text) opts.content = ("<p>" + opts.text + "</p>").morph()

        let toast = TAG("toast", "-block -fixed --hintifyied" + (opts.special ? "-sp" : ""), opts.css).css({ opacity: 0 }).app(opts.content || SPAN("Toastie!!!")) ;;
        if (toast.get(".--close").length) toast.get(".--close").on("click", function () { this.upFind("toast").desappear(ANIMATION_LENGTH, true) })
        else toast.on("click", function () { this.desappear(ANIMATION_LENGTH, true) });

        if (!opts.keep) {
            toast.on(EEvents.MOUSELEAVE, function () {
                $(".--hintifyied" + (opts.special ? ", .--hintifyied-sp" : "")).stop().desappear(ANIMATION_LENGTH, true)
            }).on(EEvents.MOUSEENTER, function () {
                this.stop()
            }).dataset.animationFunction = setTimeout(toast => toast.desappear(ANIMATION_LENGTH, true), ANIMATION_LENGTH * 8, toast)
        }

        $('body')[0].app(toast.appear())

        return toast
    }

    static window(html, title, css = {}) {
        const
        mob = fw.is_mobile()
        , head = TAG("header", "-relative -row -zero --window-header -no-scrolls").app(
            DIV("-left -content-left -ellipsis --drag-trigger", { cursor: 'all-scroll', minHeight: "3em", lineHeight: 3, width: "calc(100% - 6em)" }).app(
                typeof title == "string" ? ("<span class='-row -no-scrolls' style='height:3em;padding:0 1em;opacity:.75'>" + title + "</span>").morph()[0] : title
            ).on("click", function () { this.upFind("--window").raise() })
        ).app(
            // CLOSE
            DIV("-right -pointer --close -tile").app(
                IMG("assets/img/icons/cross.svg", fw.pallete.type == "dark" ? "-inverted" : null, { height: "2.75em", width: "2.75em", padding: ".75em" })
            ).on("click", function () {
                this.upFind("--window").remove()
                $(".--minimized").forEach((el, i) => { el.anime({ left: (6.75+(i*13.3)) + 'vw' }) })
            })
        ).app(
            // MINIMIZE
            mob ? DIV() : DIV("-right -pointer --minimize -tile").app(
                IMG("assets/img/icons/minimize.svg", fw.pallete.type == "dark" ? "-inverted" : null, { height: "2.75em", width: "2.75em", padding: ".75em" })
            ).on("click", function () {
                const win = this.upFind("--window") ;;
                if (win.has("--minimized")) {
                    const pos = win.dataset.position.json() ;;
                    this.anime({ transform: "rotate(0deg)" });
                    win.$(".-wrapper")[0].style.display = "block";
                    win.anime({ height: pos.h + "px", width: pos.w + "px", top: pos.y + "px", left: pos.x + "px", transform: "translate(-50%, -50%)" });
                    win.remClass("--minimized");
                } else {
                    win.dataset.position = FObject.json({
                        w: win.offsetWidth
                        , h: win.offsetHeight
                        , x: win.offsetLeft
                        , y: win.offsetTop
                    });
                    this.anime({ transform: "rotate(180deg)" });
                    win.$(".-wrapper")[0].hide();
                    win.anime({ height: "3em", width: "13.3vw", top: "calc(100vh - 1.5em)", left: "6.75vw" });
                    win.addClass("--minimized");
                }
                $(".--minimized").each((el, i) => { el.anime({ left: (6.75 + (i * 13.3)) + 'vw' }) })

            })
        )
        , wrapper = DIV("-zero -wrapper -no-scrolls", { height: "calc(100% - 3em)" })
        , _W = DIV("--window -fixed -no-scrolls --drag-target -centered -blur", blend({
            height: mob ? "100vh" : "70vh"
            , width: mob ? "100vw" : "70vw"
            , background: fw.pallete.FOREGROUND + "AA"
            , border: "none"
            , borderRadius: ".5em"
            , boxShadow: "0 0 1em black"
            , color: fw.color("FONT")
            , zIndex: 8000
            , resize: mob ? "none" : "both"
            , padding: "0"
        }, css)).data({ state: "default" })
        , uuid = fw.uuid()
        ;;

        _W.id = uuid

        if (html) wrapper.app(typeof html == "string" ? html.prepare({uuid}).morph() : html);

        $("#app")[0].app(_W.app(head).app(wrapper));

        this.tileClickEffectSelector(".-tile");

        fw.enableDragging();

        _W.raise()

        _W.evalute()

        return _W;

    }

    static dialog(html = null, title = null, css = {}) {
        const mob = fw.is_mobile() ;;
        return fw.window(html, title, blend({
            height: mob ? "90vh" : "40vh"
            , width: mob ? "90vw" : "24vw"
            , top: mob ? "5vh" : "50%"
            , left: mob ? "5vw" : "50%"
            , background: fw.pallete.BACKGROUND
            , borderRadius: ".5em"
            , boxShadow: "0 0 2em " + fw.pallete.DARK4
            , color: fw.pallete.FONT
            , transform: mob ? 'translate(0, 0)' : 'translate(-50%, -50%)'
        }, css))
        ;;
    }

    static get(w = null, c = null) { return $(w, c || document) }

    static args(field = null) {
        const args = {};;
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (NULL, k, v) => args[k] = decodeURI(v))
        return field === null ? args : (args[field] ? args[field] : null);
    }

    static new(node = 'div', cls = "", style = {}, fn) {
        let name = node, id = false;
        if (name.indexOf("#") + 1) {
            id = name.split("#")[1];
            name = name.split("#")[0] || "div";
        }
        node = document.createElement(name).addClass(cls).css(style, fn);
        if (id) node.id = id;
        return node;
    }

    static storage(field = null, value = null) {
        if (field == null || field == undefined) return false;
        if (value === null) return window.localStorage.getItem(field);
        window.localStorage.setItem(field, value === false ? "" : value);
        return window.localStorage.getItem(field);
    }

    static clearStorage() {
        Object.keys(window.localStorage).map(x => window.localStorage.removeItem(x))
    }

    static cook(field=null, value=null, days=356){
        if(field){
            let
            date = new Date();
            if(value!==null){
                date.setTime(date.getTime()+(days>0?days*24*60*60*1000:days));
                document.cookie = field+"="+value+"; expires="+date.toGMTString()+"; path=/";
            }else{
                field += "=";
                document.cookie.split(';').each(c => {
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if(c.indexOf(field)==0) value = c.substring(field.length,c.length);
                });
                return value
            }
        }
    }

    static ucook(field=null){
        if(field) fw.cook(field,"",-1);
    }

    static is_mobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    static colors(color = "light") {
        const clrs = fw.pallete ;;
        return color && clrs[color] ? clrs[color] : clrs
    }

    static sanitize(str) {
        return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+')
    }

    static async sleep(time = ANIMATION_LENGTH) {
        return new Promise(function (ok) {
            setTimeout(function () { return ok() }, time)
        })
    }

    static iterate(s, e, fn, step = 1) {
        const x = [];
        if (!fn) fn = i => i;
        s = s || 0;
        e = e || s + 1;
        for (let i = s; i != e; i += step) x.push(fn(i));
        return x;
    }

    static clean(w) {
        return w.replace(/[^-0-9a-zÀ-ÿ]/gui, ' ').replace(/\s+/gui, ' ').trim()
    }

    static makeBase64ImgFromUrl(url, fn){
        const
        img = new Image()
        ;
        img.onload = function(){
            let
            canvas = document.createElement('canvas')
            , ctx = canvas.getContext('2d')
            , data
            ;;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            data = canvas.toDataURL();
            canvas = null;
            fn(data)
        };
        img.crossOrigin = 'Anonymous';
        img.src = url;
    }

    static rgb2hex(color) {
        let
        hex = "#";
        if(!Array.isArray(color)) color = color.split(/[\s+,.-]/g);
        color.slice(0,3).each(clr => {
            let
            tmp = (clr*1).toString(16);
            hex += tmp.length == 1 ? "0" + tmp : tmp
        });
        if(color[3]) hex += (255*color[3]).toString(16)
        return hex.substring(0,9)
    }

    static hex2rgb(color) {
        let
        rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})|([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return  rgb ? [ parseInt(rgb[1] || 255, 16), parseInt(rgb[2] || 255, 16), parseInt(rgb[3] || 255, 16), parseInt(rgb[3] || 255, 16) ] : null;
    }

    static em2px(n=1) {
        return parseFloat(getComputedStyle(document.body).fontSize)*n;
    }

    static download(data, filename, filetype="text"){
        if(!data) return;
        if(!filename) filename = 'fw.txt';
        if(typeof data === "object") data = JSON.stringify(data);
        var
        blob = new Blob([data], {type: filetype})
        , e = document.createEvent('MouseEvents')
        , a = document.createElement('a')
        ;;
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl =  [ filetype, a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }

    static copy2clipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    static enableDragging() {

        $(".--drag-trigger, .--drag").each((x, i) => {

            if (x.has(".--drag-enabled")) return;

            var ax = 0, ay = 0, bx = 0, by = 0;
            const
                tgt = x.has("--drag") ? x : x.upFind("--drag-target")
                , dragselect = e => {
                    e.preventDefault();
                    bx = e.clientX;
                    by = e.clientY;
                    document.onmouseup = dragend;
                    document.onmousemove = dragstart;
                }
                , dragstart = e => {
                    e.preventDefault();
                    tgt.style.transition = 'none';
                    tgt.style.transitionDelay = "0s";
                    ax = bx - e.clientX;
                    ay = by - e.clientY;
                    bx = e.clientX;
                    by = e.clientY;
                    tgt.style.top = (tgt.offsetTop - ay) + "px";
                    tgt.style.left = (tgt.offsetLeft - ax) + "px";
                }
                , dragend = e => {
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
                ;;

            if (tgt == $('#app')[0]) return;

            x.attr({ draggable: "true" }).onmousedown = dragselect;

            x.addClass("--drag-enabled");
        })
    }

    static tileClickEffectSelector(cls = null, clr = null) {
        if (!cls) return;
        $(cls).each((x, i) => {
            if (!x.has("--effect-selector-attached")) {
                x.addClass("-no-scrolls").on("click", function (e) {
                    if (this.classList.contains("-skip")) return;
                    let
                        bounds = this.getBoundingClientRect()
                        , size = Math.max(bounds.width, bounds.height);
                    this.app(TAG("span", "-absolute", {
                        background: clr || (fw.color().FONT + "66")
                        , display: "inline-block"
                        , borderRadius: "50%"
                        , width: size + "px"
                        , height: size + "px"
                        , opacity: .4
                        , top: e.layerY + "px"
                        , left: e.layerX + "px"
                        , transformOrigin: "center center"
                        , transform: "translate(-50%, -50%) scale(0)"
                    }, x => x.anime({ transform: "translate(-50%, -50%) scale(1.5" }, ANIMATION_LENGTH / 2).then(x => x.desappear(ANIMATION_LENGTH / 4, true))))
                }).addClass("--effect-selector-attached")
            }
        })
    }

    static tooltips() {
        var ttip = document.getElementById('tooltip');
        if (!ttip) {
            document.getElementById("app").app(
                TAG("tooltip#tooltip", "-fixed --tooltip-element", {
                    padding: ".5em"
                    , borderRadius: ".25em"
                    , border: "1px solid " + fw.color('FONT') + '44'
                    , background: fw.color("BACKGROUND")
                    , color: fw.color("FONT")
                    , display: "none"
                    , zIndex: 9999
                })
            )
            $("tooltip#tooltip").on("mouseleave", function(){ this.css({ display: "none" }) })
        }
        $(".--tooltip").each(tip => {
            tip.on(EEvents.MOUSEENTER, function (e) {
                if(!this.dataset.tip) return;
                document.getElementById("tooltip").css({ display: 'none' }).html(this.dataset.tip == "@" ? this.textContent : this.dataset.tip).css({
                    display: "block"
                    , background: this.dataset.tipbg || fw.color("BACKGROUND")
                    , color: this.dataset.tipft || fw.color("FONT")
                    , width: this.dataset.tipwidth||'auto'
                })
            }).on(EEvents.MOUSEMOVE, function (e) {
                const tgt = document.getElementById("tooltip");;
                tgt.style.top = (24 + e.clientY) + "px";
                tgt.style.left = (24 + e.clientX) + "px";
                tgt.style.transform = (e.clientX > window.innerWidth * .85) ? 'translateX(calc(-100% + -48px))' : 'translateX(0)';
            }).on(EEvents.MOUSELEAVE, function () { document.getElementById("tooltip").css({ display: "none" }) });
        }).removeClass("--tooltip")
    }

    static async delay(ms=1000) {
        return new Promise(res => setTimeout(res, ms));
    }


    static $(wrapper = null, context = document) {
        const t = [].slice.call(context.querySelectorAll(wrapper));
        // return wrapper && wrapper[0] == '#' ? t[0] : t
        return t
    }

};

const
maxis = { x: 0, y: 0 }
, initpool = new pool()
, $ = fw.$
, bootloader = new Loader()
, App = fw
, include = (path, args) => {
    if($('#scr-'+path.hash()).length) return
    const s = document.createElement('script') ;;
    s.id = `scr-${path.hash()}`
    s.type = 'text/javascript'
    s.src = path.indexOf(".js") + 1 ? path : path + '.js'
    s.args = args || {}
    document.getElementsByTagName('head')[0].appendChild(s)
}
, GET = async (url, callback, args, head) => {
    var res = await fw.call(url + (args ? `?${new URLSearchParams(args).toString()}` : ''), null, 'GET', head) ;;
    try { res = JSON.parse(res.data) } catch(e) { res = res.data }
    return callback ? callback(res) : res
}
, POST = async (url, args, callback, head) => {
    var res = await fw.call(url, args, 'POST', head) ;;
    try { res = JSON.parse(res.data) } catch(e) { res = res.data }
    return callback ? callback(res) : res
}
;;

window.onmousemove = e => window.maxis = e
window.oncontextmenu = e => {
    let trigger, evs = [] ;;
    if(e.path) e.path.forEach(e => {
        if(e?.dataset?.contextevent) {
            evs.push(e.dataset.contextevent)
            if(!trigger) trigger = e
        }
    })
    else if(e.target || e.srcElement) {
        let el = e.target || e.srcElement ;;
        do {
            if(el.dataset.contextevent) {
                evs.push(el.dataset.contextevent)
                if(!trigger) trigger = el
            }
            el = el.parent()
        } while(el.tagName != 'HTML')
    }
    try{
        if(evs.length && fw.contextEvents && fw.contextEvents[evs[0]]) fw.contextEvents[evs[0]](trigger, e)
    } catch(er) {
        console.trace(er)
    }
    return false
}

document.addEventListener("touchstart", function() {}, true);

console.log(`  ____ _     ___   __  __  ___  ____  _____\n / ___| |   |_ _| |  \\/  |/ _ \\|  _ \\| ____|\n| |   | |    | |  | |\\/| | | | | | | |  _|\n| |___| |___ | |  | |  | | |_| | |_| | |___\n \\____|_____|___| |_|  |_|\\___/|____/|_____|\n\n`);