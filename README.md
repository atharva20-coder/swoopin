# Swoopin

A modern Next.js application for social media management and automation.

## Overview

Swoopin is a powerful platform built with Next.js that helps users manage their social media presence, automate interactions, and analyze performance. The application integrates with various social media platforms and provides a comprehensive dashboard for managing digital presence.

## Features

- 🔐 Secure authentication with Clerk
- 💳 Stripe integration for subscription management
- 🤖 AI-powered automation capabilities
- 📊 Analytics dashboard
- 🔄 Social media platform integrations
- 📱 Responsive design with modern UI
- 🎨 Tailwind CSS styling

## Tech Stack

- **Framework:** Next.js 14
- **Authentication:** Clerk
- **Database:** Prisma
- **Styling:** Tailwind CSS
- **Payment Processing:** Stripe
- **State Management:** Redux
- **API Integration:** React Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/swoopin.git
cd swoopin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add the following variables:
```env
NEXT_PUBLIC_HOST_URL=your_host_url
STRIPE_SUBSCRIPTION_PRICE_ID=your_stripe_price_id
# Add other required environment variables
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── actions/        # Server actions
├── app/            # App router pages
├── components/     # Reusable components
├── constants/      # Constants and configurations
├── hooks/          # Custom React hooks
├── icons/          # SVG icons
├── lib/            # Utility functions
├── providers/      # Context providers
├── redux/          # Redux store and slices
└── types/          # TypeScript types
```

## API Documentation

The application uses Next.js API routes located in `src/app/api/`. Key endpoints include:

- `/api/payment` - Handles Stripe payment sessions
- `/api/webhook` - Processes webhooks from integrated services

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

Copyright (c) 2024 Swoopin. All Rights Reserved.

This software and associated documentation files (the "Software") are proprietary and confidential. The Software is protected by copyright laws and international copyright treaties, as well as other intellectual property laws and treaties.

No part of this Software may be reproduced, modified, displayed, stored in a retrieval system, or transmitted in any form or by any means (electronic, mechanical, photocopying, recording or otherwise), without the prior written permission of Swoopin.

Unauthorized copying, modification, distribution, public display, or use of this Software for any purpose is strictly prohibited and may result in severe civil and criminal penalties.
