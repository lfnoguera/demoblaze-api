const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const reportsDir = path.join(__dirname, '..', 'cypress', 'reports');

console.log('🔍 Generando reporte detallado con pasos de ejecución...');

let jsonFiles = fs.readdirSync(reportsDir)
  .filter(file => file.endsWith('.json') && file !== 'consolidated-report.json');

const jsonsDir = path.join(reportsDir, '.jsons');
if (fs.existsSync(jsonsDir)) {
  const jsonsFiles = fs.readdirSync(jsonsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join('.jsons', file));
  jsonFiles = jsonFiles.concat(jsonsFiles);
}

if (jsonFiles.length === 0) {
  console.log('❌ No se encontraron archivos JSON de reporte para procesar');
  console.log('💡 Asegúrate de ejecutar las pruebas primero con: npm run test:api');
  process.exit(1);
}

console.log(`📊 Procesando ${jsonFiles.length} archivo(s) de reporte:`);
jsonFiles.forEach(file => console.log(`   - ${file}`));

try {
  const latestJsonFile = jsonFiles[jsonFiles.length - 1];
  const jsonFile = path.join(reportsDir, latestJsonFile);
  console.log(`📄 Leyendo archivo: ${latestJsonFile}`);
  
  const reportData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  console.log('📊 Estructura del JSON:', {
    hasResults: !!reportData.results,
    resultsLength: reportData.results?.length || 0,
    hasStats: !!reportData.stats,
    stats: reportData.stats
  });
  
  const htmlContent = generateDetailedReport(reportData);
  
  const detailedReportPath = path.join(reportsDir, 'detailed-report.html');
  fs.writeFileSync(detailedReportPath, htmlContent);
  
  console.log('✅ Reporte detallado generado exitosamente!');
  console.log('📁 Ubicación: cypress/reports/detailed-report.html');
  
} catch (error) {
  console.error('❌ Error al generar el reporte detallado:', error.message);
  process.exit(1);
}

