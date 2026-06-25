/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });
const workspaceRoot = path.resolve(__dirname, '../..');

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, './node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.watchFolders = [workspaceRoot];

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

module.exports = withNativeWind(config, { input: './global.css' });
