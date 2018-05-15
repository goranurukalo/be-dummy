const fs = require("fs");
const matchingEngine = require("./matchingEngine");
const RandExp = require("randexp");

const pathToGeneratedFiles = "./staticmodel_data/";
var bdFilePath = function(filename) {
    return pathToGeneratedFiles + filename + ".bd";
};

var DataGenerator = function() {};
var handler = new DataGenerator();
var numberOfRowsPerModel = 10;

//
//
//
DataGenerator.prototype.generate = function(
    model,
    _id,
    _startPosition,
    callback
) {
    var generated = [];
    var data = {};

    let startPosition = _startPosition; // make it RANDOM
    let endPosition = numberOfRowsPerModel;

    //
    // check if this *GENERATE* function has generated all data
    // if it is return them
    // else keep generating
    var counter = 0;
    var result = function(arraySize) {
        counter++;

        if (arraySize > 0 && counter == arraySize) {
            if (callback !== undefined) {
                generated = fromArraysToObjects(data, endPosition, _id);
                callback(generated.slice(0));
            }
        }
    };

    //
    //
    // Generate fn START point
    //
    if (
        model !== undefined &&
        model.dataModel !== undefined &&
        Array.isArray(model.dataModel) &&
        model.dataModel.length > 0
    ) {
        model.dataModel.forEach(item => {
            //
            //check item type and choose way to generate data
            if (item.type == "label") {
                //
                //take array of items from selected file
                readAllItemsFromFile(
                    item.id,
                    startPosition,
                    endPosition,
                    function(value) {
                        data[item.columnName] = value;
                        result(model.dataModel.length);
                    }
                );
            } else {
                //
                //take array of generated items with selected pattern
                data[item.columnName] = generateAllItemsFromPattern(
                    item.pattern,
                    endPosition
                );
                result(model.dataModel.length);
            }
            generated.push(data);
        });
    } else {
        console.log("return []");
        callback([]);
    }
};

//
//
//
function readAllItemsFromFile(fileName, startPosition, endPosition, callback) {
    //Start position should be taken from settings file
    if (endPosition === null) endPosition = numberOfRowsPerModel;
    var readData = [];
    //TODO
    var inputStream = fs.createReadStream(bdFilePath(matchingEngine(fileName)));
    var lineReader = require("readline").createInterface({
        input: inputStream
    });

    var lineNum = 0;
    lineReader
        .on("line", function(line) {
            lineNum++;
            readData.push(line);
            if (lineNum === endPosition) {
                lineReader.close();
                inputStream.destroy();
            }
        })
        .on("close", function() {
            if (callback !== undefined) {
                callback(readData.slice(0));
            }
            //return readData;
        });
}
//
//same as function above : readAllItemsFromFile
DataGenerator.prototype.generateArrayFromFile = readAllItemsFromFile;

//
//
//
function generateAllItemsFromPattern(pattern, numberOfItems) {
    var _array = [];
    if (numberOfItems === null) numberOfItems = numberOfRowsPerModel;

    //
    // because json saves data as string
    // it needs to escape special characters
    // so \ is written in file as \\ and \\ as \\\\, etc.
    //
    var changed_pattern = pattern.replace(/\\\\/g, "\\");

    for (let index = 0; index < numberOfItems; index++) {
        var newValue = new RandExp(changed_pattern).gen();
        _array.push(newValue);
    }

    return _array;
}
//
//same as function above : generateAllItemsFromPattern
DataGenerator.prototype.generateArrayPattern = generateAllItemsFromPattern;

//
//
//
function fromArraysToObjects(generatedData, itemsPerArray, _id) {
    //call function fromArraysToObjects
    //this function takes object with array and create more objects with same name
    //
    //example
    //
    //{firstName: ["a","b","c"]}
    //[{fistName: "a"},{fistName: "b"},{fistName: "c"},]
    let index = 0;
    let reduced = [];

    for (let i = 0; i < itemsPerArray; i++) {
        var newObj = {};
        //go thro all items and take one from his array and put it in new obj
        newObj[_id] = i;
        Object.keys(generatedData).forEach(function(key) {
            newObj[key] = generatedData[key][i];
        });
        //end, save that obj to reduced array
        reduced.push(newObj);
    }
    return reduced;
}

module.exports = handler;
