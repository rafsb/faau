const
EColors = {
    ALIZARIN:"#E84C3D"
    , PETER_RIVER:"#2C97DD"
    , SUN_FLOWER:"#F2C60F"
    , AMETHYST:"#9C56B8"
    , TURQUOISE:"#00BE9C"
    , EMERLAND: "#39CA74"
    , POMEGRANATE: "#BE3A31"
    , BELIZE_HOLE: "#2F81B7"
    , ORANGE: "#F19B2C"
    , WISTERIA: "#8D48AB"
    , GREEN_SEA: "#239F85"
    , NEPHRITIS: "#30AD63"
}
;;

window.EChartTypes = Object.freeze({
	LINE: 			 0
	, BAR: 			 1
	, WAVE: 		 2
	, CURVE: 		 3
	, SMOOTH: 		 4
	, GROUPED_BAR: 	 5
	, STACK_BAR:   	 6
	, STACK_LINE:	 7
	, STACK_WAVE:    8
	, STACK_LINE: 	 9
	, QUADRATIC:    10
})

class FGraph {

    axis(o){
        if(o.node){
            // Y axis
            !o.noyaxis && o.node.app(
                SVG("path", "--axis --y", { d: `M 0,0 V ${rects.height}` }, { strokeWidth: o.strokeWidth, fill: "none", stroke: o.strokeColor })
            );
            // X axis
            !o.noxaxis && o.node.app(
                SVG("path", "--axis --x", { d: `M 0,${rects.height} H ${rects.width}` }, { strokewidth: o.strokeWidth, fill: "none", stroke: o.strokeColor })
            )
        }
    }

    guides(o){
        if(o.node){
            const
            ydots   = 2 + (o.ydots || 2)
            , xdots = 2 + (o.xdots || 4)
            , ypace = o.rects.height / ydots
            , xpace = o.rects.width / xdots
            ;;
            // Y Guides
            !o.noxguides && app.iterate(0, xdots, i => {
                o.node.app(
                    SVG("path", "--guide --x", { d: [ "M", [ i * xpace, 0 ], "V", rects.height ].join(" ") }, { stroke: o.strokeColor, strokeWidth: o.strokeWidth })
                )
            });
            // X Guides
            !o.noyguides&&app.iterate(0, ydots, i => {
                node.app(
                    SVG("path", "--guide --y", { d: [ "M", [ 0, i * ypace ], "H", rects.width ].join(" ") }, { stroke: o.strokeColor, strokeWidth: o.strokeWidth })
                )
            });
        }
    }

    // LINE, WAVE, SMOOTH, CURVE and QUADRATIC
    __DrawLines(o){
        const
        set = o.dataset.extract(x => x.status ? x : null)
        , xmax    = o.colls ? o.colls : set.extract(item => item.plot.length).calc(MAX)
        , ymax  = Math.max(1, set.extract(item => item.plot.calc(MAX)).calc(MAX) * (o.roof||1.01))
        , xpace = o.rects.width / xmax
        , h     = o.rects.height + 4
        ;;

        set.each((item, i) => {

            if(!item.plot) return;

            const
            serie = item.plot//.tiny(xmax)
            , color = item.color ? item.color : PRISM.array()[ i % PRISM.array().length ]
            ;;

            var
            type = item.type || o.type
            , d = [ "M" ]
            ;;

            switch(type) {
                case EChartTypes.SMOOTH    : type = "S"; break;
                case EChartTypes.WAVE      : type = "S"; break;
                case EChartTypes.QUADRATIC : type = "Q"; break;
                case EChartTypes.CURVE     : type = "C"; break;
                default                    : type = "L"; break;
            };

            serie.each((n, i) => {
                n = Math.max(n, 0.01);
                const
                x = parseInt(xpace / 2 + i * xpace)
                , y = parseInt(Math.max(0, Math.min(h - h * n / ymax, h))) + 2
                ;;
                if(!i){
                    d.push([ 0, y ]);
                    d.push(type)
                }
                if(type=="C") d.push([ parseInt(x - xpace / 8 * 6), y ]);
                if(type=="C") d.push([ parseInt(x - xpace / 8 * 2), y ]);
                if(type=="S" || type=="Q") d.push([ parseInt(x - xpace / 4), y ]);
                d.push([ x , y ]);
            });

            const final_y = parseInt(Math.max(0, Math.min(h - h * serie.last() / ymax, h) + 2)) ;;
            if(type=="C") d.push([ parseInt(o.rects.width - xpad / 8 * 6), final_y ]);
            if(type=="C") d.push([ parseInt(o.rects.width - xpad / 8 * 2), final_y ]);
            if(type=="S" || type=="Q") d.push([ o.rects.width, final_y ]);
            d.push([ o.rects.width , final_y ]);

            if(o.type == EChartTypes.WAVE || o.type == EChartTypes.STACK_WAVE) d = d.concat([ 'V', h, 'H', 0, 'V', parseInt(Math.max(0, Math.min(h - h * serie[0] / ymax, h))), 'Z' ])

            o.node.app(SPATH(d.join(" "), "--line -avoid-pointer", {
                fill: o.type == EChartTypes.WAVE || o.type == EChartTypes.STACK_WAVE ? color : "none"
                , stroke: color
                , "stroke-width": 3
            }))
        })
    }

