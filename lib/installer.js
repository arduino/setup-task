"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env["RUNNER_TEMP"] || "";
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const restm = __importStar(require("typed-rest-client/RestClient"));
const semver = __importStar(require("semver"));
if (!tempDirectory) {
    let baseLocation;
    if (process.platform === "win32") {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env["USERPROFILE"] || "C:\\";
    }
    else {
        if (process.platform === "darwin") {
            baseLocation = "/Users";
        }
        else {
            baseLocation = "/home";
        }
    }
    tempDirectory = path.join(baseLocation, "actions", "temp");
}
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const io = require("@actions/io");
let osPlat = os.platform();
let osArch = os.arch();
function getTask(version, repoToken) {
    return __awaiter(this, void 0, void 0, function* () {
        // resolve the version number
        const targetVersion = yield computeVersion(version, repoToken);
        if (targetVersion) {
            version = targetVersion;
        }
        // look if the binary is cached
        let toolPath;
        toolPath = tc.find("task", version);
        // if not: download, extract and cache
        if (!toolPath) {
            toolPath = yield downloadRelease(version);
            core.debug("Task cached under " + toolPath);
        }
        toolPath = path.join(toolPath, "bin");
        core.addPath(toolPath);
    });
}
exports.getTask = getTask;
function downloadRelease(version) {
    return __awaiter(this, void 0, void 0, function* () {
        // Download
        let fileName = getFileName();
        let downloadUrl = util.format("https://github.com/go-task/task/releases/download/%s/%s", version, fileName);
        let downloadPath = null;
        try {
            downloadPath = yield tc.downloadTool(downloadUrl);
        }
        catch (error) {
            core.debug(error);
            throw `Failed to download version ${version}: ${error}`;
        }
        // Extract
        let extPath = null;
        if (osPlat == "win32") {
            extPath = yield tc.extractZip(downloadPath);
            // Create a bin/ folder and move `task` there
            yield io.mkdirP(path.join(extPath, "bin"));
            yield io.mv(path.join(extPath, "task.exe"), path.join(extPath, "bin"));
        }
        else {
            extPath = yield tc.extractTar(downloadPath);
            // Create a bin/ folder and move `task` there
            yield io.mkdirP(path.join(extPath, "bin"));
            yield io.mv(path.join(extPath, "task"), path.join(extPath, "bin"));
        }
        // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
        return yield tc.cacheDir(extPath, "task", version);
    });
}
function getFileName() {
    const platform = osPlat == "win32" ? "windows" : osPlat;
    const arch = osArch == "x64" ? "amd64" : "386";
    const ext = osPlat == "win32" ? "zip" : "tar.gz";
    const filename = util.format("task_%s_%s.%s", platform, arch, ext);
    return filename;
}
// Retrieve a list of versions scraping tags from the Github API
function fetchVersions(repoToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (repoToken != "") {
            rest = new restm.RestClient("setup-taskfile", "", [], {
                headers: { Authorization: "Bearer " + repoToken }
            });
        }
        else {
            rest = new restm.RestClient("setup-taskfile");
        }
        let tags = (yield rest.get("https://api.github.com/repos/go-task/task/git/refs/tags")).result || [];
        return tags
            .filter(tag => tag.ref.match(/v\d+\.[\w\.]+/g))
            .map(tag => tag.ref.replace("refs/tags/v", ""));
    });
}
// Compute an actual version starting from the `version` configuration param.
function computeVersion(version, repoToken) {
    return __awaiter(this, void 0, void 0, function* () {
        // strip leading `v` char (will be re-added later)
        if (version.startsWith("v")) {
            version = version.slice(1, version.length);
        }
        // strip trailing .x chars
        if (version.endsWith(".x")) {
            version = version.slice(0, version.length - 2);
        }
        const allVersions = yield fetchVersions(repoToken);
        const possibleVersions = allVersions.filter(v => v.startsWith(version));
        const versionMap = new Map();
        possibleVersions.forEach(v => versionMap.set(normalizeVersion(v), v));
        const versions = Array.from(versionMap.keys())
            .sort(semver.rcompare)
            .map(v => versionMap.get(v));
        core.debug(`evaluating ${versions.length} versions`);
        if (versions.length === 0) {
            throw new Error("unable to get latest version");
        }
        core.debug(`matched: ${versions[0]}`);
        return "v" + versions[0];
    });
}
// Make partial versions semver compliant.
function normalizeVersion(version) {
    const preStrings = ["beta", "rc", "preview"];
    const versionPart = version.split(".");
    if (versionPart[1] == null) {
        //append minor and patch version if not available
        // e.g. 2 -> 2.0.0
        return version.concat(".0.0");
    }
    else {
        // handle beta and rc
        // e.g. 1.10beta1 -? 1.10.0-beta1, 1.10rc1 -> 1.10.0-rc1
        if (preStrings.some(el => versionPart[1].includes(el))) {
            versionPart[1] = versionPart[1]
                .replace("beta", ".0-beta")
                .replace("rc", ".0-rc")
                .replace("preview", ".0-preview");
            return versionPart.join(".");
        }
    }
    if (versionPart[2] == null) {
        //append patch version if not available
        // e.g. 2.1 -> 2.1.0
        return version.concat(".0");
    }
    else {
        // handle beta and rc
        // e.g. 1.8.5beta1 -> 1.8.5-beta1, 1.8.5rc1 -> 1.8.5-rc1
        if (preStrings.some(el => versionPart[2].includes(el))) {
            versionPart[2] = versionPart[2]
                .replace("beta", "-beta")
                .replace("rc", "-rc")
                .replace("preview", "-preview");
            return versionPart.join(".");
        }
    }
    return version;
}
