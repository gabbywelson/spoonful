const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo (extend defaults, don't replace)
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// Let Metro know where to resolve packages (extend defaults)
config.resolver.nodeModulesPaths = [
	...(config.resolver.nodeModulesPaths || []),
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
];

// Enable package exports resolution for ESM packages like @t3-oss/env-core
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
