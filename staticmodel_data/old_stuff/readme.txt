var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('file.in', {start: 90, end: 99})
});

lineReader.on('line', function (line) {
  console.log('Line from file:', line);
});
