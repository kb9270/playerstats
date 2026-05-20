import soccerdata as sd
import pandas as pd

fbref = sd.FBref(leagues="ENG-Premier League", seasons="2425")
df = fbref.read_player_season_stats(stat_type="standard")
print("Index names:", df.index.names)
print("Columns:", df.columns.tolist())
df.reset_index().to_csv("test_soccerdata.csv", index=False)
print("Saved 1 sample to test_soccerdata.csv")
