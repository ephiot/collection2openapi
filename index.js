const fs = require('fs');
const path = require('path')
const pkg = require(path.join(__dirname, 'package.json'));
const prog = require('commander')
const postmanToOpenApi = require('postman-to-openapi')

// Setting program args/options
prog
.version(pkg.version || '0.0.0', '-v, --version')
.option('-c, --collection <filepath>', '[REQUIRED] Postman collection JSON filepath')
.option('-e, --environment <filepath>', 'Postman environment JSON filepath')
.option('-g, --globals <filepath>', 'Postman globals JSON filepath')
.option('-o, --options-output <filepath>', 'Options output filepath', `./output/options_${Date.now()}.json`)
.option('-r, --result <filepath>', 'OpenAPI JSON output filepath', `./output/openapi_${Date.now()}.json`)
.parse(process.argv);

const fileCollection = prog.opts().collection
const fileEnvironment = prog.opts().environment
const fileGlobals = prog.opts().globals
const optionsFilepath = prog.opts().optionsFilepath
const openApiFilepath = prog.opts().result

if (fileCollection === undefined) {
    console.error('No collection (Use --help for more details).')
    return false
}

var options = {
    "additionalVars": {}
}

/**
 * Read a Postman environment/globals vars exported JSON and set on options
 * @param String filepath Exported JSON filepath
 * @returns Object options
 */
const setAdditionVarsFromJson = (filepath) => {
    try {
        const data = fs.readFileSync(filepath, 'utf8')
    
        // parse JSON string to JSON object
        JSON.parse(data).values.forEach((item) => {
            options.additionalVars[item.key] = item.value
        });
    } catch (err) {
        console.log(`[${fileEnvironment}] Error reading file from disk: ${err}`);
    }
    return options
}

/**
 * Save options JSON file on output filepath
 * @param String output Output filepath
 * @param Object data Additional vars object
 * @returns bool
 */
const saveOptionsFile = (output, data) => {
    try {

        // convert JSON object to a string
        const contents = JSON.stringify(data, null, 4);

        // write file to disk
        fs.writeFileSync(output, contents, 'utf8');

        console.log(`[${output}] File is written successfully!`);
        return true
    } catch (err) {
        console.log(`[${output}] Error writing file: ${err}`);
        return false
    }    
}

// Get key:value from environment file
if (fileEnvironment !== undefined) {
    options = setAdditionVarsFromJson(fileEnvironment)
}
// Get key:value from globals file
if (fileGlobals !== undefined) {
    options = setAdditionVarsFromJson(fileGlobals)
}
// Save additional variables file
if (optionsFilepath !== undefined) {
    saveOptionsFile(optionsFilepath, options)
}

// Convert Postman (collection + environment + globals) into Openapi JSON
postmanToOpenApi(fileCollection, openApiFilepath, options)
    .then(result => {
        console.log(`File output: ${openApiFilepath}`,`OpenAPI specs: ${result}`)
    })
    .catch(err => {
        console.log(err)
    })
