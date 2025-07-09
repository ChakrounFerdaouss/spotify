import pandas as pd
import matplotlib.pyplot as plt
# 1 Popularité des artistes (graphique horizontal avec couleur)

    "artist": ["Drake", "Adele", "The Weeknd", "BTS", "Bad Bunny"],
    "popularity": [98, 92, 94, 89, 90],
    "followers": [70000000, 68000000, 72000000, 60000000, 65000000],
    "genre": ["rap", "soul", "rnb", "kpop", "latin"]
}

df = pd.DataFrame()
# 1 Popularité des artistes (graphique horizontal avec couleur)
# Affichage de la popularité des artistes
df.plot(
    kind="barh",
    x="artist",
    y="popularity",
    color="mediumseagreen",  # couleur
    figsize=(8, 5),          # taille du graphique (largeur, hauteur)
    title="Popularité des artistes"
)
plt.xlabel("Popularité", fontsize=12)
plt.ylabel("Artiste", fontsize=12)
plt.xticks(fontsize=10)
plt.yticks(fontsize=10)
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()





