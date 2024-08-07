module.exports = class {
    // 格式化數字
    static format = (number, digits = 3) => {
        if (typeof number !== 'number') {
            throw `${number} is not a number`;
        }
        return number.toLocaleString('en-US', {
            maximumFractionDigits: digits
        });
    };

    static generateRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
};
