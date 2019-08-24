// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMP'] || '';

import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as restm from 'typed-rest-client/RestClient';
import * as semver from 'semver';

if (!tempDirectory) {
    let baseLocation;
    if (process.platform === 'win32') {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
    } else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users';
        } else {
            baseLocation = '/home';
        }
    }
    tempDirectory = path.join(baseLocation, 'actions', 'temp');
}

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import io = require('@actions/io');

let osPlat: string = os.platform();
let osArch: string = os.arch();

interface ITaskRef {
    ref: string;
}

export async function getTask(version: string) {
    // resolve the version number
    const targetVersion = await computeVersion(version)
    if (targetVersion) {
        version = targetVersion;
    }

    // look if the binary is cached
    let toolPath: string;
    toolPath = tc.find('task', version);

    // if not: download, extract and cache
    if (!toolPath) {
        toolPath = await downloadRelease(version);
        core.debug('Task cached under ' + toolPath);
    }

    toolPath = path.join(toolPath, 'bin');
    core.addPath(toolPath);
}

async function downloadRelease(version: string): Promise<string> {
    // Download
    let fileName: string = getFileName();
    let downloadUrl: string = util.format(
        'https://github.com/go-task/task/releases/download/%s/%s',
        version,
        fileName
    );
    let downloadPath: string | null = null;
    try {
        downloadPath = await tc.downloadTool(downloadUrl);
    } catch (error) {
        core.debug(error);
        throw `Failed to download version ${version}: ${error}`;
    }

    // Extract
    let extPath: string | null = null;
    if (osPlat == 'win32') {
        extPath = await tc.extractZip(downloadPath);
        // Create a bin/ folder and move `task` there
        await io.mkdirP(path.join(extPath, 'bin'))
        await io.mv(path.join(extPath, 'task.exe'), path.join(extPath, 'bin'))
    } else {
        extPath = await tc.extractTar(downloadPath);
        // Create a bin/ folder and move `task` there
        await io.mkdirP(path.join(extPath, 'bin'))
        await io.mv(path.join(extPath, 'task'), path.join(extPath, 'bin'))
    }

    // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
    return await tc.cacheDir(extPath, 'task', version);
}

function getFileName() {
    const platform: string = osPlat == 'win32' ? 'windows' : osPlat;
    const arch: string = osArch == 'x64' ? 'amd64' : '386';
    const ext: string = osPlat == 'win32' ? 'zip' : 'tar.gz';
    const filename: string = util.format(
        'task_%s_%s.%s',
        platform,
        arch,
        ext
    );

    return filename;
}

// Retrieve a list of versions scraping tags from the Github API
async function fetchVersions(): Promise<string[]> {
    let rest: restm.RestClient = new restm.RestClient('setup-taskfile');
    let tags: ITaskRef[] =
        (await rest.get<ITaskRef[]>(
            'https://api.github.com/repos/go-task/task/git/refs/tags'
        )).result || [];

    return tags
        .filter(tag => tag.ref.match(/v\d+\.[\w\.]+/g))
        .map(tag => tag.ref.replace('refs/tags/v', ''));
}

// Compute an actual version starting from the `version` configuration param.
async function computeVersion(version: string): Promise<string> {
    // strip leading `v` char (will be re-added later)
    if (version.startsWith('v')) {
        version = version.slice(1, version.length);
    }

    // strip trailing .x chars
    if (version.endsWith('.x')) {
        version = version.slice(0, version.length - 2);
    }

    const allVersions = await fetchVersions();
    const possibleVersions = allVersions.filter(v => v.startsWith(version));

    const versionMap = new Map();
    possibleVersions.forEach(v => versionMap.set(normalizeVersion(v), v));

    const versions = Array.from(versionMap.keys())
        .sort(semver.rcompare)
        .map(v => versionMap.get(v));

    core.debug(`evaluating ${versions.length} versions`);

    if (versions.length === 0) {
        throw new Error('unable to get latest version');
    }

    core.debug(`matched: ${versions[0]}`);

    return 'v' + versions[0];
}

// Make partial versions semver compliant.
function normalizeVersion(version: string): string {
    const preStrings = ['beta', 'rc', 'preview']

    const versionPart = version.split('.');
    if (versionPart[1] == null) {
        //append minor and patch version if not available
        // e.g. 2 -> 2.0.0
        return version.concat('.0.0');
    } else {
        // handle beta and rc
        // e.g. 1.10beta1 -? 1.10.0-beta1, 1.10rc1 -> 1.10.0-rc1
        if (preStrings.some(el => versionPart[1].includes(el))) {
            versionPart[1] = versionPart[1]
                .replace('beta', '.0-beta')
                .replace('rc', '.0-rc')
                .replace('preview', '.0-preview');
            return versionPart.join('.');
        }
    }

    if (versionPart[2] == null) {
        //append patch version if not available
        // e.g. 2.1 -> 2.1.0
        return version.concat('.0');
    } else {
        // handle beta and rc
        // e.g. 1.8.5beta1 -> 1.8.5-beta1, 1.8.5rc1 -> 1.8.5-rc1
        if (preStrings.some(el => versionPart[1].includes(el))) {
            versionPart[2] = versionPart[2]
                .replace('beta', '-beta')
                .replace('rc', '-rc')
                .replace('preview', '-preview');
            return versionPart.join('.');
        }
    }

    return version;
}
