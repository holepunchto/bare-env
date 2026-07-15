# bare-env

Environment variable support for JavaScript.

```
npm i bare-env
```

## Usage

```js
const env = require('bare-env')

console.log(env.PATH)
```

## License

Apache-2.0

<!-- bare-refgen:api start -->
## API

### Constants and variables

#### `env: Env`

[source](https://github.com/holepunchto/bare-env/blob/v3.0.1/index.d.ts#L5)

The process environment as a map of variable names to values. Reads, writes, `delete`, and key enumeration are forwarded to the underlying `bare-os` environment; assigned values must be strings, numbers, or booleans (stored as strings) — assigning any other type throws.
<!-- bare-refgen:api end -->