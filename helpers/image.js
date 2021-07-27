const fs = require('fs')
const sharp = require('sharp')

exports.resizeLargeFile =  async (original_path, destination_path, width, height) => {
  return new Promise(async (resolve, reject)=>{
    let inStream = fs.createReadStream(original_path);
    let outStream = fs.createWriteStream(destination_path, {flags: "w"});
    outStream.on('error', function() {
     console.log("Error");
     reject("Error");
    });
    outStream.on('close', function() {
     console.log("Successfully saved file");
     reject("Successfully saved file");
    });
    let transform = await sharp()
    .resize({ width: 300, height: 300 })
    .on('info', function(fileInfo) {
    console.log("Resizing done, file saved");
    resolve("Resizing done, file saved");
    });
    inStream.pipe(transform).pipe(outStream);
  });
}

exports.resize =  async (original_path, destination_path, width, height) => {
  return new Promise(async (resolve, reject)=>{
    await sharp(original_path).resize({ height: 300, width: 300 }).toFile(destination_path)
    .then(function(newFileInfo) {
      console.log("Success in resize");
      resolve("Success in resize");
    })
    .catch(function(err) {
      console.log("Error occured in resize");
      reject("Error occured in resize");
    });
  });
}

exports.removeImage =  async (file_path) => {
  return new Promise((resolve, reject)=>{
    try {
      module.exports.isFileExist(file_path).then((res)=>{
        if(res){
          fs.unlinkSync(file_path);
          console.log("Successfully deleted the file.");
          resolve("Successfully deleted the file.");
        }
        else{
          console.log("File does not exist");
          resolve("File does not exist");
        }
      });
    } catch(err) {
      console.log(err);
      reject(err);
      throw err
    }
  });
}

exports.isFileExist =  async (file_path) => {
  return new Promise((resolve, reject)=>{
    try {
      if (fs.existsSync(file_path)) {
        resolve(true);
      }
      else{
        resolve(false);
      }
    } catch(err) {
      console.error(err);
      reject(err);
    }
  });
}
