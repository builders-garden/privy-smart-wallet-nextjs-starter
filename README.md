# Privy Smart Wallet Next.js Starter

This project is a Next.js starter application that demonstrates the integration of Privy Smart Wallets for signing and executing transactions on the Base and Base Sepolia networks.

## Features

- Privy authentication and embedded wallets
- Smart wallet integration
- Signing messages
- Sending USDC transactions
- Chain switching between Base and Base Sepolia
- Balance display for both embedded and smart wallets

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
yarn install
```

3. Set up your environment variables:

Create a `.env.local` file in the root directory and add your Privy App ID:

```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Contains the main application pages and layout
- `components/`: Reusable React components
- `lib/`: Utility functions and constants
- `public/`: Static assets

## Dependencies

Key dependencies include:

- Next.js
- React
- Privy SDK (@privy-io/react-auth, @privy-io/wagmi)
- Wagmi
- Viem
- NextUI

For a full list of dependencies, refer to the `package.json` file.

## Learn More

To learn more about the technologies used in this starter:

- [Next.js Documentation](https://nextjs.org/docs)
- [Privy Documentation](https://docs.privy.io/)
- [Privy Smart Wallets Documentation](https://docs.privy.io/guide/react/wallets/smart-wallets/)
- [Wagmi Documentation](https://wagmi.sh/)
- [NextUI Documentation](https://nextui.org/)

## Deployment

This project can be easily deployed on Vercel. For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).