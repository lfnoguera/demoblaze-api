const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const reportsDir = path.join(__dirname, '..', 'cypress', 'reports');

console.log('🔍 Verificando archivos de reporte...');

const jsonFiles = fs.readdirSync(reportsDir)
  .filter(file => file.endsWith('.json') && file !== 'consolidated-report.json');

if (jsonFiles.length === 0) {
  console.log('❌ No se encontraron archivos JSON de reporte para fusionar');
  console.log('💡 Asegúrate de ejecutar las pruebas primero con: npm run test:api');
  process.exit(1);
}

console.log(`📊 Encontrados ${jsonFiles.length} archivo(s) de reporte:`);
jsonFiles.forEach(file => console.log(`   - ${file}`));

try {
  console.log('📄 Generando reporte HTML...');
  
  if (jsonFiles.length === 1) {
    const jsonFile = path.join(reportsDir, jsonFiles[0]);
    console.log(`📊 Usando archivo: ${jsonFiles[0]}`);
    
    execSync(`marge "${jsonFile}" --reportDir cypress/reports --inline`, { stdio: 'inherit' });
  } else {
    console.log('🔄 Fusionando múltiples reportes...');
    
    const consolidatedPath = path.join(reportsDir, 'consolidated-report.json');
    if (fs.existsSync(consolidatedPath)) {
      fs.unlinkSync(consolidatedPath);
    }
    
    execSync(`mochawesome-merge cypress/reports/*.json > cypress/reports/consolidated-report.json`, { stdio: 'inherit' });
    
    if (!fs.existsSync(consolidatedPath) || fs.readFileSync(consolidatedPath, 'utf8').trim() === '') {
      throw new Error('El archivo consolidado no se generó correctamente');
    }
    
    execSync(`marge cypress/reports/consolidated-report.json --reportDir cypress/reports --inline`, { stdio: 'inherit' });
  }
  
  console.log('✅ Reporte generado exitosamente!');
  console.log('📁 Ubicación: cypress/reports/consolidated-report.html');
  
} catch (error) {
  console.error('❌ Error al generar el reporte:', error.message);
  process.exit(1);
}
