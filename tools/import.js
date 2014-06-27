#!/usr/bin/node
/*
 * This script loads a file called 'tools/data/items.tsv' and creates 
 * files in the 'www/data' directory which can be used by the web application. 
 * This data directory is deleted and recreated with each run of the
 * import tool.
 * 
 * ## Input ##
 * 
 * Input file is expected to be in a "tab-separated values" format. Fields
 * are enclosed in double-quotes and delimited in each record by tabs.
 * A record ends on a carriage return (CR) and linefeed (LF) set.
 *  
 * See the COLUMNS variable below to see how the indexes in the grid
 * map to field names.
 * 
 * The field which maps to "subjects" has additional formatting. Each
 * subject line is started by an ordinal ("1.", "2.", etc.). 
 * 
 * ## Processing ##
 * 
 * The data from the input file is pulled into an array of objects. Most
 * fields map to simple string values. 
 * 
 * The "author1"..."author3" field is combined into an array of objects,
 * and then parsed out carefully to split them into "authors", "illustrators"
 * and "editors" fields (based on suffixes "ill." and "ed."). The items 
 * in each field are objects containing a "name" and potentially a birth 
 * year and death year if those can also be parsed out. Future versions
 * of this may also allow for importing additional illustrator and
 * editor fields.
 * 
 * The "subjects" field is parsed out into an array, with each subject line trimmed. 
 * 
 * A numeric "key" field is added to each item with a numeric value, 
 * calculated by starting at one and incrementing by one for each added 
 * item.
 * 
 * The data is then split into a number of files.
 * 
 * ## Output ##
 * 
 * Output files are formatted as JSON. There are five large files, which
 * contain arrays of objects, and a separate file for each item which
 * contains the object itself. 
 * 
 * www/data/items.json -- contains all data for all items in one file
 * for convenience. 
 * 
 * NOTE: The following files are no longer written, as they were not
 * needed for the application after all. However, if they become necessary,
 * they can be re-enabled by setting the flag variable "outputIndexFiles"
 * to true.
 * 
 * www/data/summaries.json -- contains summary data for all items in the
 * catalog. This file will load faster than items.json and still provide
 * information about all items.
 * - key
 * - title
 * - subtitle
 * - series
 * - author1
 * - author2
 * - author3
 * 
 * www/data/titles.json -- contains unique titles, subtitles and series,
 * with a list of keys of items associated with that title.
 * - title
 * - keys
 * 
 * www/data/authors.json -- contains unique author names, with a list
 * of keys of items associated with that author.
 * - author
 * - keys
 * 
 * www/data/subjects.json -- contains unique subject lines, with a list
 * of keys for which that subject is found.
 * - subject
 * - keys
 * 
 * www/data/<key>.json -- contains detail data for an item with
 * the specified key.
 * 
 * */
/*
 * TODO: Need to write tests for this stuff.
 * TODO: Need to verify encoding of the input file, seems to be UTF8.
 * TODO: How are quotes escaped in the input file?
 * TODO: Need to figure out what all of the fields are.
 * */

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var events = require('events');

// Set this to true to output a bunch of broken up index files indicated
// above. This is not necessary for the application, which can survive
// perfectly well on items.json.
var outputIndexFiles = false;

/*
 * A mapping of column indexes to internal field names. This would
 * have to be changed if your import file is different.
 * */
var COLUMNS = [
    "title",
    "subtitle",
    "series",
    "author1",
    "author2",
    "author3",
    "subjects",
    "volume",
    "copyNumber",
    "callNumber",
    "unknown1",
    "unknown2",
    "unknown3",
    "unknown4",
    "arQuizNumber",
    "arInterestLevel",
    "arGradeLevel",
    "arPoints",
    "dateAdded",
    "status",
    "location"
    ];
    


/*
 * The input files and output directory are hard-coded relative to
 * this script. This has to be changed if either move.
 * */
var inputFile = path.join(__dirname,"data","items.tsv");
var outputDirectory = path.resolve(__dirname,"..","www","data");


    
/*
 * A simple tokenizer. This takes a readable stream, and returns
 * an event emitter. The stream will be tokenized into TAB, CRLF and 
 * FIELD (a double-quoted string), and these tokens will be emitted
 * as events, along with an 'end' and an 'error' event.
 * 
 * For error reporting, the line number and about 20 characters in
 * the buffer starting where the token started are also passed in
 * the callback.
 * 
 * If an error event is reported, it should be the last event seen.
 * */    
