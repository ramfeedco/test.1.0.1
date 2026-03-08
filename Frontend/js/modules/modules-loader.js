/**
 * Modules Loader
 * محمل الموديولات - يقوم بتحميل جميع الموديولات المقسمة
 * 
 * هذا الملف يحل محل app-modules.js بعد التقسيم
 */

// 🔥 IMMEDIATE DEBUG - Log that this file is executing
console.log('🔥🔥🔥 modules-loader.js IS EXECUTING NOW!');
console.log('🔥 Document readyState:', document.readyState);
console.log('🔥 Current time:', new Date().toISOString());

// قائمة الموديولات المطلوب تحميلها (32 موديول)
const MODULES_TO_LOAD = [
    'users',
    'incidents',
    'nearmiss',
    'ptw',
    'training',
    'reports',
    'settings',
    'clinic',
    'fireequipment',
    'ppe',
    'periodicinspections',
    'contractors', // يجب تحميله قبل violations لأنه يحتوي على ثوابت مشتركة
    'violations',
    'employees',
    'behaviormonitoring',
    'chemicalsafety',
    'dailyobservations',
    'iso',
    'emergency',
    'safetybudget',
    'actiontrackingregister',
    'hse',
    'safetyperformancekpis',
    'sustainability',
    'riskassessment',
    'riskmatrix', // مصفوفة تقييم المخاطر
    'legaldocuments',
    'safetyhealthmanagement',
    'usertasks',
    'sopjha',
    'aiassistant',
    'useraiassistant',
    'issuetracking',
    'changemanagement',
    'apptester'
];

/**
 * تحميل موديول واحد
 */
