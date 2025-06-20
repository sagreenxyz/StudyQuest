# StudyQuest Question Schema Documentation

This document describes the JSON schema for creating question sets in StudyQuest.

## Question Set Structure

```json
{
  "name": "Question Set Name",
  "description": "Optional description of the question set",
  "subject": "Subject Area",
  "questions": [
    // Array of questions
  ]
}
```

## Base Question Properties

All questions share these common properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the question |
| `type` | string | Yes | Question type: `"multiple-choice"`, `"select-all"`, `"flashcard"`, `"fact-card"`, or `"matching"` |
| `subject` | string | Yes | Subject area (e.g., "Biology", "Chemistry", "Physics") |
| `topic` | string | Yes | Specific topic within the subject (e.g., "Cell Structure", "Photosynthesis") |
| `chapter` | string | No | Chapter or section name |
| `difficulty` | string | Yes | Difficulty level: `"easy"`, `"medium"`, or `"hard"` |
| `tags` | string[] | No | Array of tags for categorization |
| `image` | string | No | URL or base64 encoded image for the question |
| `imageAlt` | string | No | Alt text for accessibility |

## Question Types

### 1. Multiple Choice Questions

Single-answer questions with multiple options.

```json
{
  "id": "bio-ch1-001",
  "type": "multiple-choice",
  "subject": "Biology",
  "topic": "Cell Structure",
  "chapter": "Chapter 1: Introduction to Biology",
  "difficulty": "easy",
  "question": "What is the basic unit of life?",
  "options": [
    "Atom",
    "Cell",
    "Molecule",
    "Tissue"
  ],
  "correctAnswer": 1,
  "explanation": "The cell is the smallest structural and functional unit of life.",
  "image": "https://example.com/cell-diagram.jpg",
  "imageAlt": "Diagram of a basic cell structure",
  "tags": ["fundamentals", "cell-biology"]
}
```

#### Additional Properties for Multiple Choice:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `question` | string | Yes | The question text |
| `options` | string[] | Yes | Array of answer choices |
| `correctAnswer` | number | Yes | Index of the correct answer (0-based) |
| `explanation` | string | No | Detailed explanation for the answer |

### 2. Select-All Questions

Multi-select questions where multiple answers may be correct.

```json
{
  "id": "bio-ch1-002",
  "type": "select-all",
  "subject": "Biology",
  "topic": "Characteristics of Life",
  "chapter": "Chapter 1: Introduction to Biology",
  "difficulty": "medium",
  "question": "Which of the following are characteristics of living organisms?",
  "options": [
    "Growth and development",
    "Response to environment",
    "Reproduction",
    "Static composition",
    "Metabolism"
  ],
  "correctAnswers": [0, 1, 2, 4],
  "explanation": "Living organisms grow, respond to their environment, reproduce, and have metabolism. They do not have static composition.",
  "image": "https://example.com/living-characteristics.jpg",
  "imageAlt": "Characteristics of living organisms"
}
```

#### Additional Properties for Select-All:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `question` | string | Yes | The question text |
| `options` | string[] | Yes | Array of answer choices |
| `correctAnswers` | number[] | Yes | Array of indices for correct answers |
| `explanation` | string | No | Detailed explanation for the answer |

### 3. Flashcards

Two-sided cards for memorization and recall practice.

```json
{
  "id": "bio-ch1-003",
  "type": "flashcard",
  "subject": "Biology",
  "topic": "Terminology",
  "chapter": "Chapter 1: Introduction to Biology",
  "difficulty": "easy",
  "front": "What does 'homeostasis' mean?",
  "back": "The maintenance of stable internal conditions in an organism despite changes in the external environment.",
  "hint": "Think about balance and stability",
  "frontImage": "https://example.com/homeostasis-front.jpg",
  "frontImageAlt": "Homeostasis concept illustration",
  "backImage": "https://example.com/homeostasis-back.jpg",
  "backImageAlt": "Detailed homeostasis diagram",
  "tags": ["terminology", "physiology"]
}
```

#### Additional Properties for Flashcards:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `front` | string | Yes | Text for the front of the card |
| `back` | string | Yes | Text for the back of the card |
| `hint` | string | No | Hint text to help with recall |
| `frontImage` | string | No | Image for the front of the card |
| `frontImageAlt` | string | No | Alt text for front image |
| `backImage` | string | No | Image for the back of the card |
| `backImageAlt` | string | No | Alt text for back image |

