const fs = require('fs-extra');
const path = require('path');
const mimetype = require('mimetype');
const express = require('express');

const PORT = 9000;
const app = express();

const public = path.join(__dirname, 'public');

const getPath = (pathname, ...seg) => path.normalize(path.join(public, pathname, ...seg));

const FS_TYPE = {
    get none() { return 0; },
    get file() { return 1; },
    get dir() { return 2; },
}

const stat = async (pathname) => {
    try {
        const stats = await fs.stat(pathname);
        if (stats.isDirectory()) return FS_TYPE.dir;
        if (stats.isFile()) return FS_TYPE.file;
    } catch (err) {
        if (err.code === 'ENOENT') {
            return FS_TYPE.none;
        }
        throw err;
    }
}

app.get('*', async (req, res) => {
    try {
        const ftype = await stat(getPath(req.path));
        switch (ftype) {
            case FS_TYPE.dir: {
                const fpath = getPath(req.path, 'index.html');
                const dtype = await stat(fpath);
                if (dtype === FS_TYPE.none) {
                    return res.status(404).end();
                }
                res.setHeader('Content-Type', 'text/html');
                res.status(200).send(await fs.readFile(fpath));
                break;
            }
            case FS_TYPE.file: {
                const fpath = getPath(req.path);
                res.setHeader('Content-Type', mimetype.lookup(fpath));
                res.status(200).send(await fs.readFile(fpath));
                break;
            }
            case FS_TYPE.none: {
                res.status(404).sendFile(getPath('404', 'index.html'));
            }
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}/blog`);
});