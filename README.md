# Job Applications Dashboard

A sophisticated data grid application built with Next.js 15, React 19, and AG Grid, featuring advanced data manipulation and URL-based state management.

## ✨ Features

- **Data Grid**
  - Display and interact with tabular data
  - Column filtering and sorting
  - Column reordering and hiding
  - Global search across all columns
  - Pagination (20 rows per page default)
  - Export to Excel and CSV formats

- **State Management**
  - URL-based state persistence using nuqs
  - Shareable URLs with all grid state preserved
  - State includes: hidden columns, sort order, current page, filters, and search query

- **Tech Stack**
  - Next.js 15 with App Router
  - React 19 with TypeScript (strict mode)
  - shadcn/ui for accessible UI components
  - AG Grid Community for high-performance data grid
  - Tailwind CSS for styling
  - nuqs for URL state management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. Start the development server:
   ```bash
   # Using Bun (recommended)
   bun dev

   # Or using npm
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Available Scripts

- `bun dev` - Start the development server
- `bun build` - Build the application for production
- `bun start` - Start the production server
- `bun test` - Run tests
- `bun lint` - Run ESLint

## 🧪 Testing

Run the test suite with:

```bash
bun test
```

## 🏗️ Building for Production

1. Create a production build:
   ```bash
   bun run build
   ```

2. Start the production server:
   ```bash
   bun start
   ```

## 📦 Dependencies

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [AG Grid](https://www.ag-grid.com/) - Data grid
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [nuqs](https://github.com/47ng/nuqs) - URL state management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗️ Project Structure

```
src/
├── app/                  # Next.js app router pages
│   └── page.tsx          # Main application page
├── components/           # Reusable components
│   ├── data-grid/        # Data grid related components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🔧 Technologies Used

- **Frontend Framework**: Next.js 15 with React 19
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Data Grid**: AG Grid Community
- **State Management**: React hooks + URL state with nuqs
- **Styling**: Tailwind CSS
- **Build Tool**: Bun (or npm)
- **Testing**: Jest, React Testing Library

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import your repository on [Vercel](https://vercel.com/import)
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy!

### Netlify

1. Push your code to a Git repository
2. Create a new site in Netlify and link to your repository
3. Set the build command to `npm run build`
4. Set the publish directory to `.next`
5. Deploy!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [AG Grid](https://www.ag-grid.com/) - The Best JavaScript Grid in the World
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- Feature completeness
- Build success (zero warnings/errors)
- Git commit history
- Documentation quality

## Implementation Steps

1. **Setup**
   ```bash
   git clone <base-project-url>
   cd <project-directory>
   bun install # or npm install
   ```

2. **Development**
   ```bash
   bun dev # or npm run dev
   ```

3. **Build**
   ```bash
   bun run build # or npm run build
   ```

## Submission
1. Create your public GitHub repository
2. Implement the solution
3. Update README with:
   - Setup instructions
   - Development commands
   - Any additional features/notes
4. Share repository link with us

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