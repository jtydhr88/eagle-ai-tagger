'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

module.exports = class {
    // 建立文件資料夾
    static createFolder = async (folderPath) => {
        folderPath = path.normalize(folderPath);
        try {
            if (!fs.existsSync(folderPath)) {
                console.log(`start create folder, path: ${folderPath}`);
                await fs.promises.mkdir(folderPath, { recursive: true });
                console.log(`start create folder`);
            }
        } catch (error) {
            throw error;
        }
    };
    // 刪除文件資料夾
    static deleteFolder = async (folderPath) => {
        folderPath = path.normalize(folderPath);
        try {
            if (!(await this.exist(folderPath))) return;
            console.log(`start delete folder, path: ${folderPath}`);
            await fs.promises.rmdir(folderPath, { recursive: true });
            console.log(`end delete folder`);
        } catch (error) {
            throw error;
        }
    };
    static replace = async (sourcePath, targetPath) => {
        sourcePath = path.normalize(sourcePath);
        targetPath = path.normalize(targetPath);
        try {
            console.log(`start replace file, sourcePath:${sourcePath}, targetPath:${targetPath}`);

            await fs.promises.copyFile(sourcePath, targetPath);

            console.log(`end replace file`);
        } catch (error) {
            throw error;
        }
    };
    static saveAs = async (sourcePath, targetPath) => {
        // 檢查檔案是否存在
        const hasFile = async (filePath) => {
            try {
                await fs.promises.access(filePath);
                return true;
            } catch (error) {
                return false;
            }
        };
        sourcePath = path.normalize(sourcePath);
        targetPath = path.normalize(targetPath);
        try {
            console.log(`start saveAs file, sourcePath:${sourcePath}, targetPath:${targetPath}`);
            if (await hasFile(targetPath)) {
                const { dir, name, ext } = path.parse(targetPath);
                let i = 1;
                while (await hasFile(`${dir}/${name} (${i})${ext}`)) {
                    i++;
                }
                targetPath = `${dir}/${name} (${i})${ext}`;
            }
            await fs.promises.copyFile(sourcePath, targetPath);
            console.log(`end saveAs file`);
        } catch (error) {
            throw error;
        }
    };
    // 儲存文件檔案
    static save = async (filePath, data) => {
        const decodeBase64Image = (dataString) => {
            const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            const response = {};

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }

            response.type = matches[1];
            response.data = new Buffer(matches[2], 'base64');

            return response;
        };

        if (typeof data === 'string') data = decodeBase64Image(data).data;

        filePath = path.normalize(filePath);
        try {
            console.log(`start save file, path:${filePath}`);
            await fs.promises.writeFile(filePath, data);
            console.log(`end save file`);
        } catch (error) {
            throw error;
        }
    };

    // 銷毀文件
    static destroy = async (filePath) => {
        filePath = path.normalize(filePath);
        try {
            console.log(`start destroy file, path:${filePath}`);
            await fs.promises.unlink(filePath);
            console.log(`end destroy file`);
        } catch (error) {
            throw error;
        }
    };
    static exist = async (filePath) => {
        filePath = path.normalize(filePath);
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    };
    // 檢查檔名是否不同
    static isEqualExt(ext, formatExt) {
        let a = ext.toLowerCase();
        if (a === 'jpg') a = 'jpeg';
        let b = formatExt.toLowerCase();
        if (a === b) {
            throw 'equal extension';
        }
    }

    static readChunkSync = (filePath, startPosition, length) => {
        let buffer = Buffer.alloc(length);
        const fileDescriptor = fs.openSync(filePath, 'r');

        try {
            const bytesRead = fs.readSync(fileDescriptor, buffer, {
                length,
                position: startPosition
            });

            if (bytesRead < length) buffer = buffer.subarray(0, bytesRead);

            return buffer;
        } finally {
            fs.closeSync(fileDescriptor);
        }
    };

    static getMd5 = async (filePath) => {
        await fs.promises.access(filePath);
        const size = await this.getSize(filePath);
        const chunkSize = 4096;
        const headBuffer = this.readChunkSync(filePath, 0, chunkSize);
        const bodyBuffer = this.readChunkSync(
            filePath,
            Math.floor((size - chunkSize) / 2),
            chunkSize
        );
        const tailBuffer = this.readChunkSync(filePath, size - chunkSize, chunkSize);
        const mergeBuffer = Buffer.concat([headBuffer, bodyBuffer, tailBuffer]);

        const md5 = crypto.createHash('md5').update(mergeBuffer).digest('hex');

        return md5;
    };

    static getSize = async (filePath) => {
        const stats = await fs.promises.stat(filePath);
        return stats.size;
    };
};
