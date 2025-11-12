# Sanakampa

Työkalu puheterapeuteille ja kielenkäytön ammattilaisille suomenkielisten sanojen hakemiseen ja minimiparianalyysin tekemiseen.

🌐 **Sovellus:** https://sanakampa.celssi.fi

## Ominaisuudet

- Sanojen haku määriteltyjen sääntöjen perusteella
- Minimiparianalyysi
- Tiettyjen äännemuutosten etsiminen (esim. l→j)
- Nopea haku Web Worker -teknologialla

## Hakusyntaksi

| Merkki | Kuvaus | Esimerkki |
|--------|--------|-----------|
| `*` | Korvaa yhden tai useamman merkin | `koir*` löytää "koira", "koiras" |
| `%` | Korvaa täsmälleen yhden merkin | `koir%` löytää "koira" mutta ei "koiras" |
| `(k)` | Korvaa yhden konsonantin | `(k)oira` löytää "koira", "loira" jne. |
| `(v)` | Korvaa yhden vokaalin | `k(v)ira` löytää "keira", "koira" jne. |
| `l->j` | Etsi minimipareja tietyllä äännemuutoksella | Löytää parit joissa 'l' muuttuu 'j':ksi |

## Teknologiat

- Angular 17.3
- TypeScript
- TailwindCSS
- Web Workers
- RxJS

## Asennus ja käyttö

### Edellytykset

- Node.js 20+
- Yarn

### Kehitysympäristö

```bash
# Asenna riippuvuudet
yarn install

# Käynnistä kehitysserveri
ng serve

# Avaa http://localhost:4200/
```

### Tuotantoversio

```bash
# Rakenna tuotantoversio
ng build --configuration production

# Rakennustulokset löytyvät dist/ -hakemistosta
```

### Docker

```bash
# Rakenna Docker-image
docker build -t sanakampa .

# Käynnistä kontti
docker run -p 3000:3000 sanakampa

# Avaa http://localhost:3000/
```

## Projektin rakenne

```
src/
├── app/
│   ├── app.component.ts       # Pääkomponentti
│   ├── app.component.html     # UI-pohja
│   ├── app.worker.ts          # Web Worker laskutoimituksille
│   ├── MinimumPair.ts         # Minimiparin tietorakenne
│   └── ProcessPackage.ts      # Worker-viestien tietorakenne
├── sanat.json                 # Suomenkielinen sanalista (50 000+ sanaa)
└── styles.scss                # Yleiset tyylit
```

## Kehitetty

Celssin puheterapeuteille.
