# Sanakampa

**Sanakampa** (Finnish: "word competition/match") is a specialized linguistic search tool designed for speech therapists and language professionals working with Finnish. It enables pattern-based word searches and minimum pair discovery, which are essential for speech and language therapy assessment and treatment.

🌐 **Live Demo:** https://sanakampa.celssi.fi

## Features

- **Pattern-based word search** with wildcard support
- **Minimum pairs discovery** - find word pairs that differ by a single phoneme
- **Phoneme-specific filtering** - search for specific sound changes (e.g., l→j)
- **Fast search** with Web Worker processing to keep UI responsive
- **Bilingual interface** - Finnish and English labels

## Search Syntax

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | Matches zero or more characters | `koir*` finds "koira", "koiras" |
| `%` | Matches exactly one character | `koir%` finds "koira" but not "koiras" |
| `(k)` | Matches one consonant | `(k)oira` matches "koira", "loira", etc. |
| `(v)` | Matches one vowel | `k(v)ira` matches "keira", "koira", etc. |
| `l->j` | Find minimum pairs with specific phoneme change | Finds pairs where 'l' changes to 'j' |

## Technology Stack

- **Angular 17.3** - Modern web framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Web Workers** - Offload heavy computation
- **RxJS** - Reactive data handling

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start development server
ng serve

# Navigate to http://localhost:4200/
# The app will automatically reload on file changes
```

### Production Build

```bash
# Build for production
ng build --configuration production

# Build artifacts will be in dist/ directory
```

### Docker

```bash
# Build Docker image
docker build -t sanakampa .

# Run container
docker run -p 3000:3000 sanakampa

# Navigate to http://localhost:3000/
```

## Project Structure

```
src/
├── app/
│   ├── app.component.ts       # Main component with search logic
│   ├── app.component.html     # UI template
│   ├── app.worker.ts          # Web Worker for heavy computation
│   ├── MinimumPair.ts         # Minimum pair interface
│   └── ProcessPackage.ts      # Worker message interface
├── sanat.json                 # Finnish word list (50,000+ words)
└── styles.scss                # Global styles
```

## Use Cases

This tool is specifically designed for:

- **Speech-Language Pathologists** - Assessment and therapy planning
- **Linguistic Research** - Phonological analysis
- **Language Education** - Creating teaching materials
- **Phonetics Study** - Minimal pair identification

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available for educational and clinical use.

## Acknowledgments

Developed for speech therapy professionals at Celssi.