### 4. Fact Cards

Single-sided informational cards that present facts or key information.

```json
{
  "id": "bio-ch1-004",
  "type": "fact-card",
  "subject": "Biology",
  "topic": "Cell Biology",
  "chapter": "Chapter 1: Introduction to Biology",
  "difficulty": "easy",
  "title": "Did You Know?",
  "fact": "The human body contains approximately 37.2 trillion cells, each working together to maintain life processes.",
  "source": "National Human Genome Research Institute",
  "factImage": "https://example.com/human-cells.jpg",
  "factImageAlt": "Microscopic view of human cells",
  "tags": ["facts", "human-biology"]
}
```

#### Additional Properties for Fact Cards:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fact` | string | Yes | The factual information to present |
| `title` | string | No | Optional title for the fact |
| `source` | string | No | Source attribution for the fact |
| `factImage` | string | No | Image to accompany the fact |
| `factImageAlt` | string | No | Alt text for fact image |

### 5. Matching Questions

Questions where users match terms with their corresponding definitions.

```json
{
  "id": "bio-ch1-005",
  "type": "matching",
  "subject": "Biology",
  "topic": "Cell Organelles",
  "chapter": "Chapter 1: Introduction to Biology",
  "difficulty": "medium",
  "instruction": "Match each organelle with its primary function:",
  "pairs": [
    {
      "term": "Mitochondria",
      "definition": "Produces ATP energy for cellular processes"
    },
    {
      "term": "Nucleus",
      "definition": "Controls cell activities and contains DNA"
    },
    {
      "term": "Ribosomes",
      "definition": "Synthesizes proteins from amino acids"
    },
    {
      "term": "Chloroplasts",
      "definition": "Conducts photosynthesis in plant cells"
    }
  ],
  "explanation": "Each organelle has a specialized function that contributes to overall cell survival and operation.",
  "tags": ["organelles", "cell-function"]
}
```

#### Additional Properties for Matching Questions:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `instruction` | string | Yes | Instructions for the matching exercise |
| `pairs` | MatchingPair[] | Yes | Array of term-definition pairs |
| `explanation` | string | No | Detailed explanation for the matches |

#### MatchingPair Structure:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `term` | string | Yes | The term to be matched |
| `definition` | string | Yes | The definition for the term |

## Image Support

StudyQuest supports images in questions and flashcards:

- **Supported formats**: JPG, PNG, GIF, WebP, SVG
- **Image sources**: 
  - External URLs (must be publicly accessible)
  - Base64 encoded images (for embedded images)
- **Accessibility**: Always include `imageAlt` text for screen readers
- **Performance**: External URLs are preferred for large images

### Image Examples:

```json
// External URL
"image": "https://example.com/diagram.jpg",
"imageAlt": "Diagram showing cellular respiration process"

// Base64 encoded (truncated for brevity)
"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
"imageAlt": "Simple red pixel"
```

## Topic Organization

The `topic` field provides granular categorization within subjects:

### Examples by Subject:

**Biology Topics:**
- Cell Structure
- Photosynthesis
- Cellular Respiration
- DNA Replication
- Protein Synthesis
- Evolution
- Ecology

**Chemistry Topics:**
- Atomic Structure
- Chemical Bonding
- Stoichiometry
- Thermodynamics
- Kinetics
- Equilibrium
- Organic Chemistry

**Physics Topics:**
- Mechanics
- Thermodynamics
- Electromagnetism
- Optics
- Quantum Physics
- Relativity

## Validation Rules

StudyQuest validates uploaded JSON files according to these rules:

### Required Fields Validation:
- All questions must have: `id`, `type`, `subject`, `topic`, `difficulty`
- Multiple choice: `question`, `options`, `correctAnswer`
- Select-all: `question`, `options`, `correctAnswers`
- Flashcards: `front`, `back`
- Fact cards: `fact`
- Matching: `instruction`, `pairs` (with `term` and `definition` for each pair)

### Data Type Validation:
- `correctAnswer` must be a number (index)
- `correctAnswers` must be an array of numbers
- `difficulty` must be one of: "easy", "medium", "hard"
- `type` must be one of: "multiple-choice", "select-all", "flashcard", "fact-card", "matching"
- `pairs` must be an array of objects with `term` and `definition` properties

### Logical Validation:
- `correctAnswer` index must be valid for the options array
- All indices in `correctAnswers` must be valid for the options array
- Images must be valid URLs or base64 data URIs
- Matching questions must have at least 2 pairs

