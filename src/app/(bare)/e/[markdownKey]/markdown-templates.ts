export const DEFAULT_MARKDOWN_CODE = `# My Document

Write your markdown here...

## Section 1

- Item 1
- Item 2
- Item 3

## Section 2

> A blockquote example.

\`\`\`js
console.log('Hello, world!');
\`\`\`
`;

export interface MarkdownTemplate {
  name: string;
  category: string;
  code: string;
}

export const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  {
    name: 'Basic Document',
    category: 'Basic',
    code: `# Document Title

## Introduction

Write your introduction here.

## Main Content

Your main content goes here.

## Conclusion

Wrap up your document here.
`,
  },
  {
    name: 'README',
    category: 'Project',
    code: `# Project Name

Brief description of the project.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`js
const project = require('project-name');
project.doSomething();
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## Contributing

Pull requests are welcome.

## License

MIT
`,
  },
  {
    name: 'Meeting Notes',
    category: 'Work',
    code: `# Meeting Notes

**Date:** YYYY-MM-DD
**Attendees:** Name 1, Name 2, Name 3
**Facilitator:** Name

---

## Agenda

1. Topic 1
2. Topic 2
3. Topic 3

## Discussion

### Topic 1

Notes about topic 1.

### Topic 2

Notes about topic 2.

## Action Items

| Action | Owner | Due Date |
|--------|-------|----------|
| Task 1 | Name  | YYYY-MM-DD |
| Task 2 | Name  | YYYY-MM-DD |

## Next Meeting

**Date:** YYYY-MM-DD
`,
  },
  {
    name: 'Blog Post',
    category: 'Writing',
    code: `# Blog Post Title

*Published: YYYY-MM-DD | Author: Your Name*

---

## Introduction

Hook the reader with an interesting opening paragraph.

## Main Section

Develop your main argument or story here.

### Subsection

Add details and supporting information.

## Conclusion

Summarize the key takeaways and call to action.

---

*Tags: tag1, tag2, tag3*
`,
  },
  {
    name: 'Technical Spec',
    category: 'Work',
    code: `# Technical Specification: Feature Name

**Status:** Draft
**Author:** Name
**Date:** YYYY-MM-DD

---

## Overview

Brief description of what this specification covers.

## Goals

- Goal 1
- Goal 2

## Non-Goals

- Non-goal 1

## Design

### Architecture

Describe the architecture here.

### API

\`\`\`
GET /api/resource
POST /api/resource
\`\`\`

## Implementation Plan

1. Step 1
2. Step 2
3. Step 3

## Open Questions

- [ ] Question 1
- [ ] Question 2
`,
  },
  {
    name: 'Todo List',
    category: 'Basic',
    code: `# Todo List

## Today

- [ ] Task 1
- [ ] Task 2
- [x] Completed task

## This Week

- [ ] Weekly goal 1
- [ ] Weekly goal 2

## Backlog

- [ ] Future task 1
- [ ] Future task 2
`,
  },
  {
    name: 'Changelog',
    category: 'Project',
    code: `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature

### Changed
- Modified behavior

### Fixed
- Bug fix

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release
- Core features

### Fixed
- Initial bug fixes
`,
  },
  {
    name: 'Book Notes',
    category: 'Writing',
    code: `# Book Notes: *Book Title*

**Author:** Author Name
**Date Read:** YYYY-MM-DD
**Rating:** ⭐⭐⭐⭐⭐

---

## Summary

Brief summary of the book.

## Key Ideas

1. **Idea 1** - Explanation
2. **Idea 2** - Explanation
3. **Idea 3** - Explanation

## Memorable Quotes

> "Quote from the book." — Chapter X

## Takeaways

- Takeaway 1
- Takeaway 2

## Would Recommend To

- People interested in X
- Those who want to learn Y
`,
  },
  {
    name: 'Table Example',
    category: 'Basic',
    code: `# Data Table Example

## Simple Table

| Name    | Age | City       |
|---------|-----|------------|
| Alice   | 30  | New York   |
| Bob     | 25  | London     |
| Charlie | 35  | Tokyo      |

## Aligned Table

| Left     | Center   | Right    |
|:---------|:--------:|---------:|
| Left 1   | Center 1 | Right 1  |
| Left 2   | Center 2 | Right 2  |
`,
  },
  {
    name: 'Code Snippets',
    category: 'Technical',
    code: `# Code Examples

## JavaScript

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

## Python

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

## Shell

\`\`\`bash
#!/bin/bash
echo "Hello, World!"
\`\`\`

## SQL

\`\`\`sql
SELECT name, email
FROM users
WHERE active = true
ORDER BY name ASC;
\`\`\`
`,
  },
];