function loadModule(moduleName) {
    return new Promise((resolve) => {
        const basePath = 'js/modules/modules/';
        const log = (typeof Utils !== 'undefined' && Utils.safeLog) ? Utils.safeLog : console.log;
        const logError = (typeof Utils !== 'undefined' && Utils.safeError) ? Utils.safeError : console.error;

        // ✅ إضافة timeout عام لمنع Promise غير المحلولة (10 ثوان - مناسب للشبكات البطيئة)
        let isResolved = false;
        const timeoutId = setTimeout(() => {
            if (!isResolved) {
                isResolved = true;
                const warn = (typeof Utils !== 'undefined' && Utils.safeWarn) ? Utils.safeWarn : console.warn;
                warn(`⚠️ Timeout: تحميل ${moduleName} استغرق أكثر من 10 ثوان - الاستمرار...`);
                resolve(); // الاستمرار حتى لو انتهى الوقت
            }
        }, 10000); // 10 ثوان (تقليل تحذيرات Timeout على الشبكات البطيئة)

        const safeResolve = () => {
            if (!isResolved) {
                isResolved = true;
                clearTimeout(timeoutId);
                resolve();
            }
        };

        const script = document.createElement('script');
        script.src = `${basePath}${moduleName}.js`;
        script.async = false; // ✅ تعطيل async لتحسين التوافق مع file:// protocol
        script.defer = true; // استخدام defer بدلاً من async
        
        // ✅ إضافة timestamp لتتبع وقت التحميل
        const startTime = Date.now();
        
        // 🔍 DEBUG: Log the exact URL being loaded
        console.log(`🔍 Loading module: ${moduleName} from URL: ${script.src}`);
        
        script.onload = () => {
            const loadTime = Date.now() - startTime;
            log(`✅ تم تحميل الموديول: ${moduleName} (${loadTime}ms)`);
            
            // 🔍 DEBUG: Verify module is on window
            const globalModule = window[moduleName.charAt(0).toUpperCase() + moduleName.slice(1)] || window[moduleName];
            console.log(`🔍 Module ${moduleName} on window:`, typeof globalModule !== 'undefined' ? '✅ Found' : '❌ Not found');

            // التحقق من تحميل الموديولات المهمة بشكل خاص
            if (moduleName === 'fireequipment') {
                // التحقق من تحميل موديول FireEquipment
                let checkCount = 0;
                const maxChecks = 20; // زيادة عدد المحاولات
                const checkInterval = setInterval(() => {
                    checkCount++;
                    // ✅ التحقق الآمن من وجود الموديول ودالة load
                    if (typeof window.FireEquipment !== 'undefined' && 
                        typeof window.FireEquipment.load === 'function') {
                        log(`✅ FireEquipment متاح على window.FireEquipment مع دالة load`);
                        clearInterval(checkInterval);
                        safeResolve();
                    } else if (checkCount >= maxChecks) {
                        if (typeof window.FireEquipment !== 'undefined') {
                            logError(`⚠️ FireEquipment متاح لكن دالة load غير موجودة أو ليست function`);
                        } else {
                            logError(`⚠️ FireEquipment غير متاح على window بعد ${maxChecks} محاولة`);
                        }
                        clearInterval(checkInterval);
                        safeResolve(); // الاستمرار حتى لو فشل التحقق
                    }
                }, 100);
                return; // لا نستدعي resolve هنا، سنستدعيه في checkInterval
            } else if (moduleName === 'violations') {
                // التحقق من تحميل موديول Violations
                let checkCount = 0;
                const maxChecks = 20; // زيادة عدد المحاولات
                const checkInterval = setInterval(() => {
                    checkCount++;
                    // ✅ التحقق الآمن من وجود الموديول ودالة load
                    if (typeof window.Violations !== 'undefined' && 
                        typeof window.Violations.load === 'function') {
                        log(`✅ Violations متاح على window.Violations مع دالة load`);
                        clearInterval(checkInterval);
                        safeResolve();
                    } else if (checkCount >= maxChecks) {
                        if (typeof window.Violations !== 'undefined') {
                            logError(`⚠️ Violations متاح لكن دالة load غير موجودة أو ليست function`);
                        } else {
                            logError(`⚠️ Violations غير متاح على window بعد ${maxChecks} محاولة`);
                        }
                        clearInterval(checkInterval);
                        safeResolve(); // الاستمرار حتى لو فشل التحقق
                    }
                }, 100);
                return; // لا نستدعي resolve هنا، سنستدعيه في checkInterval
            } else if (moduleName === 'dailyobservations') {
                // محاولة متعددة للتحقق من توفر الموديول ودالة load
                let checkCount = 0;
                const maxChecks = 10;
                const checkInterval = setInterval(() => {
                    checkCount++;
                    // ✅ التحقق الآمن من وجود الموديول ودالة load
                    if (typeof window.DailyObservations !== 'undefined' && 
                        typeof window.DailyObservations.load === 'function') {
                        log(`✅ DailyObservations متاح على window.DailyObservations مع دالة load`);
                        clearInterval(checkInterval);
                        safeResolve();
                    } else if (checkCount >= maxChecks) {
                        if (typeof window.DailyObservations !== 'undefined') {
                            logError(`⚠️ DailyObservations متاح لكن دالة load غير موجودة أو ليست function`);
                        } else {
                            logError(`⚠️ DailyObservations غير متاح على window بعد ${maxChecks} محاولة`);
                        }
                        clearInterval(checkInterval);
                        safeResolve(); // الاستمرار حتى لو فشل التحقق
                    }
                }, 100);
                return; // لا نستدعي resolve هنا، سنستدعيه في checkInterval
            } else if (moduleName === 'contractors') {
                // التحقق من تحميل موديول المقاولين
                let checkCount = 0;
                const maxChecks = 30; // زيادة عدد المحاولات
                const checkInterval = setInterval(() => {
                    checkCount++;
                    // ✅ التحقق الآمن من وجود الموديول ودالة load
                    if (typeof window.Contractors !== 'undefined' && 
                        typeof window.Contractors.load === 'function') {
                        log(`✅ Contractors متاح على window.Contractors مع دالة load`);
                        clearInterval(checkInterval);
                        safeResolve();
                    } else if (checkCount >= maxChecks) {
                        if (typeof window.Contractors !== 'undefined') {
                            logError(`⚠️ Contractors متاح لكن دالة load غير موجودة أو ليست function`);
                        } else {
                            logError(`⚠️ Contractors غير متاح على window بعد ${maxChecks} محاولة`);
                        }
                        clearInterval(checkInterval);
                        safeResolve(); // الاستمرار حتى لو فشل التحقق
                    }
                }, 100);
                return; // لا نستدعي resolve هنا، سنستدعيه في checkInterval
            } else if (moduleName === 'clinic') {
                // ✅ التحقق من تحميل موديول العيادة (Clinic)
                let checkCount = 0;
                const maxChecks = 50; // 50 × 100ms = 5 ثوان
                const checkInterval = setInterval(() => {
                    checkCount++;
                    if (typeof window.Clinic !== 'undefined' && 
                        typeof window.Clinic.load === 'function') {
                        log(`✅ Clinic متاح على window.Clinic مع دالة load`);
                        clearInterval(checkInterval);
                        safeResolve();
                    } else if (checkCount >= maxChecks) {
                        if (typeof window.Clinic !== 'undefined') {
                            logError(`⚠️ Clinic متاح لكن دالة load غير موجودة أو ليست function`);
                        } else {
                            logError(`⚠️ Clinic غير متاح على window بعد ${maxChecks} محاولة`);
                        }
                        clearInterval(checkInterval);
                        safeResolve();
                    }
                }, 100);
                return;
            }

            // ✅ للمواديل الأخرى: انتظار قصير ثم resolve
            // بعض المواديل قد تأخذ وقت قصير للتصدير على window
            setTimeout(() => {
                safeResolve();
            }, 100); // 100ms كافية لمعظم المواديل
        };
        script.onerror = (error) => {
            const loadTime = Date.now() - startTime;
            logError(`❌ فشل تحميل الموديول: ${moduleName} بعد ${loadTime}ms`);
            logError(`   المسار: ${script.src}`);
            logError(`   نوع الخطأ:`, error?.type || 'unknown');
            
            // 🔍 DEBUG: Try to fetch the file directly to see the actual HTTP error
            fetch(script.src, { method: 'HEAD' })
                .then(response => {
                    console.log(`🔍 HTTP Status for ${moduleName}:`, response.status, response.statusText);
                    if (response.status === 503) {
                        console.error(`🚨 503 Service Unavailable - Vercel cannot serve ${moduleName}.js`);
                        console.error(`   URL: ${script.src}`);
                        console.error(`   Possible causes: File not found, deployment issue, or server overload`);
                    }
                })
                .catch(fetchError => {
                    console.error(`🔍 Fetch error for ${moduleName}:`, fetchError.message);
                });
            
            if (error && error.message) {
                logError(`   الخطأ: ${error.message}`);
            }
            safeResolve(); // عدم رفض Promise للسماح بتحميل باقي الموديولات
        };
        document.head.appendChild(script);
    });
}

