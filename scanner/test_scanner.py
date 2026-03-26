import unittest
from secret_scanner import scan_file
from dependency_scanner import check_package_vulnerability

class TestBugShieldScanner(unittest.TestCase):
    def test_secret_scanner(self):
        # Create a temporary file with a hardcoded password
        import tempfile
        import os
        
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

if __name__ == "__main__":
    unittest.main()
