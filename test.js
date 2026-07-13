const test = require('brittle')
const env = require('.')

// Tests set and read their own uniquely named variables rather than relying on
// any variable being present in the ambient environment, which differs between
// POSIX and Windows. Names are kept all-uppercase so they round-trip identically
// on Windows, where environment variable names are case-insensitive.
const KEY = '__BARE_ENV_TEST__'

function cleanup() {
  delete env[KEY]
}

test('get returns the value of a set variable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  t.is(env[KEY], 'value')
})

test('get returns undefined for an unset variable', (t) => {
  t.teardown(cleanup)

  t.is(env[KEY], undefined)
})

test('get returns undefined for a symbol property', (t) => {
  t.is(env[Symbol('symbol')], undefined)
})

test('has is true for a set variable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  t.ok(KEY in env)
})

test('has is false for an unset variable', (t) => {
  t.teardown(cleanup)

  t.absent(KEY in env)
})

test('has is false for a symbol property', (t) => {
  t.absent(Symbol('symbol') in env)
})

test('set stores a string value', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  t.is(env[KEY], 'value')
})

test('set coerces a number to a string', (t) => {
  t.teardown(cleanup)

  env[KEY] = 42

  t.is(env[KEY], '42')
})

test('set coerces a boolean to a string', (t) => {
  t.teardown(cleanup)

  env[KEY] = true

  t.is(env[KEY], 'true')
})

test('set throws for an object value', (t) => {
  t.teardown(cleanup)

  t.exception(() => {
    env[KEY] = {}
  })
})

test('set overwrites an existing value', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'first'
  env[KEY] = 'second'

  t.is(env[KEY], 'second')
})

test('set stores an empty string', (t) => {
  t.teardown(cleanup)

  env[KEY] = ''

  t.is(env[KEY], '')
  t.ok(KEY in env)
})

test('delete removes a set variable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  t.ok(KEY in env)

  delete env[KEY]

  t.absent(KEY in env)
  t.is(env[KEY], undefined)
})

test('delete is a no-op for an unset variable', (t) => {
  t.teardown(cleanup)

  t.execution(() => {
    delete env[KEY]
  })

  t.absent(KEY in env)
})

test('keys includes a set variable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  t.ok(Object.keys(env).includes(KEY))
})

test('keys excludes a deleted variable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'
  delete env[KEY]

  t.absent(Object.keys(env).includes(KEY))
})

test('keys returns an array of strings', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  const keys = Object.keys(env)

  t.ok(Array.isArray(keys))

  for (const key of keys) {
    t.is(typeof key, 'string')
  }
})

test('a set variable is enumerable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  let found = false

  for (const key in env) {
    if (key === KEY) found = true
  }

  t.ok(found)
})

test('own property descriptor of a set variable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  const descriptor = Object.getOwnPropertyDescriptor(env, KEY)

  t.alike(descriptor, {
    value: 'value',
    writable: true,
    enumerable: true,
    configurable: true
  })
})

test('entries reflects a set variable', (t) => {
  t.teardown(cleanup)

  env[KEY] = 'value'

  const entries = Object.entries(env)

  t.ok(entries.some(([key, value]) => key === KEY && value === 'value'))
})
