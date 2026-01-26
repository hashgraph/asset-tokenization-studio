# Frontend - Scheduler Payment Distribution

Admin panel for the Scheduler Payment Distribution service built with Vite, React, and Chakra UI.

## Table of Contents

- [Installation](#installation)
- [Running the app](#running-the-app)
- [Test](#test)

### Installation

While you can install dependencies directly in this directory, it's recommended to install from the root of the monorepo:

```bash
# From the root directory
npm install
```

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Available environment variables:

- `VITE_API_URL`: Backend API URL
- `VITE_PORT`: Port for the development server

### Running the Application

```bash
npm run dev
```

### Accessing the Application

Once the application is running, access it through:

- **Application**: `http://localhost:5173`

### Building for Production

From the root directory:

```bash
npm run build
```

Or directly from the frontend directory:

```bash
npm run build
```

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

---

## 📚 Documentation

For more information about the project, see:

- [Guides](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/guides)
- [API Documentation](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/api)
- [References](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/references)
