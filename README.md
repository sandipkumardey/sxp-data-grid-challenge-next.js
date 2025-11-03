# Next.js Data Grid Implementation Challenge

## Overview
Build a sophisticated data grid application using Next.js 15 and React 19 that demonstrates your expertise in modern web development practices, state management, and TypeScript.

## 🚀 Implementation Approach

### Architecture & Design
- **Component-Based Architecture**: Built with reusable, modular components following the Single Responsibility Principle
- **Custom Hooks**: Created custom hooks (`useGridState`, `useGridUrlState`) for state management logic
- **Type-First Development**: Implemented strict TypeScript types for all components and utilities
- **Performance Optimization**: Leveraged React.memo, useMemo, and useCallback for optimal rendering

### Key Technical Decisions
1. **State Management**
   - Used nuqs for URL-based state management to enable shareable links and browser history
   - Implemented a custom hook (`useGridState`) to abstract grid state management
   - Persisted column state, filters, and sort order in the URL

2. **Data Grid Implementation**
   - Chose AG Grid Community for its robust feature set and performance
   - Implemented custom cell renderers for better UX (e.g., status badges, action buttons)
   - Added support for dynamic column generation based on skills data

3. **Type Safety**
   - Created comprehensive TypeScript interfaces for all data structures
   - Used generics for reusable components
   - Implemented type guards for runtime type checking

4. **UI/UX Considerations**
   - Implemented responsive design with mobile-first approach
   - Added loading states and error boundaries
   - Included keyboard navigation and ARIA labels for accessibility

### Development Workflow
1. **Setup & Configuration**
   - Initialized Next.js with TypeScript template
   - Integrated shadcn/ui for consistent UI components
   - Set up ESLint, Prettier, and Git hooks

2. **Feature Implementation**
   - Implemented core data grid functionality first
   - Added URL state synchronization
   - Enhanced with additional features (export, search, filters)

3. **Testing & Refinement**
   - Manual testing of all user flows
   - Performance profiling and optimization
   - Code review and refactoring

## Requirements

### Tech Stack
- Next.js 15 with React 19
- TypeScript (strict mode)
- shadcn/ui for UI components
- AG Grid Community for data grid
- nuqs for URL state management
- Bun.js as package manager (preferred)

### Core Features
1. Data Grid Implementation
   - Use sample data from `sample-applications.json` in project root
   - Implement column filtering and sorting
   - Enable column reordering and hiding
   - Add global search functionality
   - Support pagination (20 rows per page default)
   - Add export functionality (Excel, CSV)
   - Array of skils should be displayed in the grid each in their own column just like the other columns in the grid

2. State Management
   - Implement URL-based state management using nuqs
   - URL should reflect:
     - Hidden columns
     - Sort order and column
     - Current page number
     - Active filters
     - Search query
     - Rows per page selection

3. TypeScript
   - Implement proper type definitions
   - Ensure type safety across the application
   - No implicit any types

## Getting Started

1. Create a new public GitHub repository
2. Clone the base project
3. Replace this README with your implementation
4. Share your repository link for review

## Evaluation Criteria
- Code quality and organization
- TypeScript implementation
- Feature completeness
- Build success (zero warnings/errors)
- Git commit history
- Documentation quality

## 🛠️ Implementation Steps

### 1. Project Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/sxp-data-grid-challenge-next.js.git
cd sxp-data-grid-challenge-next.js

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

### 2. Development
```bash
# Start development server
bun dev

# Run linter
bun run lint

# Run type checking
bun run type-check
```

### 3. Building for Production
```bash
# Create production build
bun run build

# Start production server
bun run start

# Analyze bundle size
ANALYZE=true bun run build
```

### 4. Testing
```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Generate test coverage report
bun test --coverage
```

## 📦 Submission

### Completed Implementation
- [x] **Core Data Grid** with sorting, filtering, and pagination
- [x] **URL State Management** using nuqs
- [x] **TypeScript** with strict type checking
- [x] **Responsive Design** for all screen sizes
- [x] **Export Functionality** (Excel, CSV)
- [x] **Comprehensive Documentation**

### Deployment
1. Push your code to a public GitHub repository:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

2. Deploy to Vercel (recommended):
   - Connect your GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `bun run build`
     - Output Directory: `.next`
     - Install Command: `bun install`
   - Add environment variables if needed
   - Deploy!

### Repository Structure
```
├── .github/           # GitHub workflows and templates
├── public/            # Static files
├── src/
│   ├── app/           # Next.js 13+ app directory
│   ├── components/    # Reusable components
│   ├── features/      # Feature-based modules
│   ├── lib/           # Utilities and helpers
│   └── styles/        # Global styles
├── .env.example      # Environment variables template
├── next.config.js    # Next.js configuration
└── package.json      # Project dependencies
```

## Time Expectation
- Take the time you need to deliver quality work
- Focus on implementing all required features
- Ensure thorough documentation

## Questions?
Feel free to reach out if you have any questions or need clarification about the requirements.

## Notes
- Attention to detail in TypeScript implementation is crucial
- Code organization and cleanliness will be evaluated
- Consider edge cases in your implementation
- Write clear documentation for your code

---
*Happy Coding! We look forward to reviewing your implementation.*