var fs = require('fs');
var gulp = require('gulp');
var shelljs = require('shelljs');
var path = require('path');
var fsExtra = require('fs-extra');
var through2 = require('through2');

gulp.task('copyFiles', function (done) {
    copyFiles();
    done();
});

function copyFiles() {
    const sourceDir = path.join(__dirname, 'src', 'app', 'blocks-section');
    const destinationDir = path.join(__dirname, 'public', 'assets', 'code-snippet');
    if (!fsExtra.existsSync(sourceDir)) {
        console.error(`Error: Source directory does not exist: ${sourceDir}`);
        return;
    }
    if (!fsExtra.existsSync(destinationDir)) {
        fsExtra.mkdirSync(destinationDir, { recursive: true });
    }
    return gulp.src(path.join(sourceDir, '**', '*'), { base: sourceDir })
        .pipe(through2.obj(function (file, enc, cb) {
            if (file.stat.isDirectory()) {
                const dirContents = fsExtra.readdirSync(file.path);
                const hasOnlyFiles = dirContents.every(item =>
                    fsExtra.statSync(path.join(file.path, item)).isFile()
                );
                if (hasOnlyFiles && dirContents.length > 0) {
                    const relativePath = path.relative(sourceDir, file.path);
                    const newPath = path.join(destinationDir, path.basename(file.path));
                    fsExtra.ensureDirSync(newPath);
                    dirContents.forEach(item => {
                        const sourcePath = path.join(file.path, item);
                        const destPath = path.join(newPath, item);

                        if (item === 'page.tsx') {
                            let content = fsExtra.readFileSync(sourcePath, 'utf8');
                            content = content.replace(/\{\/\* SB Code - Start \*\/\}[\s\S]*?\{\/\* SB Code - End \*\/\}/g, '');
                            content = content.replace(/\/\* SB Code - Start \*\/[\s\S]*?\/\* SB Code - End \*\//g, '');
                            content = content.replace(/\n\s*\n/g, '\n\n');
                            fsExtra.writeFileSync(destPath, content);
                        } else {
                            fsExtra.copySync(sourcePath, destPath);
                        }
                    });
                    console.log(`Processed folder: ${relativePath}`);
                }
            }
            cb();
        }))
        .on('end', function () {
            console.log('Leaf-level folders containing only files copied successfully');
        })
        .on('error', function (err) {
            console.error('Error occurred:', err);
        });
}