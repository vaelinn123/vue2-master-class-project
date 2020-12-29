'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const firebaseConfig = require('./firebase-config.json')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  FIREBASE_CONFIG: JSON.stringify(firebaseConfig)
})
