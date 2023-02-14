# `arduino/setup-task`

[![Test TypeScript status](https://github.com/arduino/setup-task/actions/workflows/test-typescript-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/test-typescript-task.yml)
[![Check TypeScript status](https://github.com/arduino/setup-task/actions/workflows/check-typescript-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-typescript-task.yml)
[![Check TypeScript Configuration status](https://github.com/arduino/setup-task/actions/workflows/check-tsconfig-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-tsconfig-task.yml)
[![Check npm status](https://github.com/arduino/setup-task/actions/workflows/check-npm-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-npm-task.yml)
[![Integration Tests status](https://github.com/arduino/setup-task/actions/workflows/test-integration.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/test-integration.yml)
[![Check Action Metadata status](https://github.com/arduino/setup-task/actions/workflows/check-action-metadata-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-action-metadata-task.yml)
[![Check Prettier Formatting status](https://github.com/arduino/setup-task/actions/workflows/check-prettier-formatting-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-prettier-formatting-task.yml)
[![Check Markdown status](https://github.com/arduino/setup-task/actions/workflows/check-markdown-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-markdown-task.yml)
[![Spell Check status](https://github.com/arduino/setup-task/actions/workflows/spell-check-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/spell-check-task.yml)
[![Check License status](https://github.com/arduino/setup-task/actions/workflows/check-license.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-license.yml)
[![Check npm Dependencies status](https://github.com/arduino/setup-task/actions/workflows/check-npm-dependencies-task.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/check-npm-dependencies-task.yml)
[![Sync Labels status](https://github.com/arduino/setup-task/actions/workflows/sync-labels-npm.yml/badge.svg)](https://github.com/arduino/setup-task/actions/workflows/sync-labels-npm.yml)

A [GitHub Actions](https://docs.github.com/en/actions) action that makes the [Task](https://taskfile.dev/#/) task runner / build tool available to use in your workflow.

## Inputs

### `version`

The version of [Task](https://taskfile.dev/#/) to install.
Can be an exact version (e.g., `3.4.2`) or a version range (e.g., `3.x`).

**Default**: `3.x`

### `repo-token`

[GitHub access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) used for GitHub API requests.

**Default**: [`GITHUB_TOKEN`](https://docs.github.com/actions/security-guides/automatic-token-authentication)

## Usage

To get the action's default version of Task just add this step:

```yaml
- name: Install Task
  uses: arduino/setup-task@v1
```

If you want to pin a major or minor version you can use the `.x` wildcard:

```yaml
- name: Install Task
  uses: arduino/setup-task@v1
  with:
    version: 2.x
```

To pin the exact version:

```yaml
- name: Install Task
  uses: arduino/setup-task@v1
  with:
    version: 2.6.1
```

## Security

If you think you found a vulnerability or other security-related bug in this project, please read our
[security policy](https://github.com/arduino/setup-task/security/policy) and report the bug to our Security Team 🛡️
Thank you!

e-mail contact: security@arduino.cc
