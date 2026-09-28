# Zmrzlinový domek v2 — web

Novější verze webu pro zmrzlinárnu **Zmrzlinový domek** (Nučnice, u přívozu) —
navazuje na [`zmrzlinovy-domek`](https://github.com/Jarousek06/zmrzlinovy-domek),
přidává víc reálných fotek produktů. Statický web bez buildu, `build.py` vyrábí
zminifikovanou verzi pro nasazení.

Barevnost: růžová `#E19FC3` + font **Lato**.

## Struktura

```
zmrzlinovy-domek-v2/
├── index.html
├── assets/          styl, skripty, obrázky (zdroj)
├── build.py         minifikace + sestavení dist/ a ZIPu pro Netlify
├── dist/            vygenerovaný výstup pro nasazení
└── README.md
```

## Lokální spuštění (zdroj)

```bash
python -m http.server 5198 --directory zmrzlinovy-domek-v2
```

Pak otevřít http://localhost:5198 (v `.claude/launch.json` konfigurace `zmrzlinovy-domek-v2`).

## Build a nasazení

```bash
python zmrzlinovy-domek-v2/build.py
```

Vytvoří `zmrzlinovy-domek-v2/dist/` a ZIP připravený pro
[Netlify Drop](https://app.netlify.com/drop). Upravuje se vždy zdroj mimo `dist/`,
ten se přegeneruje buildem.
