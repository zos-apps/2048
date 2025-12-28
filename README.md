# 🔢 2048

Join the numbers and get to 2048!

## Category
`games`

## Installation

```bash
npm install @anthropic/2048
# or
pnpm add @anthropic/2048
```

## Usage

```tsx
import App from '@anthropic/2048';

function MyComponent() {
  return <App onClose={() => console.log('closed')} />;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev
```

## zOS Integration

This app is designed to run within zOS, a web-based operating system. It follows the zOS app specification with:

- Standalone React component
- TypeScript support
- Tailwind CSS styling
- Window management integration

## License

MIT
