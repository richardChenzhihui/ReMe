# ReMe Frontend

Follow the steps below to install dependencies, start the development server, and build the project.

## Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) 

## Installation

Clone the repository and install dependencies:

```sh
# Install dependencies using npm
npm install
```

## Configure Environment Variables

Please set the `VITE_API_URL` environment variable in both `.env.development` and `.env.production` to ensure proper functionality.

## Start Development Server

Run the following command to start the development server:

```sh
npm run dev
```

The server will start and the application will be available at:
```
http://localhost:5173/
```

## Build for Production

To create an optimized production build, run:

```sh
npm run build
```

The production-ready files will be generated in the `dist/` directory.

## Preview the Production Build

To locally preview the production build:

```sh
npm run preview
```

This will start a local server and serve the built files.


