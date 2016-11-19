const repl = require('repl');
const YamahaReceiver = require('.').default;
var yamahaReceiver = new YamahaReceiver({
  address: '192.168.0.165',
  inputs: {

  }
});

console.log('yamahaReceiver exported');
const r = repl.start('> ');
r.context.yamahaReceiver = yamahaReceiver;
