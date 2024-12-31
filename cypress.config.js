// @ts-nocheck
const { defineConfig } = require("cypress");
// import { defineConfig } from "cypress";
const fs = require("fs");
const path = require("path");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        readImageFilesFromDir(dirPath) {
          try {
            const files = fs.readdirSync(dirPath);
            const imageFiles = files
              .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"].includes(ext);
              })
              .sort((a, b) => {
                const numA = parseInt(path.basename(a, path.extname(a)), 10);
                const numB = parseInt(path.basename(b, path.extname(b)), 10);
                return numA - numB;
              });

            return imageFiles;
          } catch (error) {
            return null;
          }
        }
      });
    },
  },
});
