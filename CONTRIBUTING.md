# Contributing to Growth OS

Thank you for your interest in contributing to Growth OS! This document provides guidelines and information for contributors.

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

1. **Be respectful** - Treat everyone with respect. No harassment, discrimination, or abusive behavior.
2. **Be collaborative** - Work together constructively. Disagree politely.
3. **Be professional** - Focus on the project. Keep discussions on-topic.
4. **Be ethical** - Follow AI ethics guidelines (see below).

## 🤖 AI Ethics Charter

Growth OS uses AI agents to automate business operations. All contributors must adhere to these principles:

### Transparency
- All AI-generated content must be clearly marked as AI-produced
- No hidden automation - users must know when AI is acting on their behalf
- Full audit trail for every AI decision

### Honesty
- **Never** guarantee specific ranking results or business outcomes
- Present AI recommendations as suggestions, not facts
- No fake reviews, testimonials, or misleading claims

### Data Protection
- User data privacy is paramount
- Follow GDPR, CCPA, and applicable regulations
- Minimize data collection - only what's necessary
- Secure encryption for all sensitive data

### Human Oversight
- Critical actions require human approval
- No fully autonomous high-risk decisions
- Users can always override AI recommendations
- Clear escalation paths when AI is uncertain

### Fairness
- Avoid algorithmic bias in recommendations
- Equal treatment regardless of user demographics
- Transparent pricing with no hidden fees

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ and npm/bun
- A Lovable Cloud or Supabase project
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/growth-os.git
cd growth-os

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` and configure your Lovable Cloud credentials.

## 📝 Contribution Guidelines

### Types of Contributions
- 🐛 **Bug fixes** - Fix issues and improve stability
- ✨ **Features** - Add new capabilities (discuss first in Issues)
- 📚 **Documentation** - Improve guides, API docs, examples
- 🌐 **Translations** - Add new language support
- ♿ **Accessibility** - Improve a11y compliance
- 🎨 **Design** - UI/UX improvements

### Pull Request Process

1. **Fork & Branch** - Create a feature branch from `main`
2. **Develop** - Make your changes with clear commits
3. **Test** - Run `npm run test` and ensure all tests pass
4. **Lint** - Run `npm run lint` and fix any issues
5. **Document** - Update docs if needed
6. **PR** - Submit with a clear description

### Commit Convention

We use Conventional Commits:

```
type(scope): description

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(agents): add new competitive analysis agent`
- `fix(auth): resolve session expiry bug`
- `docs(readme): update installation instructions`

### Code Style

- **TypeScript** - Strict mode, explicit types
- **React** - Functional components, hooks
- **Tailwind CSS** - Use semantic tokens from design system
- **Testing** - Write tests for new features

## 🏗️ Architecture Overview

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and agent logic
├── pages/          # Page components
└── i18n/           # Internationalization

supabase/
└── functions/      # Edge Functions (backend)
```

### Key Concepts

- **Agents** - AI workers with specific capabilities (`src/lib/agents/`)
- **Registry** - Central agent management (`agent-registry.ts`)
- **Artifacts** - Standardized agent outputs (JSON schema)
- **Approvals** - Human-in-the-loop system
- **Services** - Modular business departments

## 🌍 Internationalization

To add a new language:

1. Create `src/i18n/locales/{code}.ts` (copy from `en.ts`)
2. Translate all strings
3. Add to `src/i18n/index.ts` resources
4. Test in the UI with the LanguageToggle

## 🐛 Reporting Issues

Use GitHub Issues with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS)
- Screenshots if applicable

## 💬 Getting Help

- 📧 Email: support@growthco.ai
- 💬 Discussions: GitHub Discussions
- 📖 Docs: `/docs` folder

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's proprietary license (see `LICENSE`).

---

Thank you for helping make Growth OS better! 🚀
