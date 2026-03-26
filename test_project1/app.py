password = "admin123"  
api_key = "sk_live_999XYZ"  

print("Running app...")

# weak crypto

import hashlib

hash = hashlib.md5(b"password").hexdigest()
print(hash)