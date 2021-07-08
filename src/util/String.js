class StringUtils {
    static ParseNReplace(string, obj) {
        return string.replace(new RegExp(Object.keys(obj).join('|'), 'gi'), (matched) => obj[matched]);
    }

    static RandomString(n) {
        return Math.random().toString(36).slice(-n);
    }

    static CapitalFirstLetter(string) {
        return string.charAt(0).toUpperCase + string.substr(1);
    }
}

module.exports = {
    StringUtils
}