    // LINE, WAVE, SMOOTH, CURVE
    __DrawBars(o, set){
        const
        xmax           = o.colls ? o.colls : set.plot.calc(MAX)
        , ymax         = Math.max(1, set.extract(item => item.plot.length).calc(MAX) * (o.roof||1.01))
        , xpace        = o.rects.width / xmax
        , bar_per_unit = set.extract(item => item.plot.length).calc(MAX)
        , h            = o.rects.height
        , w            = Math.min(xpace / 2, o.barWidth || o.fsize)
        ;;
        set.extract((item, i) => {
            if(!item.plot) return;
            const
            serie = item.plot//.tiny(xmax)
            , color = item.color ? item.color : PRISM.array()[i % PRISM.array().length]
            ;;
            serie.each((n, j) => {
                n = n ? n : .001;
                const
                x = j * xpace + xpace / bar_per_unit * i + w
                , y = Math.max(o.fsize, Math.min(h - h * n / ymax, h))
                ;;
                o.node.app(SVG("rect", "-avoid-pointer", { width: w, height: h - y, x: x - w / 2, y: y }, { fill: color }))
            })
        })
    }

    // LINE, WAVE, SMOOTH, CURVE
    __DrawGBars(o){
        const
        set = o.dataset.extract(x => x.status ? x : null)
        , serie   = set.extract((item, i) => item.plot ? item.plot.calc(SUM) || .001 : .001)
        , ymax  = Math.max(1, serie.calc(MAX) * o.roof)
        , xpace = o.rects.width / serie.length
        , h     = o.rects.height
        , w     = Math.min(xpace / 2, o.barWidth || o.fsize)
        ;;
        serie.each((n, i) => {
            const
            rec = set[i]
            , color = rec.color ? rec.color : PRISM.array()[i % PRISM.array().length]
            , y = Math.max(o.fsize, Math.min(h - h * n / ymax, h))
            , x =  xpace / 2 + i * xpace
            ;;
            o.node.app(SVG("rect", "-avoid-pointer --bar", { width: w, height: h - y, x: x - w / 2, y: y }, { fill: color }))
        })
    }

    // LINE, WAVE, SMOOTH, CURVE
    __DrawSBars(o){
        const
        set     = o.dataset.extract(x => x.status ? x : null)
        , serie = set.extract((item, i) => item.serie ? item.serie.extract(x => x.length) : [])
        , len   = serie.extract((serie, i) => serie.length).calc(MAX)
        , xpace = o.rects.width / len
        , h     = o.rects.height
        , w     = Math.min(xpace / 2, o.barWidth || o.fsize)
        , plot  = (new Array(len)).fill(0)
        , flat  = (new Array(len)).fill(0)
        ;;

        serie.each(s => s.each((n, j) => flat[j] += n)) ;;
        const ymax  = flat.calc(MAX) * o.roof ;;

        serie.each((n, i) => {
            const
            color = set[i].color ? set[i].color : PRISM.array()[i % PRISM.array().length]
            ;;
            n.each((e, j) => {
                const
                x   = xpace / 2 + j * xpace
                , y = h * (e / ymax + plot[j])
                ;;
                plot[j] += (e / ymax);
                o.node.pre(SVG("rect", "-avoid-pointer", { width: w, height: h, x: x - w / 2, y: h - y }, { fill: color }))
            })
        })
    }

