import kagglehub
import os
import pandas as pd

# Download latest version
path = kagglehub.dataset_download("hubertsidorowicz/football-players-stats-2025-2026")

print("Path to dataset files:", path)
for root, dirs, files in os.walk(path):
    for f in files:
        print(f)
        if f.endswith('.csv'):
            df = pd.read_csv(os.path.join(root, f))
            print("Lines:", len(df))
            print("Columns:", list(df.columns))
            # Save it locally
            df.to_csv("players_data_2025_2026.csv", index=False)
            print("Saved to players_data_2025_2026.csv")
