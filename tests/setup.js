import jsdomModule from 'jsdom';
const jsdom = jsdomModule.jsdom;

global.document = jsdom('');
global.window = document.defaultView;

global.navigator = {
  userAgent: 'node.js',
};
