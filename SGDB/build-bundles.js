const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'public', 'src');
const outputDir = path.join(__dirname, 'public', 'src', 'dist');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const bundles = {
  'bundle-intro.js': ['auth.js', 'script1.js'],
  'bundle-dashboard.js': ['auth.js', 'api.js', 'theme.js', 'script2.js'],
  'bundle-historico.js': ['auth.js', 'api.js', 'theme.js', 'script3.js'],
  'bundle-carteira.js': ['auth.js', 'api.js', 'theme.js', 'script4.js'],
  'bundle-recarga.js': ['auth.js', 'api.js', 'theme.js', 'script5.js'],
};

function buildBundle(outputName, scripts) {
  try {
    let bundleContent = '';
    let totalSize = 0;
    
    scripts.forEach((script, index) => {
      const filePath = path.join(srcDir, script);
      if (!fs.existsSync(filePath)) {
        console.warn(`Arquivo não encontrado: ${script}`);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      bundleContent += `\n// ===== ${index + 1}. ${script} =====\n${content}\n`;
      totalSize += content.length;
    });

    const outputPath = path.join(outputDir, outputName);
    fs.writeFileSync(outputPath, bundleContent);
    
    return {
      name: outputName,
      scripts: scripts.length,
      size: (bundleContent.length / 1024).toFixed(2),
      originalSize: (totalSize / 1024).toFixed(2)
    };
    
  } catch (err) {
    console.error(`Erro ao criar ${outputName}:`, err.message);
    return null;
  }
}

console.log('Iniciando build de bundles...');

const results = [];
for (const [outputName, scripts] of Object.entries(bundles)) {
  const result = buildBundle(outputName, scripts);
  if (result) {
    results.push(result);
  }
}

console.log('Build concluído!');
console.log('Bundles gerados:');
console.table(results);

const totalBundleSize = results.reduce((sum, r) => sum + parseFloat(r.size), 0);
const totalOriginalSize = results.reduce((sum, r) => sum + parseFloat(r.originalSize), 0);
const reduction = (((totalOriginalSize - totalBundleSize) / totalOriginalSize) * 100).toFixed(1);

console.log(`\nResumo:`);
console.log(`Tamanho original: ${totalOriginalSize} KB`);
console.log(`Tamanho bundled: ${totalBundleSize} KB`);
console.log(`Redução de requisições: ${Object.keys(bundles).length * 2} → ${Object.keys(bundles).length}`);
console.log(`\nBundles estão em: ${outputDir}`);