var tokenize = function(input) {
    // constants
    var TAB = /^\t/;
    var FIELD = /^"([^"]*)"/;
    var CRLF = /^\r\n/;
    
    var emitter = new events.EventEmitter();
    
    var emit = emitter.emit.bind(emitter);
    
    var error = function(err) {
        emit('error',err,line,buffer.slice(0,20));
        // set emitter to no-op so that this error is the last thing we see.
        emit = function() {};
    }
    
    // Since the stream supplies data in chunks, and tokens may
    // cross the chunk boundaries, we keep unprocessed data in
    // a buffer.
    var buffer = "";
    // Keep track of the line we are on in the input.
    var line = 0;
  
    
    var processBuffer = function() {
        var match;
        while (buffer.length > 0) {
            if (match = TAB.exec(buffer)) {
                emit("TAB",match[0],line,buffer.slice(0,20));
            } else if (match = CRLF.exec(buffer)) {
                emit("CRLF",match[0],line,buffer.slice(0,20));
                line += 1;
            } else if (match = FIELD.exec(buffer)) {
                emit("FIELD",match[1],line,buffer.slice(0,20));
            } else {
                return false;
            }
            buffer = buffer.slice(match[0].length);
        }
        return true;
    }
    
    input.on('data',function(data) {
        buffer += data;
        processBuffer();
    });
    
    input.on('end',function() {
        if (!processBuffer()) {
            error(new Error("Unexpected data in input file"));
        } else {
            emit('end');
        }
    });
    
    input.on('error',error);
    return emitter;
}

/* 
 * Parses the TSV file. This takes a readable stream and returns
 * an event emitter. The events emitted are 'record', 'error' and 'end'.
 * */
var parse = function(input) {
    var newRow = function() {
        return {
            key: currentRow ? currentRow.key + 1 : 1
        }
    }
    var currentRow = newRow();
    var currentField = 0;
    var expect = ["FIELD"];
    
    var emitter = new events.EventEmitter();
    var emit = emitter.emit.bind(emitter);
    var error = function(err,line,info) {
        emit('error',err,line,info);
        // set emitter to no-op so that this error is the last thing we see.
        emit = function() {};
    }

    
    var tokenizer = tokenize(input);

    var handleToken = function(tokenType,handler) {
        tokenizer.on(tokenType,function(value,line,info) {
            if (expect.indexOf(tokenType) === -1) {
                error(new Error("Expected " + expect.join(", ") + " found " + token,line,info));
            }
            handler(value,line,info);
            
        });
    };
    
    /*
     * This parsing is somewhat simpler and a little bit more cludgy.
     * */
    var parseSubjects = function(subjects,line,info) {
    // "1. Sarajevo (Bosnia and Hercegovina) -- History --  2. Siege, 1992-1996 -- Personal narratives, Bosnian.  3. Yugoslav War, 1991-1995 -- Children.  4. Children and war -- Bosnia and Hercegovina --  5. Sarajevo.  6. Filipovic, Zlata -- Diaries."
        var result = [];
        var i = 2;
        var nextIdx;
        var nextPos;
        var subject;
        if (subjects !== "") {
            if (subjects.indexOf("1.") !== 0) {
                error(new Error("Invalid value for subjects.",line,info));
            }
            subjects = subjects.slice("1.".length);
            while (subjects !== "") {
                nextIdx = "" + i + ".";
                nextPos = subjects.indexOf(nextIdx);
                if (nextPos === -1) {
                    nextPos = subjects.length;
                }
                subject = subjects.substr(0,nextPos);
                subjects = subjects.slice(subject.length + nextIdx.length);
                result.push(subject.trim());
                i++;
            }
        }
        return result;
    }
    
    
    var personMatch = /^(.*),(?: (\d+)-(\d+)?)?( ill| illus| ed)?\.?$/
    // TODO: This parsing shouldn't have to be done. It would be better
    // if the proper data were provided in the first place. But, that's
    // probably the case with subjects as well.
    var parsePerson = function(value,line,info) {
        // In general, this looks like:
        // LastName, FirstName, BirthYear-DeathYear ill/ed.
        var match = personMatch.exec(value);
        if (match) {
            var result = {
                name: match[1],
                birth: match[2],
                death: match[3],
                role: match[4]
            }
            switch (result.role) {
                case " ed":
                    result.role = "editor";
                    break;
                case " ill":
                case " illus":
                    result.role = "illustrator";
                    break;
                default:
                    result.role = "author";
                    break;
            }
            return result;
        }
        // else, we couldn't match, so I'll assume the whole string is
        // the answer.
        // Unless it has a period at the end.
        if (value.indexOf(".", value.length - 1) !== -1) {
            value = value.slice(0,-1);
        }
        return {
            name: value,
            role: "author"
        }
    }
    
    handleToken("CRLF",function() {
        emit('record',currentRow);
        currentRow = newRow();
        currentField = 0;
        expect = ["FIELD"];
    });
    
    handleToken('TAB',function() {
        expect = ["FIELD"];
    });
    
    handleToken('FIELD',function(value,line,info) {
        switch (COLUMNS[currentField]) {
            case "subjects":
                currentRow.subjects = parseSubjects(value,line,info);
                break;
            case "author1":
            case "author2":
            case "author3":
                var result = parsePerson(value,line,info);
                if (result.name) {
                    var field = result.role + "s";
                    if (!currentRow[field]) {
                        currentRow[field] = [];
                    }
                    currentRow[field].push({
                        name: result.name,
                        birth: result.birth,
                        death: result.death
                    })
                }
                break;
            default:
                currentRow[COLUMNS[currentField]] = value;
                break;
        }
        currentField += 1;
        expect = ["CRLF","TAB"];
    });
    
    tokenizer.on('error',function(err,line,data) {
        error(err,line,data);
    });
    
    tokenizer.on('end',function() {
        emit('end');
    });
    
    return emitter;
    
}

