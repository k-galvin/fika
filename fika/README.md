# Fika: Cafe Discovery & Social App

Fika is a web application designed for coffee enthusiasts to discover, track, and share their favorite cafes. Inspired by the Swedish tradition of "fika" — a cozy coffee and cake break — this app helps users find the perfect spot for their next coffee adventure and share their experiences with friends.

## Features

- **Cafe Discovery:** Explore nearby cafes using an interactive map and a searchable list.
- **Advanced Filtering:** Filter cafes by amenities like Wi-Fi, power outlets, and seating availability.
- **Detailed Cafe Profiles:** View comprehensive details for each cafe, including photos, user ratings, and visitor activity.
- **User Authentication:** Secure sign-up, login, and password management for personalized experiences.
- **Personal Profiles:** Track your visited cafes, view activity charts, and manage your profile.
- **Social Connections:** Find and connect with friends to share cafe discoveries.
- **Suggest a Cafe:** Contribute to the community by suggesting new cafes to be added.
- **Admin Dashboard:** Administrative tools for managing cafe suggestions and other site content.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Supabase](https://supabase.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Mapping:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)
- **Linting:** [ESLint](https://eslint.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v20 or later)
- npm

### Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/your-username/your-repository.git
   ```
2. Navigate to the project directory:
   ```sh
   cd fika
   ```
3. Install NPM packages:
   ```sh
   npm install
   ```
4. Set up your local environment variables by creating a `.env.local` file. You will need to add your Supabase project URL and anon key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

### Running the Development Server

Execute the following command to start the development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Running Tests

To run the full suite of tests and linters, use the `check` script:

```bash
npm run check
```

You can also run tests individually:

- To run the linter:
  ```bash
  npm run lint
  ```
- To run Jest tests in watch mode:
  ```bash
  npm run test
  ```
- To run Jest tests for a CI environment:
  ```bash
  npm run test:ci
  ```