/**
 * تحميل جميع الموديولات
 */
async function loadAllModules() {
    const log = (typeof Utils !== 'undefined' && Utils.safeLog) ? Utils.safeLog : console.log;
    const logError = (typeof Utils !== 'undefined' && Utils.safeError) ? Utils.safeError : console.error;

    try {
        // التأكد من تحميل Utils و AppState أولاً
        let utilsReady = typeof Utils !== 'undefined';
        let appStateReady = typeof AppState !== 'undefined';
        let waitCount = 0;
        const maxWait = 50; // 5 ثوان

        while ((!utilsReady || !appStateReady) && waitCount < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
            utilsReady = typeof Utils !== 'undefined';
            appStateReady = typeof AppState !== 'undefined';
            waitCount++;
        }

        if (!utilsReady || !appStateReady) {
            logError('❌ فشل تحميل المتطلبات الأساسية (Utils/AppState)');
            return;
        }

        // تحميل contractors أولاً بشكل منفصل لضمان تحميله قبل violations
        const contractorsIndex = MODULES_TO_LOAD.indexOf('contractors');
        if (contractorsIndex !== -1) {
            log('📦 بدء تحميل موديول المقاولين...');
            await loadModule('contractors');
            // انتظار أطول للتأكد من تحميله بالكامل وتصديره
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // التحقق النهائي من تحميل الموديول
            if (typeof window.Contractors !== 'undefined') {
                log('✅ تم تحميل موديول المقاولين بنجاح');
            } else {
                logError('⚠️ تحذير: موديول المقاولين لم يتم تحميله بشكل صحيح');
            }
        }

        // ✅ تحميل باقي الموديولات بشكل تسلسلي (sequential) لتحسين التوافق
        // التحميل المتوازي (parallel) قد يسبب مشاكل مع file:// protocol
        const otherModules = MODULES_TO_LOAD.filter(name => name !== 'contractors');
        
        log(`📦 بدء تحميل ${otherModules.length} موديول...`);
        for (const moduleName of otherModules) {
            try {
                await loadModule(moduleName);
                // انتظار قصير بين المواديل لضمان الاستقرار
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                logError(`❌ خطأ في تحميل ${moduleName}:`, error);
                // الاستمرار حتى لو فشل تحميل موديول واحد
            }
        }

        // انتظار قصير للتأكد من تصدير جميع الموديولات إلى window
        await new Promise(resolve => setTimeout(resolve, 200));

        log('✅ تم تحميل جميع الموديولات بنجاح');
    } catch (error) {
        logError('❌ حدث خطأ في تحميل الموديولات:', error);
    }
}

// تحميل الموديولات عند جاهزية DOM
console.log('🔥 Setting up module loading...');
console.log('🔥 Document readyState:', document.readyState);

// Force immediate execution - don't wait for DOMContentLoaded
(async function immediateLoad() {
    console.log('🔥 IMMEDIATE LOAD FUNCTION EXECUTING');
    
    // Wait a tiny bit for Utils to be available
    let waitCount = 0;
    while (typeof Utils === 'undefined' && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
    }
    
    if (typeof Utils === 'undefined') {
        console.error('❌ Utils not available after 5 seconds - loading anyway');
    } else {
        console.log('✅ Utils is available');
    }
    
    // Start loading immediately
    console.log('🔥 Starting loadAllModules NOW');
    loadAllModules();
})();

// Also set up the normal DOMContentLoaded listener as backup
if (document.readyState === 'loading') {
    console.log('🔥 Document still loading - adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔥 DOMContentLoaded fired - calling loadAllModules');
        loadAllModules();
    });
} else {
    console.log('🔥 Document already loaded - calling loadAllModules immediately');
    loadAllModules();
}