## Complete Example

```json
{
  "name": "Biology Chapter 1 - Introduction",
  "description": "Fundamental concepts in biology including cell theory, characteristics of life, and basic terminology",
  "subject": "Biology",
  "questions": [
    {
      "id": "bio-ch1-001",
      "type": "multiple-choice",
      "subject": "Biology",
      "topic": "Cell Theory",
      "chapter": "Chapter 1",
      "difficulty": "easy",
      "question": "Who is credited with first observing cells?",
      "options": [
        "Charles Darwin",
        "Robert Hooke",
        "Gregor Mendel",
        "Louis Pasteur"
      ],
      "correctAnswer": 1,
      "explanation": "Robert Hooke first observed and named cells in 1665 while examining cork under a microscope.",
      "tags": ["history", "cell-theory"]
    },
    {
      "id": "bio-ch1-002",
      "type": "select-all",
      "subject": "Biology",
      "topic": "Characteristics of Life",
      "chapter": "Chapter 1",
      "difficulty": "medium",
      "question": "Which are characteristics of all living things?",
      "options": [
        "Made of cells",
        "Can reproduce",
        "Use energy",
        "Are microscopic",
        "Respond to stimuli"
      ],
      "correctAnswers": [0, 1, 2, 4],
      "explanation": "All living things are made of cells, can reproduce, use energy, and respond to stimuli. Not all living things are microscopic."
    },
    {
      "id": "bio-ch1-003",
      "type": "flashcard",
      "subject": "Biology",
      "topic": "Scientific Method",
      "chapter": "Chapter 1",
      "difficulty": "easy",
      "front": "What is a hypothesis?",
      "back": "A testable explanation for an observation or scientific problem.",
      "hint": "It's an educated guess that can be tested",
      "tags": ["scientific-method", "terminology"]
    },
    {
      "id": "bio-ch1-004",
      "type": "fact-card",
      "subject": "Biology",
      "topic": "Cell Biology",
      "chapter": "Chapter 1",
      "difficulty": "easy",
      "title": "Amazing Cell Fact",
      "fact": "A single human cell contains about 6 billion base pairs of DNA, which if stretched out would be about 2 meters long!",
      "source": "National Human Genome Research Institute",
      "tags": ["facts", "dna", "cell-biology"]
    },
    {
      "id": "bio-ch1-005",
      "type": "matching",
      "subject": "Biology",
      "topic": "Cell Organelles",
      "chapter": "Chapter 1",
      "difficulty": "medium",
      "instruction": "Match each organelle with its primary function:",
      "pairs": [
        {
          "term": "Mitochondria",
          "definition": "Produces ATP energy for cellular processes"
        },
        {
          "term": "Nucleus",
          "definition": "Controls cell activities and contains DNA"
        },
        {
          "term": "Ribosomes",
          "definition": "Synthesizes proteins from amino acids"
        }
      ],
      "explanation": "Each organelle has a specialized function essential for cell survival.",
      "tags": ["organelles", "cell-function"]
    }
  ]
}
```

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions for IDs and topics
2. **Clear Topics**: Make topics specific enough to be meaningful but broad enough to group related questions
3. **Balanced Difficulty**: Include questions of varying difficulty levels
4. **Quality Images**: Use high-quality, relevant images with descriptive alt text
5. **Comprehensive Explanations**: Provide detailed explanations for complex questions
6. **Logical Grouping**: Group related questions by topic and chapter
7. **Unique IDs**: Ensure all question IDs are unique across your question sets
8. **Meaningful Facts**: For fact cards, include interesting, educational, and memorable information
9. **Balanced Matching**: Create matching questions with 3-6 pairs for optimal difficulty
10. **Source Attribution**: Include sources for fact cards to build credibility

## Error Handling

Common validation errors and solutions:

- **Missing required fields**: Ensure all required properties are present
- **Invalid indices**: Check that answer indices match available options
- **Invalid difficulty**: Use only "easy", "medium", or "hard"
- **Invalid type**: Use only "multiple-choice", "select-all", "flashcard", "fact-card", or "matching"
- **Malformed JSON**: Validate JSON syntax before uploading
- **Broken image URLs**: Verify image URLs are accessible
- **Empty pairs array**: Matching questions must have at least 2 pairs
- **Missing pair properties**: Each pair must have both `term` and `definition`

This schema ensures your questions work seamlessly with StudyQuest's learning algorithms and user interface.