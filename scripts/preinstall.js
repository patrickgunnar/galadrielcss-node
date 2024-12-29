const { execSync } = require("child_process");
const { mkdirSync, writeFileSync, chmodSync } = require("fs");
const os = require("os");
const { resolve, dirname } = require("path");
const request = require("sync-request");

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

        // Grant execute permissions to the binary
        chmodSync(outputPath, 0o755);

        console.log(`Galadriel CSS binary installed at: ${outputPath}`);
    } catch (error) {
        console.error("Error during installation:", error.message);
        console.error("Stack trace:", error.stack);
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
        try {
            const result = execSync("ldd $(which ls)", { encoding: "utf-8" });

            if (result.includes("musl")) {
                return "x86_64-unknown-linux-musl";
            } else if (result.includes("libc.so")) {
                return "x86_64-unknown-linux-gnu";
            }
        } catch (error) {
            console.error("Error detecting Linux distribution:", error.message);
        }
    }

    console.log(
        "Your operating system is currently unsupported. Galadriel CSS cannot run on this system."
    );

    return null;
}
