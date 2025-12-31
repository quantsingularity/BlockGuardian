# Contributing to BlockGuardian

Thank you for your interest in contributing to BlockGuardian! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

BlockGuardian is committed to providing a welcoming and inclusive environment for all contributors.

**Expected Behavior:**

- Be respectful and considerate
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

**Unacceptable Behavior:**

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- Git
- Code editor (VS Code recommended)

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/BlockGuardian.git
cd BlockGuardian

# Add upstream remote
git remote add upstream https://github.com/abrar2030/BlockGuardian.git
```

### Setup Development Environment

```bash
# Run setup script
./scripts/setup_blockguardian_env.sh

# Verify setup
./scripts/health_check.sh
```

## Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Convention:**

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/component-name` - Code refactoring
- `test/test-description` - Test additions

### 2. Make Changes

Make your changes following our code style guidelines.

### 3. Test Your Changes

```bash
# Run all tests
./scripts/run_unified_tests.sh

# Run specific tests
cd code/backend && pytest tests/test_your_feature.py
cd code/blockchain && npx hardhat test
cd web-frontend && npm test
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add portfolio rebalancing feature"
```

**Commit Message Convention:**

Format: `<type>: <subject>`

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tools

Examples:

```
feat: add multi-factor authentication
fix: resolve portfolio calculation error
docs: update API documentation
test: add tests for compliance module
```

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit the PR

## Code Style Guidelines

### Python (Backend)

**Formatter:** Black
**Linter:** Flake8
**Type Checker:** MyPy

```bash
# Format code
black code/backend/src/

# Lint code
flake8 code/backend/src/

# Type check
mypy code/backend/src/
```

**Style Rules:**

- Use 4 spaces for indentation
- Max line length: 88 characters
- Use type hints for function signatures
- Use docstrings for all functions and classes

Example:

```python
def create_portfolio(
    user_id: int,
    name: str,
    risk_tolerance: str
) -> Portfolio:
    """
    Create a new investment portfolio.

    Args:
        user_id: The ID of the portfolio owner
        name: Portfolio name
        risk_tolerance: Risk level (low, moderate, high)

    Returns:
        Created Portfolio object

    Raises:
        ValidationError: If inputs are invalid
    """
    # Implementation
    pass
```

### JavaScript/TypeScript (Frontend)

**Formatter:** Prettier
**Linter:** ESLint

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**Style Rules:**

- Use 2 spaces for indentation
- Use single quotes for strings
- Always use semicolons
- Use arrow functions for callbacks
- Use const/let, never var

Example:

```javascript
// Good
const fetchPortfolios = async (userId) => {
    try {
        const response = await api.get(`/portfolios?user_id=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch portfolios:', error);
        throw error;
    }
};
```

### Solidity (Smart Contracts)

**Linter:** Solhint

```bash
# Lint contracts
cd code/blockchain
npm run lint:sol
```

**Style Rules:**

- Use 4 spaces for indentation
- Max line length: 120 characters
- Use NatSpec comments
- Follow Solidity style guide

Example:

```solidity
/**
 * @notice Create a new portfolio
 * @param _name Portfolio name
 * @param _description Portfolio description
 * @return portfolioId The ID of the created portfolio
 */
function createPortfolio(
    string memory _name,
    string memory _description
) external returns (uint256 portfolioId) {
    // Implementation
}
```

## Testing Requirements

### Test Coverage Requirements

- Backend: Minimum 80% coverage
- Frontend: Minimum 70% coverage
- Smart Contracts: Minimum 90% coverage

### Writing Tests

**Backend Tests (pytest):**

```python
def test_create_portfolio(client, auth_token):
    """Test portfolio creation endpoint."""
    response = client.post(
        '/api/portfolios',
        headers={'Authorization': f'Bearer {auth_token}'},
        json={
            'name': 'Test Portfolio',
            'risk_tolerance': 'moderate'
        }
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Test Portfolio'
```

**Frontend Tests (Jest + React Testing Library):**

```javascript
test('renders portfolio list', async () => {
    render(<PortfolioList />);
    await waitFor(() => {
        expect(screen.getByText('My Portfolios')).toBeInTheDocument();
    });
});
```

**Smart Contract Tests (Hardhat):**

```javascript
describe('PortfolioManager', function () {
    it('Should create a portfolio', async function () {
        const [owner] = await ethers.getSigners();
        const tx = await portfolioManager.createPortfolio('Test Portfolio', 'Description');
        await tx.wait();
        const portfolios = await portfolioManager.getUserPortfolios(owner.address);
        expect(portfolios.length).to.equal(1);
    });
});
```

### Running Tests

```bash
# All tests with coverage
./scripts/run_unified_tests.sh --coverage

# Backend only
cd code/backend
pytest --cov=src --cov-report=html

# Frontend only
cd web-frontend
npm test -- --coverage

# Smart contracts only
cd code/blockchain
npx hardhat test
npx hardhat coverage
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe the tests you ran

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one maintainer approval required
3. All comments must be resolved
4. Branch must be up to date with main

### After Merge

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Documentation

### When to Update Documentation

- Adding new features
- Changing existing features
- Fixing significant bugs
- Updating configuration options
- Adding new APIs or endpoints

### Documentation Locations

| Type          | Location                |
| ------------- | ----------------------- |
| API Reference | `docs/API.md`           |
| User Guide    | `docs/USAGE.md`         |
| Configuration | `docs/CONFIGURATION.md` |
| Examples      | `docs/examples/`        |
| Code Comments | Inline in source files  |

### Documentation Style

- Use clear, concise language
- Include code examples
- Provide context and use cases
- Keep formatting consistent
- Use tables for structured data

### Updating Documentation

```bash
# Create docs branch
git checkout -b docs/update-api-docs

# Make changes to docs/

# Test locally (if applicable)
cd docs && make html

# Commit and push
git add docs/
git commit -m "docs: update API documentation"
git push origin docs/update-api-docs

# Create PR
```

## Community

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check docs first

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**

- OS: [e.g., Ubuntu 20.04]
- Python version: [e.g., 3.9.7]
- Node.js version: [e.g., 18.12.0]

**Additional context**
Add any other context
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
Other solutions you've considered

**Additional context**
Add any other context or screenshots
```

## Recognition

Contributors will be recognized in:

- `CONTRIBUTORS.md` file
- Release notes
- Project README

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
