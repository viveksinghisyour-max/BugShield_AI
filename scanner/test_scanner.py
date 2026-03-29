import unittest
import os
from secret_scanner import scan_file
from dependency_scanner import check_package_vulnerability
from scanner import scan_project

class TestBugShieldScanner(unittest.TestCase):
    def test_secret_scanner(self):
        # Create a temporary file with a hardcoded password
        import tempfile
        
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".py") as f:
            f.write('password = "admin_password"\n')
            temp_path = f.name
            
        try:
            issues = scan_file(temp_path)
            self.assertTrue(any(issue["issue"] == "Hardcoded Password" for issue in issues))
        finally:
            os.remove(temp_path)
            
    def test_dependency_scanner_safe(self):
        # A test for a package with no known vulnerabilities (dummy check)
        issues = check_package_vulnerability("this_package_does_not_exist_xyz123", "1.0.0")
        self.assertEqual(len(issues), 0)

    def test_all_test_projects(self):
        # Ensure it can scan the entire test_projects directory and return a valid list 
        test_projects_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_projects"))
        if os.path.exists(test_projects_dir):
            issues = scan_project(test_projects_dir)
            self.assertIsInstance(issues, list)

if __name__ == "__main__":
    unittest.main()
