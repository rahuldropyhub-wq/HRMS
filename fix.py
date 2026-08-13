import os
import re

for p in os.listdir('src/pages'):
    if p.endswith('.jsx'):
        path = os.path.join('src', 'pages', p)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Some files might have spaces or newlines before/after </main>
        content = re.sub(r'</main>\s*', '', content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {p}')