/*
 * Wraps the functionality for storing the data in memory, processing
 * it into the different data sources, and writing it out to the 
 * appropriate files.
 * */
var Database = function() {

    var items = [];
    var summaries = [];
    var titleIndex = {};
    var titles = [];
    var authorIndex = {};
    var authors = [];
    var subjectIndex = {};
    var subjects = [];
    
    var addTitle = function(title,key) {
        if (title) {
            if (!titleIndex.hasOwnProperty(title)) {
                titleIndex[title] = titles.push({ title: title, keys: [ key ] }) - 1;
            } else {
                titles[titleIndex[title]].keys.push(key);
            }
        }
    }
    
    var addAuthor = function(author,key) {
        if (author) {
            if (!authorIndex.hasOwnProperty(author)) {
                authorIndex[author] = authors.push({ author: author, keys: [ key ] }) - 1;
            } else {
                authors[authorIndex[author]].keys.push(key);
            }
        }
    }
    
    var addSubject = function(subject,key) {
        if (subject) {
            if (!subjectIndex.hasOwnProperty(subject)) {
                subjectIndex[subject] = subjects.push({ subject: subject, keys: [ key ] }) - 1;
            } else {
                subjects[subjectIndex[subject]].keys.push(key);
            }
        }
    }
    
    this.push = function(record) {
        items.push(record);
        summaries.push({
            key: record.key,
            title: record.title,
            subtitle: record.subtitle,
            series: record.series,
            author1: record.author1,
            author2: record.author2,
            author3: record.author3
        });
        addTitle(record.title,record.key);
        addTitle(record.subtitle,record.key);
        addTitle(record.series,record.key);
        addAuthor(record.author1,record.key);
        addAuthor(record.author2,record.key);
        addAuthor(record.author3,record.key);
        record.subjects.forEach(function(subject) {
            addSubject(subject,record.key);
        });
    }
    
    
    /*
     * Due to the number of files that have to be saved, this has to
     * be done one at a time to avoid multiple file access errors.
     * (Of course, in theory, we could parallel a few at a time, but
     * right now that's not a problem).
     * */
    this.save = function(outputDir,done) {
        var queue = [];
        
        var queueWrite = function(name,filename,entity,skipLog) {
            queue.push(function() {
                if (!skipLog) {
                    console.log("Saving " + name + "...");
                }
                fs.writeFile(path.join(outputDir,filename + ".json"),JSON.stringify(entity,null,"  "),{ encoding: 'utf8' },
                function(err) {
                    if (err) {
                        console.error("Saving " + name + " Failed!");
                        done(err);
                    } else {
                        if (!skipLog) {
                            console.log(name + " saved.");
                        }
                        process.nextTick(processQueue);
                    }
                });
            });
        }
        
        var processQueue = function() {
            if (queue.length) {
                queue.shift()();
            } else {
                done();
            }
        }
        
        queueWrite("Items","items",items);
        // NOTE: These aren't being saved anymore, because I don't
        // actually need these. The speed detriments were in the 
        // UI layer. 
        if (outputIndexFiles) {
            queueWrite("Summaries","summaries",summaries);
            queueWrite("Titles","titles",titles);
            queueWrite("Authors","authors",authors);
            queueWrite("Subjects","subjects",subjects);
        }
        queue.push(function() {
            console.log("Saving " + items.length + " detail files.");
            process.nextTick(processQueue);
        });
        items.forEach(function(item) {
            queueWrite("Item " + item.key,item.key,item,true);
        });
        queue.push(function() {
            console.log("Detail files saved.");
            process.nextTick(processQueue);
        });
        process.nextTick(processQueue);
        
    }
    
    this.count = function() {
        return items.length;
    }
}

/*
 * Imports, processes data and writes it out.
 * */
function main() {
    var data = new Database();

    console.log("Reading input file.");
    var input = fs.createReadStream(inputFile,{ encoding: 'utf8' });
    
    console.log("Parsing.");
    
    var parser = parse(input);
    
    parser.on('record',data.push.bind(data));
    
    parser.on('error',function(err,line,data) {
        console.error("At line %s ('%s'): %s",line,data,err);
    });
    
    parser.on('end',function() {
        console.log("Deleting old data directory.");
        rimraf(outputDirectory,function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Creating new data directory.");
                fs.mkdir(outputDirectory,function(err) {
                    if (err) {
                        console.error(err);
                    } else {
                        data.save(outputDirectory,function(err) {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log("Done with " + data.count() + " items.");
                            }
                        });
                    }
                });
            }
        });
    });
}

main();
