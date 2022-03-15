import os
import pandas as pd

print("Starting read-in")

data = pd.read_csv("https://staging-ddw.devinit.org/api/export/1241/")
data = pd.DataFrame(data)
print(data)
