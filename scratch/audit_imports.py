
import os
import re

src_dir = 'c:/Users/casca/OneDrive/MI_SISTEMA/DESARROLLO/Repositorios/proyectoceedo20/src'

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if '<SectionHeader' in content and 'import SectionHeader' not in content:
                    print(f"Missing import in {path}")
