var React = require('react');
var render = require('react-dom').render;
var ReactModule = require('./src/index');

render(<ReactModule name="world" />, document.getElementById('container'));
