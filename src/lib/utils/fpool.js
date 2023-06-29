module.exports = class fPool {
    add(x=null,v=null) {
        if(x) {
            if(Array.isArray(x)) x.map(_x => this.add(_x));
            else{
                if(typeof x === 'function') this.execution.push(x);
                else this.conf(x,v)
            }
        }
        return this;
    }
    push(x) {
        this.add(x);
        return this
    }
    conf(k=null,v=null) {
        if(k!==null) this.setup[k]=v;
        return this
    }
    fire(x=null) {
        if(typeof x == "function"){
            this.add(x);
            x=null
        }
        for(let i in this.execution){
            if(this.execution[i]) {
                this.timeserie[i] = this.execution[i](fw.blend(this.setup, x));
                if(x.sync && this.timeserie[i] instanceof Promise)(async _ => await this.timeserie[i])();
            }
        }
        return this
    }
    constructor(x) {
        this.timeserie = new fArray();
        this.execution = new fArray();
        this.setup = new fObject();
        return this.add(x)
    }
}