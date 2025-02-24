# Contributing to Swoopin

Thank you for your interest in contributing to Swoopin! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Adding New Features](#adding-new-features)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Project Structure

Swoopin follows a modular architecture with clear separation of concerns:

```
src/
├── actions/        # Server actions for data mutations
├── app/            # Next.js app router pages and API routes
├── components/     # Reusable UI components
├── constants/      # Global constants and configurations
├── hooks/          # Custom React hooks
├── icons/          # SVG icons as React components
├── lib/            # Utility functions and service integrations
├── providers/      # Context providers (Redux, Theme, etc.)
├── redux/          # Redux store and slices
└── types/          # TypeScript type definitions
```

### Key Directories Explained

- **actions/**: Contains server-side actions for data mutations, organized by feature (analytics, automations, integrations, etc.)
- **app/**: Next.js 14 app router pages and API routes
  - `(auth)/`: Authentication-related pages
  - `(landingpage)/`: Public landing pages
  - `(protected)/`: Authenticated user pages
  - `api/`: API routes for external integrations
- **components/**: 
  - `global/`: Shared components used across multiple pages
  - `ui/`: Basic UI components (buttons, inputs, etc.)

## Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/swoopin.git
   cd swoopin
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   - Copy `.env.example` to `.env`
   - Add required environment variables:
     ```env
     NEXT_PUBLIC_HOST_URL=your_host_url
     STRIPE_SUBSCRIPTION_PRICE_ID=your_stripe_price_id
     # Add other required variables
     ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Adding New Features

1. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Feature Implementation Guidelines**
   - Place new components in appropriate directories:
     - Global components in `src/components/global`
     - Page-specific components in their respective page directories
   - Add new API routes in `src/app/api`
   - Include server actions in `src/actions`
   - Update types in `src/types`

3. **State Management**
   - Use Redux for global state management
   - Create new slices in `src/redux/slices`
   - Use React Query for server state management

4. **Database Changes**
   - Update Prisma schema in `prisma/schema.prisma`
   - Generate migrations:
     ```bash
     npx prisma migrate dev --name your_migration_name
     ```

## Code Style Guidelines

1. **TypeScript**
   - Use TypeScript for all new code
   - Define interfaces and types in `src/types`
   - Avoid using `any` type

2. **Component Structure**
   ```typescript
   import { FC } from 'react';
   
   interface ComponentProps {
     // Define props
   }
   
   export const Component: FC<ComponentProps> = ({ props }) => {
     return (
       // JSX
     );
   };
   ```

3. **Naming Conventions**
   - Components: PascalCase
   - Files: kebab-case
   - Functions: camelCase
   - Constants: UPPER_SNAKE_CASE

4. **CSS/Styling**
   - Use Tailwind CSS classes
   - Follow mobile-first approach
   - Use CSS modules for custom styles

## Testing

1. **Unit Tests**
   - Write tests for utility functions
   - Test React components using React Testing Library
   - Place tests next to the implementation files

2. **Integration Tests**
   - Test API routes
   - Test database interactions
   - Verify feature workflows

## Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation if needed
   - Follow code style guidelines
   - Add comments for complex logic

2. **PR Description**
   - Clearly describe the changes
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process**
   - Address reviewer comments
   - Keep PR scope focused
   - Maintain clear communication

4. **After Merge**
   - Delete your feature branch
   - Update your local main branch

## Questions and Support

If you have questions or need help:
- Open an issue for bugs
- Use discussions for questions
- Join our community channels

Thank you for contributing to Swoopin! Together, we're building a powerful social media management platform.