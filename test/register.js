// eslint-disable-next-line
const tsNode = require('ts-node');

tsNode.register({
    files: true,
    transpileOnly: true,
    project: './test/tsconfig.json'
});
