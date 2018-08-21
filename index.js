#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const yargs = require("yargs");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fetch = require("node-fetch");

function fetchArtifactory(path, apiKey) {
  return new Promise((resolve, reject) => {
    fetch(path, {
      headers: {
        "X-JFrog-Art-Api": apiKey
      }
    })
      .then(response => {
        if (response.ok) return response.text();

        if (response.status === 404) {
          return {
            errors: [{ message: `Could not find ${path}` }]
          };
        }

        return response.json();
      })
      .then(
        response =>
          response.errors
            ? reject(response.errors[0].message)
            : resolve(response)
      )
      .catch(err => console.log(chalk.red(err)));
  });
}

const parseDirectory = directory => path.normalize(path.resolve(directory));
const parseScope = scope => (scope[0] === "@" ? scope : `@${scope}`);

yargs
  .alias({
    directory: "d",
    artifactoryKey: "k",
    serverName: "n",
    registry: "r",
    scope: "s"
  })
  .coerce({
    directory: parseDirectory,
    scope: parseScope
  })
  .epilog(
    "For more usage information, see https://github.com/doximity/configure-jfrog"
  );

inquirer
  .prompt([
    {
      name: "directory",
      message: "Where would you like to configure JFrog Artifactory?",
      default: process.cwd(),
      filter: parseDirectory,
      when: !yargs.argv.directory
    },
    {
      name: "artifactoryKey",
      message: "What is your JFrog Artifactory API key?",
      default: process.env.ARTIFACTORY_API_KEY,
      when: !yargs.argv.artifactoryKey
    },
    {
      name: "serverName",
      message:
        "What is your JFrog Artifactory server name? (https://<server name>.jfrog.io)",
      validate: answer => !!answer,
      when: !yargs.argv.serverName
    },
    {
      name: "registry",
      message: "What is the name of the registry?",
      validate: answer => !!answer,
      when: !yargs.argv.registry
    },
    {
      name: "scope",
      message: "What is the package scope?",
      filter: parseScope,
      validate: answer => answer.length > 1,
      when: !yargs.argv.scope
    }
  ])
  .then(answers => ({ ...answers, ...yargs.argv }))
  .then(answers => {
    const { serverName, artifactoryKey, registry, scope } = answers;

    return Promise.all([
      answers,
      fetchArtifactory(
        `https://${serverName}.jfrog.io/${serverName}/api/npm/auth`,
        artifactoryKey
      ),
      fetchArtifactory(
        `https://${serverName}.jfrog.io/${serverName}/api/npm/${registry}/auth/${scope.substring(
          1
        )}`,
        artifactoryKey
      )
    ]);
  })
  .then(
    ([{ directory, serverName, registry }, registryAuth, scopeAuth]) =>
      new Promise((resolve, reject) => {
        fs.writeFile(
          `${directory}/.npmrc`,
          `registry=https://${serverName}.jfrog.io/${serverName}/api/npm/${registry}/
${registryAuth}
${scopeAuth}`,
          err => {
            if (err) reject(err);

            resolve({ directory, registry });
          }
        );
      })
  )
  .then(({ directory, registry }) =>
    console.log(
      `🐸  Successfully configured JFrog Artifactory ${registry} registry at ${directory}`
    )
  )
  .catch(err => console.log(chalk.red(err)));
