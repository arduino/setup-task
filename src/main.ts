import * as core from '@actions/core';
import * as installer from './installer';

async function run() {
  try {
    let version = core.getInput('version');
    if (!version) {
      version = 'latest';
    }

    if (version) {
      await installer.getTask(version);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
