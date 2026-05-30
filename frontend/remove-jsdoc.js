const fs = require('fs');
const path = require('path');
// Target folder: default ke parameter yang dikirim via terminal, atau folder saat ini './'
const targetDir = process.argv[2] || './';
// Ekstensi file yang akan di-scan (bisa disesuaikan dengan React/React Native kamu)
const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx'];
// Folder yang TIDAK boleh disentuh
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.expo'];
function removeJSDoc(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Regex 1: Menghapus JSDoc dan block comment ( dan )
    const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
    // Regex 2: Menghapus baris kosong ekstra yang tersisa setelah JSDoc dihapus
    const emptyLinesRegex = /^\s*[\r\n]/gm;
    const newContent = content
        .replace(blockCommentRegex, '')
        .replace(emptyLinesRegex, ''); // (Opsional) Hapus baris kosong jika ingin lebih rapi
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ JSDoc dihapus: ${filePath}`);
    }
}
function walkDirectory(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                // Lewati folder yang ada di ignoreDirs
                if (!ignoreDirs.includes(file)) {
                    walkDirectory(fullPath);
                }
            } else {
                // Proses hanya file dengan ekstensi yang diizinkan
                const ext = path.extname(fullPath);
                if (allowedExtensions.includes(ext)) {
                    removeJSDoc(fullPath);
                }
            }
        }
    } catch (err) {
        console.error(`Gagal membaca direktori ${dir}:`, err.message);
    }
}
console.log(`🔍 Memulai pembersihan JSDoc di: ${path.resolve(targetDir)}`);
walkDirectory(targetDir);
console.log('🎉 Proses selesai!');