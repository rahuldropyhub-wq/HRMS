const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/pages/admin/employee/EmployeeProfile.jsx',
  'src/pages/admin/employee/AddEmployee.jsx',
  'src/pages/admin/payroll/PayrollProcessing.jsx',
  'src/pages/admin/payroll/SalarySlips.jsx',
  'src/pages/admin/settings/SettingsLayout.jsx',
  'src/pages/admin/settings/GeneralSettings.jsx',
  'src/pages/admin/settings/RoleManagement.jsx',
  'src/pages/admin/settings/NotificationSettings.jsx',
  'src/pages/admin/settings/BrandingSettings.jsx',
  'src/pages/admin/worksheet/WorksheetDashboard.jsx',
  'src/pages/admin/worksheet/WorksheetReview.jsx',
  'src/pages/admin/worksheet/WorksheetTemplates.jsx',
  'src/pages/admin/assets/AssetInventory.jsx',
  'src/pages/admin/assets/AssetAssign.jsx',
  'src/pages/admin/AdminDashboard.jsx'
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath}, does not exist`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add import if not exists
  if (content.includes('<select') && !content.includes('CustomDropdown')) {
    // Find the last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      // We need relative path to components/admin/CustomDropdown
      // Let's just use the exact relative path by calculating it
      const depth = filePath.split('/').length - 2; // src/pages/admin/employee/... -> depth = 3
      let prefix = '';
      for (let i = 0; i < depth; i++) prefix += '../';
      prefix += 'components/admin/CustomDropdown';
      
      content = content.slice(0, endOfLine + 1) + `import CustomDropdown from '${prefix}';\n` + content.slice(endOfLine + 1);
    }
  }

  // Find and replace selects
  const selectRegex = /<select\s+([^>]*)>([\s\S]*?)<\/select>/g;
  
  content = content.replace(selectRegex, (match, propsString, innerHTML) => {
    // 1. Extract props
    let valueMatch = propsString.match(/value={([^}]+)}/) || propsString.match(/value="([^"]+)"/);
    let onChangeMatch = propsString.match(/onChange={([^}]+)}/);
    let classNameMatch = propsString.match(/className="([^"]+)"/);
    let styleMatch = propsString.match(/style={([^}]+)}/);
    
    let value = valueMatch ? (propsString.includes('value="') ? `"${valueMatch[1]}"` : `{${valueMatch[1]}}`) : '""';
    
    let newOnChange = '';
    if (onChangeMatch) {
       let fnBody = onChangeMatch[1]; 
       if (fnBody.includes('e =>') || fnBody.includes('e=>')) {
           newOnChange = fnBody.replace(/e\s*=>/, '(val) =>').replace(/e\.target\.value/g, 'val');
       } else if (fnBody.includes('(e) =>')) {
           newOnChange = fnBody.replace(/\(e\)\s*=>/, '(val) =>').replace(/e\.target\.value/g, 'val');
       } else {
           // Direct function reference? Keep it as is but wrap it
           newOnChange = `(val) => ${fnBody}({target: {value: val}})`;
       }
    }
    
    // 2. Extract options
    let options = [];
    const optionRegex = /<option\s+(?:value="([^"]*)"|value={([^}]+)})[^>]*>([\s\S]*?)<\/option>/g;
    let optMatch;
    let hasOptions = false;
    while ((optMatch = optionRegex.exec(innerHTML)) !== null) {
      hasOptions = true;
      let val = optMatch[1] !== undefined ? `'${optMatch[1]}'` : optMatch[2]; // handle value="" or value={10}
      let label = optMatch[3].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').replace(/'/g, "\\'");
      options.push(`{ value: ${val}, label: '${label}' }`);
    }
    
    // Fallback if regex failed to find options (e.g. dynamic mapping)
    if (!hasOptions && innerHTML.includes('.map')) {
        // Leave the select alone if it has dynamic options, it's too complex
        console.log(`Dynamic options found in ${filePath}, skipping this select`);
        return match;
    }
    
    // 3. Reconstruct
    let optionsStr = `[\n              ${options.join(',\n              ')}\n            ]`;
    
    let isPagination = styleMatch && styleMatch[1].includes('marginLeft');
    
    let dropdownHtml = `<CustomDropdown
            value=${value}
            onChange={${newOnChange}}
            options={${optionsStr}}
            ${isPagination ? 'size="sm"' : 'fullWidth'}
          />`;
          
    if (isPagination) {
        return `<div style={{ marginLeft: '12px', display: 'inline-block', width: '100px', verticalAlign: 'middle' }}>
              ${dropdownHtml}
            </div>`;
    } else {
        return `<div style={{ width: '180px' }}>
          ${dropdownHtml}
        </div>`;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

filesToProcess.forEach(processFile);
console.log('Done!');
