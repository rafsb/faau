/*---------------------------------------------------------------------------------------------
 * fdate
 *--------------------------------------------------------------------------------------------*/

global.TS_MASK = "Y-m-dTh:i:s.000Z"

const
text = require('./ftext')
, MONTHS= [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    , "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"
    , "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
    , "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"
]
, DAYS = [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
    , "dom", "seg", "ter", "qua", "qui", "sex", "sáb"
    , "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    , "sun", "mon", "tue", "wed", "thu", "fri", "sat"
]
;;

module.exports = class fdate extends Date {

    plus(n) {
        const date = new Date(this.valueOf());
        date.setDate(date.getDate() + n);
        return new fdate(date)
    }

    moveDays(n) {
        return this.plus(n)
    }

    moveMonths(n, dayone=false) {
        const date = new Date(this.valueOf())
        if(dayone) date.setDate(1)
        date.setMonth(date.getMonth() + n)
        return new fdate(date)
    }

    moveYears(n, dayone=false) {
        return this.moveMonths(n*12, dayone)
    }


    export(format = TS_MASK){
        let
        d = this || fdate.now()
        , arr = format.split("")
        ;;
        arr.forEach(n => {
            switch(n){
                case "Y": format = format.replace(n, d.getFullYear());                                 break;
                case "y": format = format.replace(n, text.fill((d.getYear()-100)    +"", "0", 2, -1)); break;
                case "m": format = format.replace(n, text.fill((d.getMonth()+1)     +"", "0", 2, -1)); break;
                case "d": format = format.replace(n, text.fill(d.getDate()          +"", "0", 2, -1)); break;
                case "h": format = format.replace(n, text.fill(d.getHours()         +"", "0", 2, -1)); break;
                case "i": format = format.replace(n, text.fill(d.getMinutes()       +"", "0", 2, -1)); break;
                case "s": format = format.replace(n, text.fill(d.getSeconds()       +"", "0", 2, -1)); break;
                case "k": format = format.replace(n, text.fill(d.getMilliseconds()  +"", "0", 3, -1)); break;
                case "t": format = format.replace(n, d.getTime());                                     break;
                case "M": format = format.replace(n, MONTHS[d.getMonth()]);                            break;
                case "D": format = format.replace(n, DAYS[d.getDay()]);                                break;
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
        if(date) return (new fdate(date)).isValid();
        else if(this.getTime()) return this
        return null
    }

    now(){
        return new fdate()
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
            if((datestr+'').length == 10) datestr = parseInt(datestr + '000');
            dat = new fdate();
            dat.setTime(datestr);
        } else dat = new fdate(datestr)

        if(dat&&dat.getTime()) return dat
        datestr = (datestr).toLowerCase()

        let
        datefound = null
        , i = 0
        , fmatch = datestr.replace(/[.,-/]/gi, ' ').replace(/\s+/gi, ' ').match(/[a-z]{3}[\s-/][0-9]{2}[\s-/][0-9]{2,4}/gi)
        ;;

        if(fmatch?.length){
            datestr = fmatch[0].split(/[\s-/]/gi);
            datestr = datestr[1] + '-' + datestr[0] + '-' + datestr[2]
        }

        MONTHS.map((m, i) => datestr = datestr.replace(m, text.fill(((i++%12)+1)+"", "0", 2, -1)));
        datestr = datestr.replace(/[^a-z0-9:]|(rd|th|nd|de)/gi, ' ').replace(/\s+/gi, ' ').trim();

        const dt = datestr.match(/(\d{2,4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{2,4})/g);
        if(dt&&dt.length) {
            datefound = dt[0].replace(/\s+/gi, '-')
            let dat ;;
            dat = datefound.match(/\d{2}\-\d{2}\-\d{4}/gi) // xx/xx/xxxx
            if(dat&&dat.length) datefound = dat[0].split('-').reverse().join('-')
            dat = datefound.match(/\d{2}\-\d{2}\-\d{2}\b/gi) // xx/xx/xx
            if(dat&&dat.length) datefound = dat[0].split('-').reverse().map((x, i) => i ? x : `20${x}`).join('-')

            datefound = datefound.slice(0, 10)
        }

        datefound = datefound ? new fdate(datefound) : false;

        return datefound && datefound.as('Y')*1 > 1000 ? datefound : false
    }

    static now(){
        return new fdate()
    }

    static plus(n=1){
        return fdate.now().plus(n)
    }

    static moveDays(n) {
        return this.plus(n)
    }

    static moveMonths(n, dayone=false) {
        return (new fdate()).moveMonths(n, dayone)
    }

    static moveYears(n, dayone=false) {
        return this.moveMonths(n*12, dayone)
    }

    static time(){
        return Date.now()
    }

    static at(n){
        return fdate.now().plus(n)
    }

    static as(format=TS_MASK){
        return fdate.now().export(format)
    }

    static format(format){
        return fdate.now().export(format)
    }

    static cast(date){
        return new fdate(date || new Date)
    }

    static yday(){
        return parseInt(fdate.plus(-1).getTime()/1000)*1000
    }

    static tday(){
        return parseInt(fdate.time()/1000)*1000
    }
}