const binding = require('./binding')

module.exports = new Proxy(Object.create(null), {
  ownKeys (target) {
    return binding.getKeys()
  },

  get (target, property) {
    if (typeof property !== 'string') return

    return binding.get(property)
  },

  has (target, property) {
    if (typeof property !== 'string') return false

    return binding.has(property)
  },

  set (target, property, value) {
    if (typeof property !== 'string') return

    const type = typeof value

    if (type !== 'string' && type !== 'number' && type !== 'boolean') {
      throw new Error('Environment variable must be of type string, number, or boolean')
    }

    value = String(value)

    binding.set(property, value)

    return true
  },

  deleteProperty (target, property) {
    if (typeof property !== 'string') return

    binding.unset(property)
  },

  getOwnPropertyDescriptor (target, property) {
    return {
      value: this.get(target, property),
      enumerable: true,
      configurable: true,
      writable: true
    }
  }
})
