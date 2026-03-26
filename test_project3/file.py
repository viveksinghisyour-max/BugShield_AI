filename = input("Enter file name: ")

with open(filename, "r") as f:
    print(f.read())