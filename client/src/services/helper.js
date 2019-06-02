export default {
    copy(toCopy) {
        if (Array.isArray(toCopy)) {
            return JSON.parse(JSON.stringify(toCopy));
        }
    }
};