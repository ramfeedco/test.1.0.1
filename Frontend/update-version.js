const fs = require('fs');
const path = require('path');

/**
 * سكربت لتحديث رقم إصدار التطبيق في جميع الملفات ذات الصلة.
 *
 * الاستخدام:
 *   node update-version.js 1.0.3
 *
 * سيتم تحديث:
 * - Frontend/package.json               → الحقل "version"
 * - Frontend/version.json               → الحقل "version"
 * - vercel-deploy/frontend/version.json → الحقل "version"
 * - Frontend/js/modules/app-utils.js    → AppState.appVersion
 * - vercel-deploy/frontend/js/modules/app-utils.js → AppState.appVersion
 * - Backend/VERSION_INFO.txt            → سطر "الإصدار: X"
 * - vercel-deploy/backend/VERSION_INFO.txt → سطر "الإصدار: X"
 */

function updateJsonVersion(filePath, newVersion) {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
        console.warn(`⚠️ الملف غير موجود (تخطي): ${absPath}`);
        return;
    }
    const raw = fs.readFileSync(absPath, 'utf8');
    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        console.error(`❌ تعذر قراءة JSON من: ${absPath}`, e);
        process.exitCode = 1;
        return;
    }
    if (!data || typeof data !== 'object') {
        console.error(`❌ محتوى غير متوقع في: ${absPath}`);
        process.exitCode = 1;
        return;
    }
    data.version = newVersion;
    fs.writeFileSync(absPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`✅ تم تحديث version في ${filePath} إلى ${newVersion}`);
}

function updateAppStateVersion(filePath, newVersion) {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
        console.warn(`⚠️ الملف غير موجود (تخطي): ${absPath}`);
        return;
    }
    const raw = fs.readFileSync(absPath, 'utf8');
    const regex = /(appVersion\s*:\s*')[^']*(')/;
    if (!regex.test(raw)) {
        console.warn(`⚠️ لم يتم العثور على appVersion في: ${filePath} (تخطي)`);
        return;
    }
    const updated = raw.replace(regex, `$1${newVersion}$2`);
    fs.writeFileSync(absPath, updated, 'utf8');
    console.log(`✅ تم تحديث AppState.appVersion في ${filePath} إلى ${newVersion}`);
}

function updateVersionInfoTxt(filePath, newVersion) {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
        console.warn(`⚠️ الملف غير موجود (تخطي): ${absPath}`);
        return;
    }
    const raw = fs.readFileSync(absPath, 'utf8');
    const regex = /(الإصدار:\s*)[0-9.]+/;
    if (!regex.test(raw)) {
        console.warn(`⚠️ لم يتم العثور على سطر "الإصدار:" في: ${filePath} (تخطي)`);
        return;
    }
    const updated = raw.replace(regex, `$1${newVersion}`);
    fs.writeFileSync(absPath, updated, 'utf8');
    console.log(`✅ تم تحديث سطر الإصدار في ${filePath} إلى ${newVersion}`);
}

function main() {
    const newVersion = process.argv[2];
    if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
        console.error('❌ يجب تمرير رقم الإصدار بالشكل: X.Y.Z مثلاً: 1.0.3');
        console.error('مثال: node update-version.js 1.0.3');
        process.exit(1);
        return;
    }

    console.log(`🚀 بدء تحديث رقم الإصدار إلى: ${newVersion}`);

    const root = path.resolve(__dirname, '..');

    // Frontend JSON
    updateJsonVersion(path.join(root, 'Frontend', 'package.json'), newVersion);
    updateJsonVersion(path.join(root, 'Frontend', 'version.json'), newVersion);

    // vercel-deploy JSON
    updateJsonVersion(path.join(root, 'vercel-deploy', 'frontend', 'version.json'), newVersion);

    // AppState.appVersion (Frontend + vercel-deploy)
    updateAppStateVersion(path.join(root, 'Frontend', 'js', 'modules', 'app-utils.js'), newVersion);
    updateAppStateVersion(path.join(root, 'vercel-deploy', 'frontend', 'js', 'modules', 'app-utils.js'), newVersion);

    // VERSION_INFO.txt (Backend + vercel-deploy/backend)
    updateVersionInfoTxt(path.join(root, 'Backend', 'VERSION_INFO.txt'), newVersion);
    updateVersionInfoTxt(path.join(root, 'vercel-deploy', 'backend', 'VERSION_INFO.txt'), newVersion);

    console.log('✅ اكتمل تحديث رقم الإصدار في جميع الملفات المستهدفة.');
}

main();

