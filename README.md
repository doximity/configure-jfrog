# <center>🐸 `configure-jfrog` 🐸</center>

The command-line utility `configure-jfrog` is used to configure an NPM repository for using a [JFrog SaaS Artifactory](https://jfrog.com/knowledge-base/how-to-access-the-your-artifactory-saas-online-instance-and-do-a-password-reset/) registry.

## Installation

No installation is necessary when using `npx`, although you may globally install with `npm install --global configure-jfrog`. This is only recommended if you do not desire the latest version of the utility on each run.

## Usage

Run the CLI command `configure-jfrog` with optional flags and answer any prompts that may appear.

```bash
configure-jfrog [--directory -d] [--server-name -n] [--artifactory-key -k] [--registry -r] [--scope -s]
```

> ⚠️ WARNING: configure-jfrog will replace any existing .npmrc file at the specified directory.

### Flags

| name              | alias | description                                                                                                                                                                                                                                   |
| ----------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory`       | `-d`  | The relative or absolute path to the directory in which to configure NPM. This should be the root directory where your `package.json` lives.                                                                                                  |
| `server-name`     | `-n`  | The JFrog Artifactory server name: _https://__\<server-name>\_\_.jfrog.io_                                                                                                                                                                    |
| `artifactory-key` | `-k`  | Your Artifactory API key. You must [generate](https://www.jfrog.com/confluence/display/RTF/Updating+Your+Profile#UpdatingYourProfile-APIKey) one for your user profile.                                                                       |
| `registry`        | `-r`  | The name of the registry on Artifactory you would like to use.                                                                                                                                                                                |
| `scope`           | `-s`  | The [NPM `@scope`](https://docs.npmjs.com/misc/scope) that your private packages are published to. It is best practice to always publish private packages under a scope so that there are no conflicts with public packages of the same name. |

### Example

```bash
npx configure-jfrog -d ~/Sites/example-package -n doximity -k $ARTIFACTORY_API_KEY -r npm-doximity -s dox
```

## Run as npm script

It may be helpful to create an NPM script to automatically configure your repository for new users:

```json
{
  "scripts": {
    "configure-npm":
      "npx configure-jfrog -d . -n doximity -k $ARTIFACTORY_API_KEY -r npm-doximity -s dox"
  }
}
```

This will allow a new user to set up the private registry using their credentials.
