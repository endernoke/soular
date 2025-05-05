# Soular: Connect for a Positive Impact

Soular is a mobile application designed to raise awareness about climate change, bring eco-conscious individuals together to take action, and provide users with personalized insights and recommendations. The app integrates features such as carbon footprint calculation, social media sharing, user-driven event participation system, and AI-powered advice.


## Setup

1. Clone the repository

   ```bash
   git clone https://github.com/endernoke/soular.git
   cd soular
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables
   
   Create a `.env` file in the project directory and add your Supabase credentials. You can find these in your Supabase project settings.

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Initialize the database

   Run the SQL commands in `supabase-setup.sql` in your Supabase project's SQL editor to set up:
   - Database tables
   - Row Level Security (RLS) policies
   - Storage buckets
   - Triggers and functions

> [!NOTE]
> If you are part of the dev team, the database schema is already set up. You can skip this step.

5. Start the app

   ```bash
    npx expo start
   ```

   This will start the Expo development server. Follow the instructions in the terminal to run the app on your device or emulator.

> [!TIP]
> NativeWind is configured for the app, so you can directly use TailWindCSS classes in your components. Note that some classes may not work as expected on certain components, in which case you can simply switch back to using React Native styles.

## Project Structure

> [!IMPORTANT]
> This project uses [Expo Router](https://docs.expo.dev/router/introduction) for file-based routing.

- `src/` - Main source code directory
  - `app/` - Application screens using file-based routing
    - `(app)/` - Protected app routes (requires authentication to access)
      - `(tabs)/` - Bottom tab navigation
    - `auth/` - Authentication screens
  - `components/` - Reusable React components
  - `lib/` - Core functionality and configuration
    - `auth.tsx` - Authentication context and hooks
    - `supabase.ts` - Supabase client configuration
  - `types/` - TypeScript type definitions
  - `global.css` - Global styles using TailwindCSS/NativeWind
- `assets/` - Static assets
  - `images/` - App icons and images
  - `fonts/` - Custom fonts
- `docs/` - Documentation and schemas (mainly intended for LLMs)

## Database Schema

See `llms/DATABASE.md` for detailed information about:
- Database tables and relationships
- Row Level Security (RLS) policies
- Storage configuration
- Data validation rules
