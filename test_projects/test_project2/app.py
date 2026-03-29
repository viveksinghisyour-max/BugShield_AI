import os

username = input("Enter username: ")
password = input("Enter password: ")

if username == os.environ.get("ADMIN_USERNAME", "admin") and password == os.environ.get("ADMIN_PASSWORD"):
    print("Login successful")