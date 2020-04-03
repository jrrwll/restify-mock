const {unBackslash} = require('./strings');

const nf = v => `${v < 10 ? "0" + v : v}`;
const nf2 = v => `${v < 10 ? "00" + v : (v < 100 ? "0" + v : v)}`;
const monthF = v => ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][v - 1];
const monthF2 = v => ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"][v - 1];
const quarterF = v => ["Spring", "Summer", "Autumn", "Winter"][v - 1];
const dayF = v => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][v];
const dayF2 = v => ["Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"][v];

/// Exports

Date.prototype.format = function (fmt){
    fmt = unBackslash(fmt);
    if (!fmt) return "";

    const o = [
        ["yyyy", this.getFullYear()],
        ["yy", this.getFullYear() % 100],
        ["y", this.getFullYear() % 100],
        ["MMMM", this.getMonth() + 1, monthF2],
        ["MMM", this.getMonth() + 1, monthF],
        ["MM", this.getMonth() + 1, nf],
        ["M", this.getMonth() + 1],
        ["dd", this.getDate(), nf],
        ["d", this.getDate()],
        ["hh", this.getHours(), nf],
        ["h", this.getHours()],
        ["mm", this.getMinutes(), nf],
        ["m", this.getMinutes()],
        ["ss", this.getSeconds(), nf],
        ["s", this.getSeconds()],
        ["SSS", this.getMilliseconds(), nf2],
        ["SS", this.getMilliseconds()],
        ["S", this.getMilliseconds()],
        ["Q", Math.floor((this.getMonth() + 3) / 3), quarterF],
        ["q", Math.floor((this.getMonth() + 3) / 3)],
        ["w", this.getDay()],
        ["W", this.getDay(), dayF],
        ["WW", this.getDay(), dayF2],
    ];

    for (let i in o) {
        let k = o[i][0];
        let v = o[i][1];
        let f = o[i][2];
        if (f) v = f(v);
        while (
            new RegExp("(" + k + ")").test(fmt)
            ) {
            fmt = fmt.replace(RegExp.$1, `${v}`);
        }
    }
    return fmt;
};
