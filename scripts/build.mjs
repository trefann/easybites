import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = process.cwd();
const outputDirectory = join(projectRoot, "dist");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all([
  copyFile(
    join(projectRoot, "index.html"),
    join(outputDirectory, "index.html"),
  ),
  cp(join(projectRoot, "src"), join(outputDirectory, "src"), {
    recursive: true,
  }),
  cp(join(projectRoot, "public"), outputDirectory, {
    recursive: true,
  }),
]);

console.log("Built the EasyBites static site in dist/");
