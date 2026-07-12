const test = require('brittle')
const env = require('.')

const PREFIX = '__BARETEST_'

test('get existing variable PATH', (t) => {
  const path = env.PATH
  t.ok(typeof path === 'string')
  t.ok(path.length > 0)
})

test('get undefined variable returns undefined', (t) => {
  t.is(env.__BARETEST_NONEXISTENT_VARIABLE, undefined)
})

test('has operator on existing variable', (t) => {
  t.ok('PATH' in env)
})

test('has operator on nonexistent variable', (t) => {
  t.absent('__BARETEST_DOES_NOT_EXIST_XYZ' in env)
})

test('ownKeys returns environment variable names', (t) => {
  const keys = Object.keys(env)
  t.ok(Array.isArray(keys))
  t.ok(keys.length > 0)
  t.ok(keys.includes('PATH'))
})

test('non-string property access returns undefined', (t) => {
  t.is(env[Symbol('test')], undefined)
  t.is(env[42], undefined)
  t.is(env[null], undefined)
  t.is(env[undefined], undefined)
})

test('enumeration works with for...in', (t) => {
  let count = 0
  for (const key in env) {
    if (Object.prototype.hasOwnProperty.call(env, key)) count++
  }
  t.ok(count > 0)
})

test('set and delete environment variable', (t) => {
  const key = PREFIX + 'SET_TEST'
  const initial = env[key]
  t.is(initial, undefined)

  env[key] = 'test_value'
  t.is(env[key], 'test_value')

  delete env[key]
  t.is(env[key], undefined)
})

test('set numeric value converts to string', (t) => {
  const key = PREFIX + 'NUM_TEST'
  env[key] = 42
  t.is(env[key], '42')
  delete env[key]
})

test('set boolean value converts to string', (t) => {
  const key = PREFIX + 'BOOL_TEST'
  env[key] = true
  t.is(env[key], 'true')
  delete env[key]
})

test('getOwnPropertyDescriptor returns enumerable configurable', (t) => {
  const desc = Object.getOwnPropertyDescriptor(env, 'PATH')
  t.ok(desc)
  t.ok(desc.enumerable)
  t.ok(desc.configurable)
  t.ok(desc.writable)
})
