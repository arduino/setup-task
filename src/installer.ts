// Copyright (c) 2019 ARDUINO SA
//
// The software is released under the GNU General Public License, which covers the main body
// of the arduino/setup-task code. The terms of this license can be found at:
// https://www.gnu.org/licenses/gpl-3.0.en.html
//
// You can be released from the requirements of the above licenses by purchasing
// a commercial license. Buying such a license is mandatory if you want to modify or
// otherwise use the software for commercial activities involving the Arduino
// software without disclosing the source code of your own applications. To purchase
// a commercial license, send an email to license@arduino.cc

import * as os from "os";
import * as path from "path";
import * as util from "util";
import * as restm from "typed-rest-client/RestClient";
import * as semver from "semver";

import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

import io = require("@actions/io");

const osPlat: string = os.platform();
const osArch: string = os.arch();

interface ITaskRelease {
  tag_name: string;
}

// Retrieve a list of versions scraping tags from the Github API
async function fetchVersions(repoToken: string): Promise<string[]> {
  let rest: restm.RestClient;
  if (repoToken !== "") {
    rest = new restm.RestClient("setup-task", "", [], {
      headers: { Authorization: `Bearer ${repoToken}` },
    });
  } else {
    rest = new restm.RestClient("setup-task");
  }

  const tags: ITaskRelease[] =
    (
      await rest.get<ITaskRelease[]>(
        "https://api.github.com/repos/go-task/task/releases",
      )
    ).result || [];

  return tags.map((tag) => tag.tag_name.replace(/^v/, ""));
}

// Make partial versions semver compliant.
function normalizeVersion(version: string): string {
  const preStrings = ["beta", "rc", "preview"];

  const versionPart = version.split(".");
  if (versionPart[1] == null) {
    // append minor and patch version if not available
    // e.g. 2 -> 2.0.0
    return version.concat(".0.0");
  }
  // handle beta and rc
  // e.g. 1.10beta1 -? 1.10.0-beta1, 1.10rc1 -> 1.10.0-rc1
  if (preStrings.some((el) => versionPart[1].includes(el))) {
    versionPart[1] = versionPart[1]
      .replace("beta", ".0-beta")
      .replace("rc", ".0-rc")
      .replace("preview", ".0-preview");
    return versionPart.join(".");
  }

  if (versionPart[2] == null) {
    // append patch version if not available
    // e.g. 2.1 -> 2.1.0
    return version.concat(".0");
  }
  // handle beta and rc
  // e.g. 1.8.5beta1 -> 1.8.5-beta1, 1.8.5rc1 -> 1.8.5-rc1
  if (preStrings.some((el) => versionPart[2].includes(el))) {
    versionPart[2] = versionPart[2]
      .replace("beta", "-beta")
      .replace("rc", "-rc")
      .replace("preview", "-preview");
    return versionPart.join(".");
  }

  return version;
}

// Compute an actual version starting from the `version` configuration param.
async function computeVersion(
  version: string,
  repoToken: string,
): Promise<string> {
  // return if passed version is a valid semver
  if (semver.valid(version)) {
    core.debug("valid semver provided, skipping computing actual version");
    return `v${version}`; // Task releases are v-prefixed
  }

  let versionPrefix = version;
  // strip leading `v` char (will be re-added later)
  if (versionPrefix.startsWith("v")) {
    versionPrefix = versionPrefix.slice(1, versionPrefix.length);
  }

  // strip trailing .x chars
  if (versionPrefix.endsWith(".x")) {
    versionPrefix = versionPrefix.slice(0, versionPrefix.length - 2);
  }

  const allVersions = await fetchVersions(repoToken);
  const possibleVersions = allVersions.filter((v) =>
    v.startsWith(versionPrefix),
  );

  const versionMap = new Map();
  possibleVersions.forEach((v) => versionMap.set(normalizeVersion(v), v));

  const versions = Array.from(versionMap.keys())
    .sort(semver.rcompare)
    .map((v) => versionMap.get(v));

  core.debug(`evaluating ${versions.length} versions`);

  if (versions.length === 0) {
    throw new Error("unable to get latest version");
  }

  core.debug(`matched: ${versions[0]}`);

  return `v${versions[0]}`;
}

function getFileName() {
  const platform: string = osPlat === "win32" ? "windows" : osPlat;
  const arches = {
    arm: "arm",
    arm64: "arm64",
    x64: "amd64",
    ia32: "386",
  };
  const arch: string = arches[osArch] ?? osArch;
  const ext: string = osPlat === "win32" ? "zip" : "tar.gz";
  const filename: string = util.format("task_%s_%s.%s", platform, arch, ext);

  return filename;
}

async function downloadRelease(version: string): Promise<string> {
  // Download
  const fileName: string = getFileName();
  const downloadUrl: string = util.format(
    "https://github.com/go-task/task/releases/download/%s/%s",
    version,
    fileName,
  );
  let downloadPath: string | null = null;
  try {
    downloadPath = await tc.downloadTool(downloadUrl);
  } catch (error) {
    if (typeof error === "string" || error instanceof Error) {
      core.debug(error.toString());
    }
    throw new Error(`Failed to download version ${version}: ${error}`);
  }

  // Extract
  let extPath: string | null = null;
  if (osPlat === "win32") {
    extPath = await tc.extractZip(downloadPath);
    // Create a bin/ folder and move `task` there
    await io.mkdirP(path.join(extPath, "bin"));
    await io.mv(path.join(extPath, "task.exe"), path.join(extPath, "bin"));
  } else {
    extPath = await tc.extractTar(downloadPath);
    // Create a bin/ folder and move `task` there
    await io.mkdirP(path.join(extPath, "bin"));
    await io.mv(path.join(extPath, "task"), path.join(extPath, "bin"));
  }

  // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
  return tc.cacheDir(extPath, "task", version);
}

export async function getTask(version: string, repoToken: string) {
  // resolve the version number
  const targetVersion = await computeVersion(version, repoToken);

  // look if the binary is cached
  let toolPath: string;
  toolPath = tc.find("task", targetVersion);

  // if not: download, extract and cache
  if (!toolPath) {
    toolPath = await downloadRelease(targetVersion);
    core.debug(`Task cached under ${toolPath}`);
  }

  toolPath = path.join(toolPath, "bin");
  core.addPath(toolPath);
  core.info(`Successfully setup Task version ${targetVersion}`);
}
