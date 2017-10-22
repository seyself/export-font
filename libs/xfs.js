const fs = require('fs');
const path = require('path');

function find(directoryPath, filter, callback)
{
  fs.readdir(directoryPath, (error, files)=>
  {
    if (error) throw error;
    files.map((file)=>
    {
      let filePath = path.resolve(directoryPath, file);
      fs.stat(filePath, (error2, stats)=>
      {
        if (error2) throw error2;
        if (stats.isDirectory())
        {
          find(filePath, filter, callback);
        }
        else
        {
          let matches = filter ? filePath.match(filter) : null;
          if (matches)
          {
            _totalCount += 1;
            fs.readFile(filePath, 'utf8', callback);
          }
        }
      });
    });
  });
}

function mkdir(dirpath)
{
  let parentDir = path.resolve(dirpath, '../');
  try
  {
    let stats = fs.statSync(parentDir);
    if (!stats.isDirectory())
    {
      console.log('Error: A file with the same name exists.');
      return false;
    }
  }
  catch(error)
  {
    if (!mkdir(parentDir))
    {
      return false;
    }
  }

  try
  {
    let stats = fs.statSync(dirpath);
    if (!stats.isDirectory())
    {
      console.log('Error: A file with the same name exists.');
      return false;
    }
  }
  catch(error)
  {
    try
    {
      fs.mkdirSync(dirpath);
    }
    catch(error)
    {
      console.log('Error: Failed to create directory.');
      console.log(error);
      return false;
    }
  }


  return true;
}

module.exports = {
  find: find,
  mkdir: mkdir
};