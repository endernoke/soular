# Soular

![Soular App Preview](/docs/banner.png)

A one-stop social media platform for youths to complete the conception, coordination and publicity of environmental initiatives.

## Project Overview

### The Problem

In an era of growing environmental concerns, while many teenagers are passionate about environmental causes, they lack a centralized hub to discover green events, share knowledge, and collaborate on eco-friendly initiatives. It's challenging to find and organize local clean-up drives, workshops, or community gardening projects. Information is scattered, and there's no easy way to connect with others who share the same passion for protecting our planet.

### Our Solution

Soular is a mobile application designed to bridge this gap. It serves as a social network for the environmentally conscious, providing a space to connect, learn, and act. Soular empowers users to organize and participate in green events, share their sustainability journey through a social feed, and learn more about their environmental impact.

## Features

- **Social Feed:** A dynamic feed to share and view posts, stories, and updates.
- **User Profiles:** Customizable profiles showcasing a user's bio, posts, and event participation.
- **Events:** Create, discover, and join environmental events like clean-ups, workshops, and seminars.
- **Real-time Chat:**
    - **Direct Messaging:** Connect with other users one-on-one.
    - **Group Chats:** Dedicated chat rooms for event organizers and participants.
- **Learn Section:**
    - **AI Copilot:** Get answers to your environmental questions.
    - **Carbon Footprint Calculator:** Estimate your personal carbon footprint.
    - **Green Event Suggestions:** Explore eco-friendly events tailored for your needs. Directly integrated with the event creation feature.
- **Green Organizations:** A directory of environmental organizations to support and follow.

## Tech Stack

- **Frontend:** React Native with Expo
- **Backend & Database:** Supabase
- **Routing:** Expo Router
- **Styling:** Tailwind CSS (NativeWind)
- **Language:** TypeScript

## Getting Started

Because of financial complications, we will not be deploying to the App Store or Google Play Store in the foreseeable future. Feel free to run the project locally on your machine for development and testing.

### Prerequisites

- Node.js (LTS version)
- npm
- Expo CLI
- A mobile simulator (iOS or Android) or a physical device

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/endernoke/soular
    cd soular
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    This project uses Supabase for its backend. You will need to create a `.env` file in the root of the project and add your Supabase project URL and anon key. You can get these from your Supabase project settings.

    ```
    EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```

    This will start the Metro bundler. Follow the instructions in the terminal to open the app in your mobile simulator or on a physical device.

## Feedback
We value your feedback! If you have any questions, or suggestions, or need support, please reach out to us at endernoke@gmail.com. Please let us know if you want to contribute to the project in any way!

## Credits

[James Zheng](https://github.com/endernoke), [Christopher Wong](https://github.com/christopherwdev), [Linus Chik](https://github.com/linusc9516), Taco Lau, Samuel Tse, Angus Lam, Chris Wang, [Jimmy Liao](https://youtu.be/dQw4w9WgXcQ)
