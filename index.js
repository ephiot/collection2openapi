const fs = require('fs');
const path = require('path')
const pkg = require(path.join(__dirname, 'package.json'));
const prog = require('commander')
const postmanToOpenApi = require('postman-to-openapi')
const insomniaToOpenApi = require('insomnia-oas-converter').default

/**
 * Supported Types
 */
const TYPE_POSTMAN = 'postman'
const TYPE_INSOMNIA = 'insomnia'
const TYPES_SUPPORTED = [TYPE_POSTMAN, TYPE_INSOMNIA]

/**
 * Read a file
 * @param String filepath filepath
 * @returns mixed|bool file contents or false
 */
 const loadFile = (filepath) => {
    try {
        return fs.readFileSync(filepath, 'utf8')
    } catch (err) {
        console.log(`[${filepath}] Error reading file from disk: ${err}`);
        return false
    }
}

/**
 * Save a file
 * @param String output Output filepath
 * @param mixed contents File contents
 * @returns bool
 */
const saveFile = (output, contents) => {
    try {
        fs.writeFileSync(output, contents, 'utf8');
        console.log(`[${output}] File is written successfully!`);
        return true
    } catch (err) {
        console.log(`[${output}] Error writing file: ${err}`);
        return false
    }    
}

/**
 * Read a JSON file
 * @param String filepath filepath
 * @returns object JSON
 */
const loadJson = (filepath) => {
    try {
        return JSON.parse(loadFile(filepath))
    } catch (err) {
        console.log(`[${filepath}] Error parsing JSON file: ${err}`);
        return false
    }
}

/**
 * POSTMAN related stuff
 */

var postmanOptions = {
    "additionalVars": {}
}

/**
 * Read a Postman environment/globals vars exported JSON and set on options
 * @param String filepath Exported JSON filepath
 * @returns Object options
 */
 const setPostmanAdditionVarsFromJson = (filepath, options) => {
    try {
        const data = loadJson(filepath)
    
        // Add vars
        data.values.forEach((item) => {
            options.additionalVars[item.key] = item.value
        });
    } catch (err) {
        console.log(`[${fileEnvironment}] Error reading JSON file: ${err}`);
    }
    return options
}

/**
 * INSOMNIA related stuff
 */

var insomniaOptions = {
    "title": "My Api",
    "description": "A Very cool api",
    "version": "1.0.0",
    "baseUrl": "http://example.tld"
}

/**
 * Read a Postman environment/globals vars exported JSON and set on options
 * @param String filepath Exported JSON filepath
 * @returns Object options
 */
const setInsomniaOptionsFromJson = (filepath, options) => {
    try {
        const data = loadJson(filepath)
    
        // Add vars
        data.values.forEach((item) => {
            options[item.key] = item.value
        });
    } catch (err) {
        console.log(`[${fileEnvironment}] Error reading JSON file: ${err}`);
    }
    return options
}

/**
 * Execution
 */

// Setting program args/options
prog
.version(pkg.version || '0.0.0', '-v, --version')
.option('-t, --type <type>', '[REQUIRED] Collection type: \'postman\', \'insomnia\'')
.option('-c, --collection <filepath>', '[REQUIRED] Postman/Insomnia v4 collection JSON filepath')
.option('-o, --output <filepath>', 'OpenAPI JSON output filepath', `./output/{type}_openapi_${Date.now()}.json`)
.option('-so, --save-options <filepath>', 'Options output filepath', `./output/{type}_options_${Date.now()}.json`)
.option("\nPostman related:")
.option('-pe, --postman-environment <filepath>', 'Postman environment JSON filepath')
.option('-pg, --postman-globals <filepath>', 'Postman globals JSON filepath')
.option("\nInsomnia related:")
.option('-io, --insomnia-options <filepath>', 'Insomnia JSON filepath')
.option("OR")
.option('-iot, --insomnia-option-title <title>', 'Insomnia option: title')
.option('-iod, --insomnia-option-desc <description>', 'Insomnia option: description')
.option('-iov, --insomnia-option-vers <version>', 'Insomnia option: version')
.option('-iob, --insomnia-option-baseurl <base url>', 'Insomnia option: base URL')
.option(" ")
.parse(process.argv);

// Core
const collectionType = prog.opts().type
const collectionFile = prog.opts().collection
if (TYPES_SUPPORTED.indexOf(collectionType) < 0 || collectionFile === undefined) {
    console.error('No collection or invalid type (Use --help for more details).')
    return false
}
const outputFilepath = prog.opts().output.replace('{type}', collectionType)
const optionsFilepath = prog.opts().saveOptions.replace('{type}', collectionType)
// Postman
const postmanEnv = prog.opts().postmanEnvironment
const postmanGlobals = prog.opts().postmanGlobals
// Insomnia
const insomniaOptionsFile = prog.opts().insomniaOptions
const insomniaOptionTitle = prog.opts().insomniaOptionTitle
const insomniaOptionDesc = prog.opts().insomniaOptionDesc
const insomniaOptionVer = prog.opts().insomniaOptionVer
const insomniaOptionBaseUrl = prog.opts().insomniaOptionBaseUrl

// Postman
if (collectionType === TYPE_POSTMAN) {
    // Get key:value from environment file
    if (postmanEnv !== undefined) {
        postmanOptions = setPostmanAdditionVarsFromJson(postmanEnv, postmanOptions)
    }
    // Get key:value from globals file
    if (postmanGlobals !== undefined) {
        postmanOptions = setPostmanAdditionVarsFromJson(postmanGlobals, postmanOptions)
    }
    // Save additional variables file
    if (optionsFilepath !== undefined) {
        saveFile(optionsFilepath, JSON.stringify(postmanOptions))
    }
    // Convert Postman (collection + environment + globals) into Openapi JSON
    return postmanToOpenApi(collectionFile, outputFilepath, postmanOptions)
            .then(result => {
                console.log(`File output: ${outputFilepath}`,`OpenAPI specs: ${result}`)
            })
            .catch(err => {
                console.log(err)
            })
}

// Insomnia
if (collectionType === TYPE_INSOMNIA) {
    // Get key:value from environment file
    if (insomniaOptionsFile !== undefined) {
        insomniaOptions = setInsomniaOptionsFromJson(insomniaOptionsFile, insomniaOptions)
    } else {
        if (insomniaOptionTitle !== undefined) {
            insomniaOptions['title'] = insomniaOptionTitle
        }
        if (insomniaOptionDesc !== undefined) {
            insomniaOptions['description'] = insomniaOptionDesc
        }
        if (insomniaOptionVer !== undefined) {
            insomniaOptions['version'] = insomniaOptionVer
        }
        if (insomniaOptionBaseUrl !== undefined) {
            insomniaOptions['baseUrl'] = insomniaOptionBaseUrl
        }
    }
    // Save additional variables file
    if (optionsFilepath !== undefined) {
        saveFile(optionsFilepath, JSON.stringify(insomniaOptions))
    }
    // Convert Insomnia (collection) into Openapi JSON
    const collection = loadJson(collectionFile)
    const result = (new insomniaToOpenApi(collection, insomniaOptions)).convert().as_json()
    return saveFile(outputFilepath, result)
}

// If, for some reason, no type was matched
console.error(`[${collectionType}] No type was matched.`)
