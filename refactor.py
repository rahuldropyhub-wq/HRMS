import os
import shutil
import re
from pathlib import Path

# Paths
SRC_DIR = Path('src')

PAGES_DIR = SRC_DIR / 'pages'
COMPONENTS_DIR = SRC_DIR / 'components'
STYLES_DIR = SRC_DIR / 'styles'

PAGES_EMP = PAGES_DIR / 'employee'
PAGES_ADM = PAGES_DIR / 'admin'

COMPONENTS_EMP = COMPONENTS_DIR / 'employee'
COMPONENTS_ADM = COMPONENTS_DIR / 'admin'

STYLES_EMP = STYLES_DIR / 'employee'
STYLES_ADM = STYLES_DIR / 'admin'

# Create dirs
for d in [PAGES_EMP, PAGES_ADM, COMPONENTS_EMP, COMPONENTS_ADM, STYLES_EMP, STYLES_ADM]:
    d.mkdir(parents=True, exist_ok=True)

# 1. Move styles
for f in STYLES_DIR.glob('*.css'):
    if f.is_file():
        if f.name.startswith('admin-'):
            shutil.move(str(f), str(STYLES_ADM / f.name))
        else:
            shutil.move(str(f), str(STYLES_EMP / f.name))

# 2. Move components
for f in COMPONENTS_DIR.glob('*.jsx'):
    if f.is_file():
        if f.name.startswith('Admin'):
            shutil.move(str(f), str(COMPONENTS_ADM / f.name))
        else:
            shutil.move(str(f), str(COMPONENTS_EMP / f.name))

# 3. Move pages
for f in PAGES_DIR.glob('*.jsx'):
    if f.is_file():
        if f.name.startswith('Admin'):
            shutil.move(str(f), str(PAGES_ADM / f.name))
        else:
            shutil.move(str(f), str(PAGES_EMP / f.name))

# We also have App.jsx in src/
# 4. Update imports in all JSX files
def update_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We need to compute the relative prefix (e.g. '../' or '../../')
    # src/App.jsx has depth 1.
    # src/pages/employee/X.jsx has depth 3.
    parts = file_path.parts
    depth = len(parts) - 2 # relative to src/
    
    if depth == 0:
        prefix = './'
    else:
        prefix = '../' * depth
        
    # We will do regex replacements based on the old imports.
    # We know what the old imports looked like. They were either:
    # from './pages/X'
    # from '../components/X'
    # from '../../styles/X' etc.
    
    # Instead of perfectly calculating everything, we can just replace the known file basenames
    # But it's safer to use regex on import lines.
    
    new_content = content
    
    # Helper to calculate new relative path
    def get_new_rel_path(target_type, target_file):
        # target_type: 'pages', 'components', 'styles'
        # Check if it's admin or employee
        is_admin = target_file.startswith('Admin') or target_file.startswith('admin-')
        sub = 'admin' if is_admin else 'employee'
        return f"{prefix}{target_type}/{sub}/{target_file}"
        
    # Find all import lines
    import_pattern = re.compile(r'import\s+.*?from\s+[\'"](.*?)[\'"];?|import\s+[\'"](.*?)[\'"];?')
    
    def replacer(match):
        orig_line = match.group(0)
        import_path = match.group(1) or match.group(2)
        
        if not import_path: return orig_line
        
        if import_path.startswith('.'): # Relative import
            # extract the actual filename
            filename = import_path.split('/')[-1]
            if '.css' in filename:
                new_path = get_new_rel_path('styles', filename)
                return orig_line.replace(import_path, new_path)
            elif 'pages' in import_path or 'components' in import_path or filename.endswith('.jsx'):
                # it's a jsx file
                # check which dir it belongs to
                target_type = 'pages' if 'pages' in orig_line else 'components'
                # but App.jsx imports from './pages/X', pages import from '../components/X'
                if 'components' in import_path:
                    new_path = get_new_rel_path('components', filename)
                elif 'pages' in import_path:
                    new_path = get_new_rel_path('pages', filename)
                else:
                    return orig_line
                
                # if there is no extension in original, drop it from new_path
                if not import_path.endswith('.jsx') and not import_path.endswith('.css'):
                    new_path = new_path.replace('.jsx', '')
                    
                return orig_line.replace(import_path, new_path)
                
        return orig_line
        
    new_content = import_pattern.sub(replacer, content)
    
    # Handle the specific AdminLogin/AdminDashboard routes in App.jsx which were already in ./pages/admin/
    if file_path.name == 'App.jsx':
        new_content = new_content.replace('./pages/admin/admin/', './pages/admin/')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {file_path}")

for file_path in SRC_DIR.rglob('*.jsx'):
    update_imports(file_path)

print("Refactor complete.")
