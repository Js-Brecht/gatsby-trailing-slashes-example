/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const fs = require('fs-extra');
const path = require('path');

exports.onPostBuild = async ({ pathPrefix }) => {
    const public = path.join(__dirname, 'public');
    if (pathPrefix) {
        const prefixedPath = path.join(public, pathPrefix);
        if (await fs.pathExists(prefixedPath)) {
            await fs.unlink(prefiexedPath);
        }
        const files = await fs.readdir(public);
        await fs.ensureDir(prefixedPath);
        return Promise.all(
            files.map((file) => fs.move(path.join(public, file), path.join(prefixedPath, file)))
        )
    }
}