"use strict";

module.exports = class {
    // 等待元素下所有圖片載入完成
    static imgLoad = async (children) => {
        for (const element of children) {
            if (element.tagName === "IMG" && !element.complete) {
                await new Promise((resolve, reject) => {
                    element.onload = resolve;
                    element.onerror = reject;
                });
            }
            await this.bind(element.children);
        }
    };

    // 等待
    static sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // 去抖動
    static debounce = (func, delay = 250) => {
        let timer = null;

        return function (...args) {
            let context = this;

            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    };

    // 節閥
    static throttle = (func, timeout = 250) => {
        let last;
        let timer;

        return function () {
            const context = this;
            const args = arguments;
            const now = +new Date();

            if (last && now < last + timeout) {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    last = now;
                    func.apply(context, args);
                }, timeout);
            } else {
                last = now;
                func.apply(context, args);
            }
        };
    };
};
