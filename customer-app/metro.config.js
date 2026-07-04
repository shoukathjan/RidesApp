// Metro config for the npm-workspaces monorepo so it can resolve @useme/shared.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Avoid crawling sibling workspaces (huge, unrelated trees) to cut watch count.
config.resolver.blockList = [
  /\/backend\/.*/,
  /\/admin-web\/.*/,
  /\/driver-app\/.*/,
];

module.exports = config;
