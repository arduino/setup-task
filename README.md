# `arduino/setup-taskfile`

[![Integration Tests status](https://github.com/arduino/setup-taskfile/actions/workflows/test-integration.yml/badge.svg)](https://github.com/arduino/setup-taskfile/actions/workflows/test-integration.yml)
[![Check Action Metadata status](https://github.com/arduino/setup-taskfile/actions/workflows/check-action-metadata-task.yml/badge.svg)](https://github.com/arduino/setup-taskfile/actions/workflows/check-action-metadata-task.yml)
[![Spell Check status](https://github.com/arduino/setup-taskfile/actions/workflows/spell-check.yml/badge.svg)](https://github.com/arduino/setup-taskfile/actions/workflows/spell-check.yml)
[![Check License status](https://github.com/arduino/setup-taskfile/actions/workflows/check-license.yml/badge.svg)](https://github.com/arduino/setup-taskfile/actions/workflows/check-license.yml)

A [GitHub Actions](https://docs.github.com/en/actions) action that makes the [Task](https://taskfile.dev/#/) task runner / build tool available to use in your workflow.

## Inputs

### `version`

The version of [Task](https://taskfile.dev/#/) to install.
Can be an exact version (e.g., `3.4.2`) or a version range (e.g., `3.x`).

**Default**: `3.x`

### `repo-token`

(**Optional**) GitHub access token used for GitHub API requests.
Heavy usage of the action can result in workflow run failures caused by rate limiting. GitHub provides a more generous allowance for Authenticated API requests.

It will be convenient to use [`${{ secrets.GITHUB_TOKEN }}`](https://docs.github.com/en/actions/reference/authentication-in-a-workflow).

## Usage

To get the latest stable version of Task just add this step:

```yaml
- name: Install Taskfile
  uses: arduino/setup-taskfile@main
```

If you want to pin a major or minor version you can use the `.x` wildcard:

```yaml
- name: Install Taskfile
  uses: arduino/setup-taskfile@main
  with:
    version: '2.x'
```

To pin the exact version:

```yaml
- name: Install Taskfile
  uses: arduino/setup-taskfile@main
  with:
    version: '2.6.1'
```

## Security

If you think you found a vulnerability or other security-related bug in this project, please read our
[security policy](https://github.com/arduino/setup-taskfile/security/policy) and report the bug to our Security Team 🛡️
Thank you!

e-mail contact: security@arduino.cc
