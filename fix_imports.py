import re
from pathlib import Path

# Fix multi-line imports that were missed
for file_path in Path('src').rglob('*.jsx'):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix from '../components/X' to from '../../components/employee/X' (assuming they are in src/pages/employee)
    if 'pages\\employee' in str(file_path) or 'pages/employee' in str(file_path):
        # Fix components
        content = re.sub(r'from\s+[\'"]\.\./components/(.*?)[\'"]', r"from '../../components/employee/\1'", content)
        # Fix styles
        content = re.sub(r'from\s+[\'"]\.\./styles/(.*?)[\'"]', r"from '../../styles/employee/\1'", content)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Fixed multi-line imports.")
