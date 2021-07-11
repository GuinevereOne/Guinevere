class StringUtils {
    static ParseNReplace(string, obj) {
        return string.replace(new RegExp(Object.keys(obj).join('|'), 'gi'), (matched) => obj[matched]);
    }

    static RandomString(n) {
        return Math.random().toString(36).slice(-n);
    }

    static CapitalFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.substr(1);
    }

    static RemoveEndPunctuation(string) {
        const punctuation = ['.', ';', ':', '?', '!'];

        if(punctuation.includes(string[string.length - 1])) 
            return string.substr(string, string.length - 1);
        
        return string;
    }

    static SnakeToPascalCase(string) {
        return string.split("_").map(str => StringUtils.CapitalFirstLetter(str)).join("");
    }
}

module.exports = {
    StringUtils
}