# postman-openapi-converter

This app uses postman-to-openapi(https://joolfe.github.io/postman-to-openapi/) convert Postman collection + environment + globals into OpenAPI JSON (for use with swagger AppScan for example).

## Installation

```bash
$ yarn install
```

## Usage

```bash
Usage: index [options]

Options:
  -v, --version                    output the version number
  -c, --collection <filepath>      [REQUIRED] Postman collection JSON filepath
  -e, --environment <filepath>     Postman environment JSON filepath
  -g, --globals <filepath>         Postman globals JSON filepath
  -o, --options-output <filepath>  Options output filepath (default: "./output options_1640721864653.json")
  -r, --result <filepath>          OpenAPI JSON output filepath (default:
                                   "./output/openapi_1640721864653.json")
  -h, --help                       display help for command
```

Example:

```bash
$ node index,js -c [path to collection.json] -e [path to environment.json] -g [path to globals.json] -o [path to output options JSON (for debug)] -r [path to output OpenAPI JSON as result]
```
