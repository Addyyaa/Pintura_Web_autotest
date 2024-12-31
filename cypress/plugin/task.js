// 将 require 替换为 import
import fs from 'fs';
import path from 'path';


module.exports = (on, config) => {
  // 定义一个 task，用于读取目录下的所有图片文件
  on('task', {
    readImageFilesFromDir(dirPath) {
      const imageFiles = [];
      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        const fileExtension = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.JPG', 'JPEG', 'PNG', 'HEIC'].includes(fileExtension)) {
          imageFiles.push(file);
        }
      });

      return imageFiles;
    }
  });
};
