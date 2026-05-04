import sys
from pathlib import Path
import json

sys.path.append(str(Path(__file__).parent.resolve()))

from scanner.engine import scan_project

if __name__ == "__main__":
    target_path = Path(r"d:\Projects\MiniProject\BugShield_AI\bugshield\test_projects\comprehensive_test")
    res = scan_project(target_path)
    
    for f in res.get("findings", []):
        print(f"- {f.get('issue')} in {f.get('file')}:{f.get('line')}")
