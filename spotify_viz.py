import pandas as pd
import matplotlib.pyplot as plt

# Données simulées comme si elles venaient de l'API Spotify
data = {
    "artist": ["Drake", "Adele", "The Weeknd", "BTS", "Bad Bunny"],
    "popularity": [98, 92, 94, 89, 90],
    "followers": [70000000, 68000000, 72000000, 60000000, 65000000],
    "genre": ["rap", "soul", "rnb", "kpop", "latin"]
}

df = pd.DataFrame(data)

# Affichage de la popularité des artistes
df.plot(kind="barh", x="artist", y="popularity", title="Popularité des artistes")
plt.xlabel("Popularité")
plt.ylabel("Artiste")
plt.tight_layout()
plt.show()

