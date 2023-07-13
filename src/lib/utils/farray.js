/**************************************************************************
 * FArray
 ***************************************************************************/

global.EArrayOperations = Object.freeze({
    SUM             : 0
    , AVERAGE       : 1
    , HARMONIC      : 2
    , TREND         : 3
    , PROGRESS      : 4
    , INTERPOLATE   : 5
    , MAX           : 6
    , MIN           : 7
    , RELATIFY      : 8
})

global.EArrayCasts = Object.freeze({
    STRING          : 0
    , FLOAT         : 1
    , INT           : 2
})

module.exports = class fArray extends Array {
    /**
     * @deprecated, use fArray.cast(arr) instead
     * @param {*} arr as []
     * @returns new fArray
     */
    static instance(arr){
        return fArray.cast(arr||[])
    }

    static cast(arr){
        return new fArray(...(arr || arguments))
    }

    tiny(n=10){
        if(this.length <= n) return this;
        let
        narr=[ this.first() ]
        , x = Math.floor(this.length / (n-1))
        , i = x
        ;
        while(i<this.length-1){
            narr.push(this[i]||null);
            i+=x;
        }
        narr.push(this.last())
        return narr.clear()
    }

    json(){ return JSON.stringify(this); }

    clone() { return this.slice(0) }

    each(fn) { if(fn) { for(let i=0;i++<this.length;) fn.bind(this[i-1])(this[i-1], i-1); } return this }

    static foreach(arr, callback){
        arr.map(callback)
        return arr
    }

    extract(fn=null){
        if(!fn||!this.length) return this;
        let
        narr = [];
        this.each((o,i) => {
            let
            x = fn.bind(o)(o,i);
            if(x!=null && x!=undefined && x!=false) narr.push(x)
        })
        return new fArray(...narr)
    }
    fill(n=1, v=null){
        let x = this;
        fw.iterate(0, Math.max(1,n), i => x[i] = x[i] || v.prepare({i:i}));
        return x
    }
    mutate(fn){
        if(!fn) return this;
        return this.extract((x, i) => { return fn(x,i) })
    }
    cast(filter=STRING){
        return this.extract(x => { return filter==STRING ? x + "" : (filter==FLOAT ? x * 1.0 : x*1) })
    }
    fit(n=10){
        let
        narr=[ this.first() ]
        , x = this.length / (n-1)
        , i = x
        ;
        while(i<this.length){
            narr.push(this.calc(TREND, i));
            i+=x;
        }
        narr.push(this.last())
        return narr
    }
    calc(type=SUM, helper=null){
        let
        res = 0;
        switch (type){
            case (SUM): this.each(x=>res+=x); break
            case (AVERAGE): this.each(x=>res+=x); res=res/this.length; break
            case (HARMONIC): this.each(x=>res+=1/x); res=this.length/res; break
            case (TREND): {
                let
                m, b, x, y, x2, xy, z, np = this.length;
                m = b = x = y = x2 = xy = z = 0;
                if(!helper) helper = np;
                this.each((n, i) => {
                    x = x + i;
                    y = y + n;
                    xy = xy + i * n;
                    x2 = x2 + i * i;
                });
                z = np*x2 - x*x
                if(z){
                    m = (np*xy - x*y)/z;
                    b = (y*x2 - x*xy)/z;
                }
                res = m * helper + b
            } break

            /* TODO POLINOMIAL FORMULA */
            case (INTERPOLATE): {
                if(helper==null||helper==undefined) return fw.error("Ops! a 'x' value is needed for array basic interpolation...")
                let
                x = helper
                , yi = this.extract(_y => Array.isArray(_y) ? _y[1] : _y*1)
                , xi = yi.extract((_x, i) => Array.isArray(_x) ? _x[0] : i*1)
                , N  = xi.length
                , sum = 0
                ;;

                xi.each((k, ki) => {
                     let
                     product = 1;
                    xi.each(j => {
                         if(k!=j) product = product * (x-j) / (k-j);
                    })
                     sum += yi[ki] * product;
                })

                res = sum;
            } break;

            case (PROGRESS): {
                let
                me = this;
                res = this.extract((x,i)=>{ return i ? me[i]/me[i-1] : 1 }).calc(AVERAGE)
            }break;
            case (MAX): {
                res = Number.MIN_SAFE_INTEGER;
                this.each(x=>res=Math.max(res,x))
            }break;
            case (MIN): {
                res = Number.MAX_SAFE_INTEGER;
                this.each(x=>res=Math.min(res,x))
            }break;
            case (RELATIFY): {
                res = this.calc(MAX);
                res = this.extract(x=>x/res)
            }break;
        }
        return res;
    }
    fillNulls(){
        let
        final
        , nulls = []
        , narr = this.extract((el,i) => {
            let
            y = Array.isArray(el) || el instanceof fArray ? el[1] : el
            , x = Array.isArray(el) || el instanceof fArray ? el[0] : i
            ;;
            if(y==null || y==undefined) nulls.push(x);
            else return [ x, y ];
        })
        nulls.each(n => narr.push([ n, narr.calc(INTERPOLATE, n)]));
        narr.sort(function(a,b){ return a[0] - b[0] })
        return narr;
    }
    last(n=null) {
        if (!this.length) return null;
        if (n === null) return this[this.length - 1];
        return this.slice(Math.max(this.length - n, 0));
    }
    first(n=null) {
        if (!this.length) return null;
        if (n === null) return this[0];
        return this.slice(0, n);
    }
    at(n=0) {
        if(n>=0) return this.length>=n ? this[n] : null;
        return this.length > n*-1 ? this[this.length+n] : null
    }
    rand(){
        return this[Math.floor(Math.random()*this.length)]
    }
    not(el) {
        let
        arr = this;
        while(arr.indexOf(el)+1) arr.splice(arr.indexOf(el),1);
        return arr;
    }
    empty(){
        for(var i=this.length;i--;) this[i] = null;
        return this
    }
    clear(){
        return this.extract(n => {
            return n!=null && n!=undefined && n!=NaN ? (n instanceof String ? n+"" : (n instanceof Number ? n*1 : n)) : null
         })
    }
    array(){
        return [...this]
    }

}
