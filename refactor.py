import os
import re

pages = [
    'Dashboard.jsx', 'LeaveManagement.jsx', 'Worksheet.jsx', 'Tasks.jsx', 
    'Tickets.jsx', 'Assets.jsx', 'Holidays.jsx', 'Attendance.jsx', 'Settings.jsx'
]

for page in pages:
    path = os.path.join('src', 'pages', page)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern_start = re.compile(r'<div className="dashboard-layout">.*?<header className="dashboard-header.*?</header>', re.DOTALL)
    
    if '<DashboardLayout>' not in content:
        new_content = pattern_start.sub('<DashboardLayout>', content)
        
        last_div_idx = new_content.rfind('</div>')
        if last_div_idx != -1:
            new_content = new_content[:last_div_idx] + '</DashboardLayout>' + new_content[last_div_idx+6:]
            
        import_stmt = "import DashboardLayout from '../components/DashboardLayout';\n"
        if 'import DashboardLayout' not in new_content:
            new_content = new_content.replace("import '../styles/dashboard.css';", "import DashboardLayout from '../components/DashboardLayout';\nimport '../styles/dashboard.css';")
            
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Refactored {page}')
