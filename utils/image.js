'use strict';
const URL = require('url');
module.exports = class {
    // 解析度是否支援
    // 檔案大小是否支援
    static preVerify = async (
        inputFilePath,
        { checkSupportFileSize = true, checkSupportResolution = true }
    ) => {
        const isSupportFileSize = async (fileSize) => {
            const MB_50 = 52428800;
            const minSize = 0;
            const maxSize = MB_50;
            if (fileSize > maxSize || fileSize < minSize) throw 'file size not supported';
        };

        const isSupportResolution = async (type, width, height) => {
            let maxResolution = type === 'webp' ? 16383 : 65535;
            if (width >= maxResolution || height >= maxResolution) throw 'resolution not supported';
            if (width <= 0 || height <= 0) throw 'resolution not supported';
        };

        try {
            const inputFileURL = URL.pathToFileURL(inputFilePath).href;
            const blob = await fetch(inputFileURL).then((res) => res.blob());
            const type = blob.type.split('/')?.[1];
            const input_img = await this.create(inputFileURL);
            if (checkSupportFileSize) {
                await isSupportFileSize(blob.size);
            }
            if (checkSupportResolution) {
                await isSupportResolution(type, input_img.width, input_img.height);
            }
        } catch (error) {
            throw error;
        }
    };

    // 檢查解析度是否相同
    // 檢查檔案直方圖是否損壞
    // 檢查檔案大小是否損壞
    static postVerify = async (
        inputFilePath,
        outputFilePath,
        { checkEqualResolution = true, checkHistograms = true, checkFileSize = true }
    ) => {
        const isEqualResolution = async (
            input_width,
            input_height,
            output_width,
            output_height
        ) => {
            if (!(input_width === output_width && input_height === output_height)) {
                console.error('resolution abnormality');
                throw 'file resolution is not equal';
            }
        };

        const isHistogramsAbnormality = async (image1, image2) => {
            const getImgData = (img) => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return ctx.getImageData(0, 0, img.width, img.height).data;
            };

            const calcHist = (data) => {
                var hist = new Array(256).fill(0);
                for (var i = 0; i < data.length; i += 4) {
                    var r = data[i];
                    var g = data[i + 1];
                    var b = data[i + 2];
                    var gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                    hist[gray]++;
                }
                return hist;
            };

            const compareHist = (hist1, hist2, image1) => {
                var similarity = 0;
                for (var i = 0; i < 256; i++) {
                    similarity += Math.min(hist1[i], hist2[i]);
                }
                similarity = similarity / (image1.width * image1.height);
                return similarity;
            };

            var data1 = getImgData(image1);
            var data2 = getImgData(image2);
            var histogram1 = calcHist(data1);
            var histogram2 = calcHist(data2);
            var similarity = compareHist(histogram1, histogram2, image1);
            if (similarity <= 0.5) {
                console.error('histograms abnormality:' + similarity);
                throw 'file histograms abnormality';
            }
        };

        const isFileSizeAbnormality = async (output_size) => {
            if (output_size <= 0 || output_size > 10000000000) {
                console.error('file size abnormality');
                throw 'file size abnormality';
            }
        };

        const inputFileURL = URL.pathToFileURL(inputFilePath).href;
        const outputFileURL = URL.pathToFileURL(outputFilePath).href;
        const input_img = await this.create(inputFileURL);
        const output_img = await this.create(outputFileURL);
        const input_blob = await fetch(inputFileURL).then((res) => res.blob());
        const output_blob = await fetch(outputFileURL).then((res) => res.blob());
        if (checkEqualResolution) {
            await isEqualResolution(
                input_img.width,
                input_img.height,
                output_img.width,
                output_img.height
            );
        }
        if (checkHistograms) {
            await isHistogramsAbnormality(input_img, output_img);
        }
        if (checkFileSize) {
            await isFileSizeAbnormality(input_blob.size, output_blob.size);
        }
    };

    // 建立圖片
    static create = async (url) => {
        try {
            const img = new Image();
            img.src = url;
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    resolve();
                };
                img.onerror = () => {
                    reject('image load error');
                };
            });
            return img;
        } catch (err) {
            throw err;
        }
    };

    // 轉換格式
    static convert = async (
        img,
        { type = 'png', quality = '1', area = { x: 0, y: 0, width: img.width, height: img.height } }
    ) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = area.width;
            canvas.height = area.height;

            ctx.drawImage(
                img,
                area.x,
                area.y,
                area.width,
                area.height,
                0,
                0,
                canvas.width,
                canvas.height
            );

            return canvas.toDataURL('image/' + type, quality);
        } catch (err) {
            throw err;
        }
    };
};
