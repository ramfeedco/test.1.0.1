// Test Module Loading - Debug 503 errors
console.log('🧪 Module Loading Test - Starting...');

// Test 1: Check if modules-loader.js loaded
setTimeout(() => {
    console.log('🧪 Test 1: Checking modules-loader.js');
    const modulesLoaderScript = Array.from(document.scripts).find(
        script => script.src && script.src.includes('modules-loader.js')
    );
    console.log('   modules-loader.js script:', modulesLoaderScript ? '✅ Found' : '❌ Not found');
    if (modulesLoaderScript) {
        console.log('   URL:', modulesLoaderScript.src);
    }
}, 1000);

// Test 2: Check if modules are on window
setTimeout(() => {
    console.log('🧪 Test 2: Checking modules on window');
    const moduleNames = ['Users', 'Dashboard', 'FireEquipment', 'Violations', 'Employees'];
    moduleNames.forEach(name => {
        const module = window[name];
        console.log(`   ${name}:`, typeof module !== 'undefined' ? '✅ Found' : '❌ Not found');
        if (typeof module !== 'undefined' && typeof module === 'object') {
            console.log(`      Properties:`, Object.keys(module).slice(0, 5));
        }
    });
}, 2000);

// Test 3: Try to load a module directly
setTimeout(() => {
    console.log('🧪 Test 3: Direct module load test');
    const testScript = document.createElement('script');
    testScript.src = 'js/modules/modules/users.js';
    testScript.onload = () => console.log('   ✅ users.js loaded directly');
    testScript.onerror = (e) => {
        console.error('   ❌ users.js failed to load directly');
        console.error('   Error:', e);
        // Try fetch to see HTTP status
        fetch('js/modules/modules/users.js', { method: 'HEAD' })
            .then(r => console.log('   HTTP Status:', r.status, r.statusText))
            .catch(err => console.error('   Fetch error:', err.message));
    };
    document.head.appendChild(testScript);
}, 3000);

// Test 4: Check if sections exist in DOM
setTimeout(() => {
    console.log('🧪 Test 4: Checking DOM sections');
    const sections = ['dashboard-section', 'users-section', 'fire-equipment-section'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        console.log(`   ${id}:`, section ? '✅ Found' : '❌ Not found');
    });
}, 4000);

// Test 5: Check if data loading functions are called
setTimeout(() => {
    console.log('🧪 Test 5: Checking data loading');
    if (typeof window.UI !== 'undefined' && window.UI.loadSectionData) {
        console.log('   UI.loadSectionData: ✅ Available');
        // Try to load dashboard data
        window.UI.loadSectionData('dashboard');
    } else {
        console.log('   UI.loadSectionData: ❌ Not available');
    }
}, 5000);