    draw(o){
        if(o.target&&o.node){
            if([ EChartTypes.LINE, EChartTypes.WAVE, EChartTypes.CURVE, EChartTypes.SMOOTH, EChartTypes.QUADRATIC ].indexOf(o.type) + 1) this.__DrawLines(o);
            else if(o.type == EChartTypes.BAR) this.__DrawBars(o);
            else if(o.type == EChartTypes.GROUPED_BAR) this.__DrawGBars(o);
            else if(o.type == EChartTypes.STACK_WAVE) {
                o.type = EChartTypes.WAVE;
                this.__DrawLines(o);
            } else if(o.type == EChartTypes.STACK_BAR) this.__DrawSBars(o)

            if(o.type == EChartTypes.GROUPED_BAR){
                o.node.app(
                    SVG("rect", "-hint-plate -pointer --tooltip", { width: o.rects.width, height: o.rects.height, x: 0, y: 0 }, {
                        fill: app.color("FONT") + '44'
                        , opacity: 0
                    }).data({ emitter: 'all', tip: o.dataset.extract((set, j) => {
                        return set.status && set.plot ?
                        `<b class='-row -flex' style='color:${set.color || PRISM.array()[i % PRISM.array().length]}'>\
                            <span class='col-8 -content-left'>${set.label}:</span>\
                            <span class='-col-4 -content-right' style='margin-left:1em'>${set.plot.calc(SUM).nerdify()}</span>\
                        </b>` : null
                    }).join('') })
                )
            } else {
                const
                xmax = o.colls ? o.colls : o.dataset.extract((set, i) => set.plot.calc(MAX) || 1).calc(MAX)
                , xpace = o.rects.width / xmax
                ;;
                app.iterate(0, xmax, i => {
                    const
                    plate = $(".-hint-plate", o.node)[i]
                    , x = parseInt(i * xpace)
                    ;;
                    if(!plate) o.node.app(
                        SVG("rect", "-hint-plate -pointer --tooltip", {
                            width: xpace
                            , height: o.rects.height
                            , x: x
                            , y: 0
                        }, {
                            fill: app.color("FONT") + '44'
                            , opacity: 0
                        }).data({ emitter: i, tip: o.dataset.extract((set, j) => {
                            return set.status && set.plot ?
                            `<b class='-row -flex' style='color:${o.dataset[j].color || PRISM.array()[i % PRISM.array().length]}'>\
                                <span class='col-8 -content-left -ellipsis'>${o.dataset[j].label}:</span>\
                                <span class='-col-4 -content-right'>${(set.plot[i] ? set.plot[i] : 0).nerdify()}</span>\
                            </b>` : null
                        }).join('') })
                    )
                })

                $(".-hint-plate", o.node).each((el, i) => el.on("mouseenter", function(){
                    $("#" + o.node.uid() + " .-hint-plate").not(this).each((el, i) => el.anime({ opacity: 0 }));
                    this.css({ opacity: .32 })
                    o.node.plate_emitter = this.dataset.emitter == 'all' ? null : this.dataset.emitter * 1
                }).on("mouseleave", function(){
                    $("#" + o.node.uid() + " .-hint-plate").each((el, i) => el.stop().anime({ opacity: .08 }))
                }))
            }

            o.target.get('.-hint-plate').each((e, i) => e.raise())
            app.tooltips();
        }
    }

    constructor(o) {
        o.target = (o.target || $("#app")[0]).css({ overflow: 'hidden' }).empty()
        o.rects  = o.target.getBoundingClientRect()
        o.css    = binds({ background: app.color("BACKGROUND") }, o.css || {})
        o.type   = o.type || EChartTypes.SMOOTH
        o.colls  = o.colls || (o.dataset ? o.dataset.extract((x, i) => x.plot ? x.plot.length || 1 : 1).calc(MAX) : 12)
        o.roof   = o.roof || 1.1
        o.fsize  = app.em2px()
        o.node   = SVG("svg", "-absolute -zero", binds({
            height: o.rects.height
            , width: o.rects.width
            , "viewBox": "0 0 " + o.rects.width + " " + o.rects.height
        }, o.attr || {}), o.css)

        o.target.app(o.node)

        const base = { color: app.pallete.FONT+"AA", strokeColor: app.pallete.FONT+"22", strokeWidth: 2} ;;
        if(!o.noaxis) o.axis(binds(base, o.axis || {}));
        if(!o.noguides) o.guides(binds(base, o.guides || {}));

        if(o.dataset && o.dataset.length) this.draw(o)
        this.node = o.node
    }

    static create(o){
        return new FGraph(o)
    }
}