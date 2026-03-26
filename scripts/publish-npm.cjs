#!/usr/bin/env node
/**
 * Publish without committing credentials: builds a temporary npm userconfig that is
 * deleted after publish. Tokens come only from the environment (Stage0 Launch,
 * GitHub Actions, or local export)—never from a tracked .npmrc file.
 *
 * GitHub Packages: npm often returns 401 if only NODE_AUTH_TOKEN is set; it also
 * needs the scoped registry mapping. This script adds both.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const publishUrl = (pkg.publishConfig && pkg.publishConfig.registry) || '';
const pkgName = typeof pkg.name === 'string' ? pkg.name : '';
const scopeMatch = /^@([^/]+)\//.exec(pkgName);
const scope = scopeMatch ? scopeMatch[1] : null;

const token =
  process.env.NODE_AUTH_TOKEN ||
  process.env.GITHUB_TOKEN ||
  process.env.NPM_TOKEN ||
  '';

const userconfig = path.join(root, '.npmrc.publish');

function publish(extraArgs) {
  const result = spawnSync('npm', ['publish', ...extraArgs], {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
  });
  return result.status === null ? 1 : result.status;
}

function githubPackagesConfig(tok) {
  let cfg = '';
  if (scope) {
    cfg += `@${scope}:registry=https://npm.pkg.github.com/\n`;
  }
  cfg +=
    `registry=https://npm.pkg.github.com/\n` +
    `//npm.pkg.github.com/:_authToken=${tok}\n`;
  return cfg;
}

function npmjsConfig(tokh) {
  return (
    `registry=https://registry.npmjs.org/\n` +
    `//registry.npmjs.org/:_authToken=${tokh}\n`
  );
}

let code = 1;
try {
  const isGh = publishUrl.includes('npm.pkg.github.com');

  if (isGh && !token) {
    code = publish([]);
    process.exit(code);
  }

  if (!isGh && !token) {
    code = publish([]);
    process.exit(code);
  }

  const cfg = isGh ? githubPackagesConfig(token) : npmjsConfig(token);
  fs.writeFileSync(userconfig, cfg, { mode: 0o600 });
  code = publish([`--userconfig=${userconfig}`]);
} finally {
  try {
    fs.unlinkSync(userconfig);
  } catch (_) {
    /* ignore */
  }
}

process.exit(code);
