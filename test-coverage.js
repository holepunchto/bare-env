const test = require('brittle')
const env = require('.')

// Use a unique prefix to avoid conflicts with real env vars
const PREFIX = '__BARETEST_'

test('get environment variable', (t) => {
  process.env.PATH = '/usr/bin:/bin'
  t.is(env.PATH, '/usr/bin:/bin')
  t.is(env.PATH, process.env.PATH)
})

test('get undefined variable returns undefined', (t) => {
  t.is(env.__NONEXISTENT_VAR_XYZ__, undefined)
})

test('set environment variable', (t) => {
  const key = PREFIX + 'TEST_VAR'
  env[key] = 'hello'
  t.is(env[key], 'hello')
  t.is(process.env[key], 'hello')
  delete process.env[key]
})

test('set numeric value converts to string', (t) => {
  const key = PREFIX + 'NUM_VAR'
  env[key] = 42
  t.is(env[key], '42')
  t.is(process.env[key], '42')
  delete process.env[key]
})

test('set boolean value converts to string', (t) => {
  const key = PREFIX + 'BOOL_VAR'
  env[key] = true
  t.is(env[key], 'true')
  delete process.env[key]
})

test('delete environment variable', (t) => {
  const key = PREFIX + 'DELETE_VAR'
  process.env[key] = 'temp'
  t.ok(key in env)
  delete env[key]
  t.absent(key in env)
  t.is(env[key], undefined)
})

test('has operator works', (t) => {
  t.ok('PATH' in env)
  t.absent('__MADE_UP_NONEXISTENT__' in env)
})

test('ownKeys returns enumerable keys', (t) => {
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

test('getOwnPropertyDescriptor returns enumerable configurable', (t) => {
  const desc = Object.getOwnPropertyDescriptor(env, 'PATH')
  t.ok(desc)
  t.ok(desc.enumerable)
  t.ok(desc.configurable)
  t.ok(desc.writable)
})
