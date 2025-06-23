const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const archiver = require('archiver');
const path = require('path');

const app = express();
const port = 3000;

// Répertoire racine du projet (parent de builder/)
const rootPath = path.join(__dirname, '..');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Récupérer les noms des micro-apps
app.get('/apps', (req, res) => {
    const appsPath = path.join(rootPath, 'micro-apps');
    const apps = fs.readdirSync(appsPath);
    res.json(apps);
});

// Build sur sélection d'apps
app.post('/build', (req, res) => {
    const selectedApps = req.body.apps;
    if (!selectedApps || selectedApps.length === 0) {
        return res.status(400).send('No apps selected');
    }

    const entryPoints = selectedApps.map(app => `micro-apps/${app}/index.html`).join(' ');

    const buildCommand = `
        ./copy_template.sh &&
        rm -rf dist .parcel-cache &&
        npx parcel build index.html ${entryPoints} --dist-dir dist --no-optimize --no-scope-hoist
    `;

    exec(buildCommand, { cwd: rootPath, shell: '/bin/bash' }, (error, stdout, stderr) => {
        console.log("Build command:", buildCommand);
        console.log("stdout:", stdout);
        console.error("stderr:", stderr);

        if (error) {
            return res.status(500).send(stderr || 'Erreur pendant le build');
        }

        const zipPath = path.join(__dirname, 'dist.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip');

        archive.pipe(output);
        archive.directory(path.join(rootPath, 'dist'), false);
        archive.finalize();

        output.on('close', () => {
            res.download(zipPath);
        });
    });
});

app.listen(port, () => {
    console.log(`Interface de build: http://localhost:${port}`);
});
