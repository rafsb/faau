/*   Cron like notation:
 *   -------------------- min 0~59
 *   | ------------------ hour 0~23
 *   | | ---------------- day 1~31
 *   | | | -------------- month 1~12
 *   | | | | ------------ dayweek 0~6 -> sunday=0
 *   | | | | |
 * [ * * * * * ] CAUTION: (*) means every! *****/

const fdate = require('./fdate') ;;

module.exports = class fscheds {

    static ALWAYS          = '* * * * *'
    static QUARTER_HOUR    = '*/15 * * * *'
    static HALF_HOUR       = '*/30 * * * *'
    static HOURLY          = '0 * * * *'
    static TWICE_PER_DAY   = '0 */12 * * *'
    static DAILY           = '0 0 * * *'
    static TWICE_PER_WEEK  = '0 0 * * */4'
    static WEEKLY          = '0 0 * * 0'
    static TWICE_PER_MONTH = '0 0 */16 * *'
    static MONTHLY         = '0 0 1 * *'
    static TWICE_PER_YEAR  = '0 0 1 */6 *'
    static YEARLY          = '0 0 1 1 *'

    static check(sch, tolerance=5) {

        if(!sch) return false;
        sch = sch.split(/\s+/gi);

        const date = fdate.guess(parseInt(fdate.time()/(10000 * tolerance) ) * (10000 * tolerance)).as('i,h,d,m,D').split(',').map(i=>i*1) ;;
        date[0] = parseInt(date[0] / tolerance) * tolerance

        return date.map((v, i) => {

            if(sch[i] == '*' || sch[i]*1 == v) return 1;
            sch[i] = sch[i].split(/\,/gi);

            for(let j=0; j<sch[i].length; j++){
                if(sch[i][j] == '*' || sch[i][j]*1 == v) return 1;
                if(sch[i][j].indexOf('-')+1){
                    const tmp = sch[i][j].split('-') ;;
                    if(v >= tmp[0] && v <= tmp[1]) return 1;
                }
                if(sch[i][j].indexOf('/')+1){
                    const tmp = sch[i][j].replace(/[*/]/gi, '') * 1 ;;
                    if(tmp && !(v/tmp - parseInt(v/tmp))) return 1;
                }
            }

            return null

        }).filter(i=>i).length == date.length

    }

}