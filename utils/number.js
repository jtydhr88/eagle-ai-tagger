module.exports = class {
    // 格式化數字
    static format = (size, digits = 1) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let i = 0;

        const divisor = eagle.app.isMac ? 1000 : 1024;

        for (let j = 0; j < 2; j++) {
            if (size >= divisor) {
                size /= divisor;
                i++;
            }
        }

        const digit = size.toLocaleString('en-US', { maximumFractionDigits: digits });

        return `${digit} ${sizes[i]}`;
    };
};
