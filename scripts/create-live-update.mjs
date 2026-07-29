import { zip } from "zip-a-folder";

await zip("./dist", "./live-update.zip");
console.log("Created live-update.zip");
