# collection2openapi

This app is an API collection converter for OpenAPI specification, the purpouse of this project is to use one solution for many cases.

Currently it only supports Postman and Insomnia (V4) collections format.

This app uses postman-to-openapi (https://joolfe.github.io/postman-to-openapi/) to convert Postman collection + environment + globals into OpenAPI JSON (for use with swagger AppScan for example).

This app uses insomnia-oas-converter (https://github.com/codeasashu/insomnia-oas-converter) to convert Insomnia collection V4 into OpenAPI JSON (for use with swagger AppScan for example).

## Installation

```bash
$ yarn install
```

## Usage

```bash
Usage: index [options]

Options:
  -v, --version                               output the version number
  -t, --type <type>                           [REQUIRED] Collection type: 'postman', 'insomnia'
  -c, --collection <filepath>                 [REQUIRED] Postman/Insomnia v4 collection JSON filepath
  -o, --output <filepath>                     OpenAPI JSON output filepath (default: "./output/{type}_openapi_1656620932435.json")
  -so, --save-options <filepath>              Options output filepath (default: "./output/{type}_options_1656620932435.json")
  
  Postman related:
  -pe, --postman-environment <filepath>       Postman environment JSON filepath
  -pg, --postman-globals <filepath>           Postman globals JSON filepath
  
  Insomnia related:
  -io, --insomnia-options <filepath>          Insomnia JSON filepath
  OR
  -iot, --insomnia-option-title <title>       Insomnia option: title
  -iod, --insomnia-option-desc <description>  Insomnia option: description
  -iov, --insomnia-option-vers <version>      Insomnia option: version
  -iob, --insomnia-option-baseurl <base url>  Insomnia option: base URL
   
  -h, --help                                  display help for command
```

Example:

Postman collections to OpenAPI:
```bash
$ node index.js -t postman -c [path to collection.json] -pe [path to environment.json] -pg [path to globals.json] -so [path to output options JSON (for debug)] -o [path to output OpenAPI JSON as result]
```

Insomnia collections to OpenAPI:
```bash
$ node index.js -t insomnia -c [path to collection.json] -io [path to insomnia options json] -so [path to output options JSON (for debug)] -o [path to output OpenAPI JSON as result]
```

## TODO:
- Better architecture
- Extract convertion logic to modules (for future expansions, e.g. another format to convert)
- Release as a NPM package