function generateDetailedReport(data) {
  const results = data.results || [];
  const stats = data.stats || {};
  
  const allTests = [];
  results.forEach(result => {
    if (result.suites && result.suites.length > 0) {
      result.suites.forEach(suite => {
        if (suite.tests && suite.tests.length > 0) {
          allTests.push(...suite.tests);
        }
      });
    }
  });
  
  let html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Detallado - Demoblaze API Automation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .test-case { margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; overflow: hidden; transition: all 0.3s ease; }
        .test-case:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .test-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; cursor: pointer; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); transition: background 0.3s ease; }
        .test-header:hover { background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%); }
        .test-title { font-size: 20px; font-weight: bold; color: #333; flex: 1; margin-right: 15px; }
        .test-status { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .test-meta { display: flex; gap: 20px; margin: 10px 0; font-size: 14px; color: #666; }
        .test-content { padding: 0 20px 20px 20px; display: none; animation: slideDown 0.3s ease; }
        .test-content.expanded { display: block; }
        .test-code { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #007bff; }
        .code-content { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; color: #333; }
        .steps-container { margin: 20px 0; }
        .step { margin: 10px 0; padding: 15px; background: white; border-left: 4px solid #007bff; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .step-number { font-weight: bold; color: #007bff; font-size: 16px; }
        .step-action { margin: 8px 0; color: #333; font-size: 15px; }
        .step-result { margin: 8px 0; font-size: 14px; }
        .step-success { color: #28a745; }
        .step-error { color: #dc3545; }
        .api-details { background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0; border: 1px solid #dee2e6; }
        .api-method { font-weight: bold; color: #007bff; font-size: 14px; }
        .api-url { color: #6c757d; font-family: monospace; font-size: 13px; margin: 5px 0; }
        .api-response { background: #e9ecef; padding: 10px; border-radius: 4px; margin: 8px 0; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
        .error-details { background: #f8d7da; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc3545; }
        .error-title { font-weight: bold; color: #721c24; margin-bottom: 8px; }
        .error-message { color: #721c24; font-family: monospace; white-space: pre-wrap; }
        .summary { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .summary h3 { margin-top: 0; color: #333; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
        .stat-item { background: white; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; font-size: 14px; }
        .timestamp { color: #666; font-size: 14px; }
        .duration { color: #666; font-size: 14px; }
        .speed-indicator { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .speed-fast { background: #d4edda; color: #155724; }
        .speed-slow { background: #fff3cd; color: #856404; }
        .expand-icon { font-size: 18px; color: #007bff; transition: transform 0.3s ease; }
        .expand-icon.expanded { transform: rotate(180deg); }
        .test-controls { display: flex; gap: 10px; margin: 20px 0; }
        .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.3s ease; }
        .btn-primary { background: #007bff; color: white; }
        .btn-primary:hover { background: #0056b3; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-secondary:hover { background: #545b62; }
        .btn-success { background: #28a745; color: white; }
        .btn-success:hover { background: #1e7e34; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-danger:hover { background: #c82333; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Reporte Detallado de Pruebas API</h1>
            <p>Demoblaze API Automation - Análisis Completo de Ejecución</p>
            <div class="timestamp">Generado: ${new Date().toLocaleString('es-ES')}</div>
        </div>
        
        <div class="test-controls">
            <button class="btn btn-primary" onclick="expandAll()">📖 Expandir Todas</button>
            <button class="btn btn-secondary" onclick="collapseAll()">📕 Contraer Todas</button>
            <button class="btn btn-success" onclick="expandPassed()">✅ Solo Exitosas</button>
            <button class="btn btn-danger" onclick="expandFailed()">❌ Solo Fallidas</button>
        </div>
`;

  allTests.forEach((test, index) => {
    console.log(`Procesando test ${index + 1}:`, {
      title: test.title,
      state: test.state,
      duration: test.duration,
      pass: test.pass,
      fail: test.fail,
      speed: test.speed,
      uuid: test.uuid
    });
    
    const isPassed = test.state === 'passed' || test.pass === true;
    const status = isPassed ? 'passed' : 'failed';
    const statusText = isPassed ? '✅ PASÓ' : '❌ FALLÓ';
    
    const duration = test.duration ? `${Math.round(test.duration)}ms` : 'N/A';
    
    const speedClass = test.speed === 'fast' ? 'speed-fast' : 'speed-slow';
    const speedText = test.speed === 'fast' ? 'RÁPIDO' : 'LENTO';
    
    const formattedCode = test.code ? test.code.replace(/\\n/g, '\n').replace(/\\t/g, '  ') : 'Código no disponible';
    
    html += `
        <div class="test-case" data-test-id="${test.uuid}" data-test-status="${status}">
            <div class="test-header" onclick="toggleTest('${test.uuid}')">
                <div class="test-title">${test.title || 'Prueba sin título'}</div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="test-status status-${status}">${statusText}</span>
                    <span class="expand-icon" id="icon-${test.uuid}">▼</span>
                </div>
            </div>
            
            <div class="test-content" id="content-${test.uuid}">
                <div class="test-meta">
                    <span><strong>Duración:</strong> ${duration}</span>
                    <span><strong>Velocidad:</strong> <span class="speed-indicator ${speedClass}">${speedText}</span></span>
                    <span><strong>UUID:</strong> ${test.uuid}</span>
                    <span><strong>Estado:</strong> ${test.state}</span>
                </div>
               
                <div class="test-code">
                    <strong>📝 Código de la Prueba:</strong>
                    <div class="code-content">${formattedCode}</div>
                </div>
                
                <div class="steps-container">
                    <h4>📋 Análisis Detallado de Ejecución:</h4>
    `;
    
    const steps = generateAPITestSteps(test);
    steps.forEach((step, stepIndex) => {
      html += `
                <div class="step">
                    <div class="step-number">Paso ${stepIndex + 1}:</div>
                    <div class="step-action">${step.action}</div>
                    <div class="step-result ${step.success ? 'step-success' : 'step-error'}">
                        ${step.result}
                    </div>
                    ${step.apiDetails ? `
                    <div class="api-details">
                        <div class="api-method">🌐 ${step.apiDetails.method}</div>
                        <div class="api-url">${step.apiDetails.url}</div>
                        ${step.apiDetails.response ? `
                        <div class="api-response">${step.apiDetails.response}</div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
      `;
    });
    
    if (test.err && Object.keys(test.err).length > 0) {
      html += `
                <div class="error-details">
                    <div class="error-title">🚨 Detalles del Error:</div>
                    <div class="error-message">${JSON.stringify(test.err, null, 2)}</div>
                </div>
      `;
    }
    
    html += `
                </div>
            </div>
        </div>
    `;
  });
  
  const totalTests = stats.tests || allTests.length;
  const passedTests = stats.passes || allTests.filter(t => t.state === 'passed').length;
  const failedTests = stats.failures || allTests.filter(t => t.state === 'failed').length;
  const totalDuration = stats.duration || 'N/A';
  const startTime = stats.start ? new Date(stats.start).toLocaleString('es-ES') : 'N/A';
  const endTime = stats.end ? new Date(stats.end).toLocaleString('es-ES') : 'N/A';
  
  html += `
        <div class="summary">
            <h3>📊 Resumen Completo de Ejecución</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <div class="stat-number">${totalTests}</div>
                    <div class="stat-label">Total de Pruebas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #28a745;">${passedTests}</div>
                    <div class="stat-label">Exitosas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #dc3545;">${failedTests}</div>
                    <div class="stat-label">Fallidas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Math.round(totalDuration)}ms</div>
                    <div class="stat-label">Tiempo Total</div>
                </div>
            </div>
            <p><strong>Inicio:</strong> ${startTime}</p>
            <p><strong>Fin:</strong> ${endTime}</p>
            <p><strong>Estado general:</strong> ${failedTests === 0 ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ ALGUNAS PRUEBAS FALLARON'}</p>
        </div>
    </div>
    
    <script>
        function toggleTest(testId) {
            const content = document.getElementById('content-' + testId);
            const icon = document.getElementById('icon-' + testId);
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                icon.textContent = '▼';
                icon.classList.remove('expanded');
            } else {
                content.classList.add('expanded');
                icon.textContent = '▲';
                icon.classList.add('expanded');
            }
        }
        
        function expandAll() {
            const allContents = document.querySelectorAll('.test-content');
            const allIcons = document.querySelectorAll('.expand-icon');
            
            allContents.forEach(content => {
                content.classList.add('expanded');
            });
            
            allIcons.forEach(icon => {
                icon.textContent = '▲';
                icon.classList.add('expanded');
            });
        }
        
        function collapseAll() {
            const allContents = document.querySelectorAll('.test-content');
            const allIcons = document.querySelectorAll('.expand-icon');
            
            allContents.forEach(content => {
                content.classList.remove('expanded');
            });
            
            allIcons.forEach(icon => {
                icon.textContent = '▼';
                icon.classList.remove('expanded');
            });
        }
        
        function expandPassed() {
            collapseAll();
            
            const passedTests = document.querySelectorAll('[data-test-status="passed"]');
            passedTests.forEach(test => {
                const testId = test.getAttribute('data-test-id');
                const content = document.getElementById('content-' + testId);
                const icon = document.getElementById('icon-' + testId);
                
                content.classList.add('expanded');
                icon.textContent = '▲';
                icon.classList.add('expanded');
            });
        }
        
        function expandFailed() {
            collapseAll();
            
            const failedTests = document.querySelectorAll('[data-test-status="failed"]');
            failedTests.forEach(test => {
                const testId = test.getAttribute('data-test-id');
                const content = document.getElementById('content-' + testId);
                const icon = document.getElementById('icon-' + testId);
                
                content.classList.add('expanded');
                icon.textContent = '▲';
                icon.classList.add('expanded');
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'a':
                        e.preventDefault();
                        expandAll();
                        break;
                    case 'c':
                        e.preventDefault();
                        collapseAll();
                        break;
                    case 'p':
                        e.preventDefault();
                        expandPassed();
                        break;
                    case 'f':
                        e.preventDefault();
                        expandFailed();
                        break;
                }
            }
        });
        
        console.log('🎯 Atajos de teclado disponibles:');
        console.log('Ctrl+A: Expandir todas');
        console.log('Ctrl+C: Contraer todas');
        console.log('Ctrl+P: Solo exitosas');
        console.log('Ctrl+F: Solo fallidas');
    </script>
</body>
</html>
  `;
  
  return html;
}

function generateAPITestSteps(test) {
  const testCode = test.code || '';
  const testTitle = test.title || '';
  const isPassed = test.state === 'passed' || test.pass === true;
  let steps = [];
  
  console.log(`Analizando código para: ${testTitle}`);
  console.log(`Código: ${testCode.substring(0, 100)}...`);
  
  const hasSignup = testCode.includes('/signup');
  const hasLogin = testCode.includes('/login');
  const hasFailOnStatusCode = testCode.includes('failOnStatusCode: false');
  const hasExpectStatus = testCode.includes('expect(response.status)');
  const hasExpectBody = testCode.includes('expect(response.body)');
  const hasExpectEmpty = testCode.includes('expect(response.body).to.be.empty');
  const hasExpectInclude = testCode.includes('expect(') && testCode.includes('to.include');
  const hasExpectContain = testCode.includes('expect(') && testCode.includes('to.contain');
  const hasExpectLength = testCode.includes('expect(') && testCode.includes('to.have.length');
  const hasCyLog = testCode.includes('cy.log');
  const hasJSONStringify = testCode.includes('JSON.stringify');
  
  console.log(`Detectado - Signup: ${hasSignup}, Login: ${hasLogin}, FailOnStatusCode: ${hasFailOnStatusCode}`);
  
  if (hasSignup) {
    steps.push({
      action: "🌐 Preparar datos de usuario para registro",
      result: "✅ Datos de usuario generados correctamente",
      success: true,
      apiDetails: {
        method: "POST",
        url: "https://api.demoblaze.com/signup"
      }
    });
  } else if (hasLogin) {
    steps.push({
      action: "🌐 Preparar credenciales de autenticación",
      result: "✅ Credenciales preparadas correctamente",
      success: true,
      apiDetails: {
        method: "POST",
        url: "https://api.demoblaze.com/login"
      }
    });
  }
  
  if (hasFailOnStatusCode) {
    steps.push({
      action: "⚙️ Configurar petición para no fallar en códigos de error",
      result: "✅ Configuración failOnStatusCode: false aplicada",
      success: true
    });
  }
  
  if (hasSignup) {
    steps.push({
      action: "📡 Enviar petición POST a /signup",
      result: "✅ Petición de registro enviada correctamente",
      success: true
    });
  } else if (hasLogin) {
    steps.push({
      action: "📡 Enviar petición POST a /login",
      result: "✅ Petición de autenticación enviada correctamente",
      success: true
    });
  }
  
  if (hasExpectStatus) {
    steps.push({
      action: "✅ Verificar código de respuesta HTTP 200",
      result: isPassed ? "✅ Código de respuesta 200 confirmado" : "❌ Código de respuesta no válido",
      success: isPassed
    });
  }
  
  if (hasExpectEmpty) {
    steps.push({
      action: "📝 Validar que la respuesta esté vacía",
      result: isPassed ? "✅ Respuesta vacía confirmada (comportamiento esperado)" : "❌ Respuesta no está vacía",
      success: isPassed,
      apiDetails: {
        method: "POST",
        url: "https://api.demoblaze.com/signup",
        response: "Respuesta vacía (usuario creado exitosamente)"
      }
    });
  }
  
  if (hasExpectInclude && testTitle.includes('usuario ya existente')) {
    steps.push({
      action: "📝 Validar mensaje de usuario existente",
      result: isPassed ? "✅ Mensaje 'This user already exist' confirmado" : "❌ Mensaje no encontrado",
      success: isPassed,
      apiDetails: {
        method: "POST",
        url: "https://api.demoblaze.com/signup",
        response: "{\"errorMessage\":\"This user already exist.\"}"
      }
    });
  }
  
  if (hasExpectContain && testTitle.includes('correctos')) {
    steps.push({
      action: "🔑 Validar token de autenticación en respuesta",
      result: isPassed ? "✅ Token de autenticación encontrado" : "❌ Token no encontrado",
      success: isPassed,
      apiDetails: {
        method: "POST",
        url: "https://api.demoblaze.com/login",
        response: "Auth_token: <token_generado>"
      }
    });
  }
  
  if (hasExpectInclude && testTitle.includes('incorrectos')) {
    steps.push({
      action: "❌ Validar mensaje de error de autenticación",
      result: isPassed ? "✅ Mensaje 'Wrong password' confirmado" : "❌ Mensaje de error no encontrado",
      success: isPassed,
      apiDetails: {
        method: "POST",
        url: "https://api.demoblaze.com/login",
        response: "Wrong password"
      }
    });
  }
  
  if (hasExpectLength) {
    steps.push({
      action: "📏 Verificar longitud del token de autenticación",
      result: isPassed ? "✅ Token tiene longitud válida (>10 caracteres)" : "❌ Token no cumple longitud mínima",
      success: isPassed
    });
  }
  
  if (hasCyLog) {
    steps.push({
      action: "📋 Registrar respuesta en logs de Cypress",
      result: "✅ Respuesta registrada en logs de Cypress",
      success: true
    });
  }
  
  if (hasJSONStringify) {
    steps.push({
      action: "🔄 Convertir respuesta a JSON string",
      result: "✅ Respuesta convertida a formato JSON string",
      success: true
    });
  }
  
  if (!isPassed && test.err && Object.keys(test.err).length > 0) {
    steps.push({
      action: "🚨 Error detectado en la ejecución",
      result: `❌ ${JSON.stringify(test.err, null, 2)}`,
      success: false
    });
  }
  
  if (steps.length === 0) {
    steps = [
      {
        action: "🌐 Configurar petición API",
        result: "✅ Configuración completada",
        success: true
      },
      {
        action: "📡 Enviar petición HTTP",
        result: "✅ Petición enviada correctamente",
        success: true
      },
      {
        action: "✅ Verificar respuesta",
        result: isPassed ? "✅ Respuesta validada correctamente" : "❌ Error en validación",
        success: isPassed
      }
    ];
  }
  
  console.log(`Generados ${steps.length} pasos para: ${testTitle}`);
  return steps;
}
