module.exports = class fLoader {
    loadLength(){
        return this.loaders.array().extract(n => n*1 ? true : null).length/this.dependencies.length;
    }
    check(scr){
        return scr ? this.loaders[scr] : this.alreadyLoaded
    }
    ready(scr){
        const
        tmp = this;

        this.dependencies.each(x => tmp.loaders[x] = tmp.loaders[x] ? 1 : 0);
        if(scr||scr===0) this.loaders[scr] = 1;

        let
        perc = this.loadLength();

        if(!this.alreadyLoaded&&perc>=1){
            this.alreadyLoaded=true;
            this.onFinishLoading.fire();
        } else if(!this.alreadyLoaded) this.onReadyStateChange.fire(perc);

        return this.alreadyLoaded || false;
    }
    pass(){
        this.dependencies = [ "pass" ];
        return this.ready("pass");
    }
    constructor(dependencies){
        this.alreadyLoaded      = false;
        this.loadComponents     = new fPool();
        this.onReadyStateChange = new fPool();
        this.onFinishLoading    = new fPool();
        this.dependencies       = fArray.instance(dependencies || [ "pass" ]);
        this.loaders            = new fObject();
    }
}