const { mkdirSync, writeFileSync, chmodSync, existsSync } = require("fs");
const { execSync } = require("child_process");
const { resolve, dirname } = require("path");
const request = require("sync-request");
const os = require("os");

const platform = os.platform();
const architecture = os.arch();

const patch = verifyOS(platform, architecture);

if (patch !== null) {
    console.log("Starting installation of Galadriel CSS...");

    const downloadUrl = `https://github.com/patrickgunnar/galadrielcss/releases/latest/download/galadrielcss-${patch}${
        platform === "win32" ? ".exe" : ""
    }`;

    console.log(`Downloading Galadriel CSS binary for: ${patch}`);

    try {
        const response = request("GET", downloadUrl);
        console.log("Galadriel CSS binary downloaded successfully!");

        const outputPath = resolve("bin", "galadrielcss");

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, response.getBody());
        chmodSync(outputPath, 0o755); // Grant execute permissions to the binary

        if (existsSync(outputPath)) {
            console.log(`Galadriel CSS binary installed at: ${outputPath}`);
        } else {
            console.error("Galadriel CSS binary not found!");
        }
    } catch (error) {
        console.error("Error during installation:", error.message);
        console.error("Stack trace:", error.stack);

        throw error;
    }
}

function verifyOS(platform, architecture) {
    console.log(`Detecting OS and architecture: ${platform} - ${architecture}`);

    if (platform === "darwin") {
        return architecture.includes("x64")
            ? "x86_64-apple-darwin"
            : "aarch64-apple-darwin";
    } else if (platform === "win32" && architecture.includes("x64")) {
        return "x86_64-pc-windows-msvc";
    } else if (platform === "linux" && architecture.includes("x64")) {
        return detectLinuxDistro();
    }

    console.error("Unsupported OS or architecture. Galadriel CSS cannot run.");

    return null;
}

function detectLinuxDistro() {
    try {
        const result = execSync("ldd $(which ls)", { encoding: "utf-8" });

        if (result.includes("musl")) {
            return "x86_64-unknown-linux-musl";
        }
    } catch (error) {
        console.error("Error detecting Linux distro:", error.message);
        console.log("Defaulting to x86_64-unknown-linux-gnu.");
    }

    return "x86_64-unknown-linux-gnu";
}
