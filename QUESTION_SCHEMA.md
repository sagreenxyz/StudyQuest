# StudyQuest Question Schema Documentation

This document provides a comprehensive guide for creating question bank files in JSON format for StudyQuest, a modern study application that supports multiple question types and spaced repetition learning.

## Table of Contents

1. [Overview](#overview)
2. [Question Set Structure](#question-set-structure)
3. [Base Question Properties](#base-question-properties)
4. [Question Types](#question-types)
   - [Multiple Choice Questions](#1-multiple-choice-questions)
   - [Select-All Questions](#2-select-all-questions)
   - [Flashcards](#3-flashcards)
   - [Fact Cards](#4-fact-cards)
   - [Matching Questions](#5-matching-questions)
5. [Image Support](#image-support)
6. [Topic Organization](#topic-organization)
7. [Validation Rules](#validation-rules)
8. [Complete Example](#complete-example)
9. [Best Practices](#best-practices)
10. [Error Handling](#error-handling)

## Overview

StudyQuest uses JSON files to import question sets. Each file can contain multiple questions of different types, all organized under a single question set. The application supports five distinct question types, each with specific properties and validation rules.

## Question Set Structure

Every JSON file must follow this top-level structure:

```json
{
  "name": "Question Set Name",
  "description": "Optional description of the question set",
  "subject": "Subject Area",
  "questions": [
    // Array of questions (detailed below)
  ]
}
```

### Top-Level Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Display name for the question set |
| `description` | string | No | Optional description of the content |
| `subject` | string | Yes | Subject area (e.g., "Biology", "Chemistry") |
| `questions` | Question[] | Yes | Array of question objects |

## Base Question Properties

All questions share these common properties regardless of type:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the question |
| `type` | string | Yes | Question type (see supported types below) |
| `subject` | string | Yes | Subject area |
| `topic` | string | Yes | Specific topic within the subject |
| `chapter` | string | No | Chapter or section name |
| `difficulty` | string | Yes | Difficulty level: `"easy"`, `"medium"`, or `"hard"` |
| `tags` | string[] | No | Array of tags for categorization |
| `image` | string | No | URL or base64 encoded image |
| `imageAlt` | string | No | Alt text for accessibility |

### Supported Question Types

- `"multiple-choice"` - Single-answer questions with multiple options
- `"select-all"` - Multi-select questions where multiple answers may be correct
- `"flashcard"` - Two-sided cards for memorization and recall practice
- `"fact-card"` - Single-sided informational cards presenting facts
- `"matching"` - Questions where users match terms with definitions

## Question Types

### 1. Multiple Choice Questions

Single-answer questions with multiple options where only one answer is correct.

#### Structure

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

#### Additional Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `question` | string | Yes | The question text |
| `options` | string[] | Yes | Array of answer choices (2-6 recommended) |
| `correctAnswer` | number | Yes | Index of the correct answer (0-based) |
| `explanation` | string | No | Detailed explanation for the answer |

#### Validation Rules

- `options` array must contain at least 2 items
- `correctAnswer` must be a valid index within the `options` array
- `correctAnswer` must be a number, not a string

### 2. Select-All Questions

Multi-select questions where multiple answers may be correct. Users must select all correct options to get the question right.

#### Structure

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

#### Additional Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `question` | string | Yes | The question text |
| `options` | string[] | Yes | Array of answer choices |
| `correctAnswers` | number[] | Yes | Array of indices for correct answers |
| `explanation` | string | No | Detailed explanation for the answer |

#### Validation Rules

- `options` array must contain at least 2 items
- `correctAnswers` must be an array of numbers
- All indices in `correctAnswers` must be valid within the `options` array
- `correctAnswers` should contain at least 1 item but not all items (otherwise use multiple-choice)

### 3. Flashcards

Two-sided cards for memorization and recall practice. Users can flip between front and back, then rate their performance.

#### Structure

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

#### Additional Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `front` | string | Yes | Text for the front of the card |
| `back` | string | Yes | Text for the back of the card |
| `hint` | string | No | Hint text to help with recall |
| `frontImage` | string | No | Image for the front of the card |
| `frontImageAlt` | string | No | Alt text for front image |
| `backImage` | string | No | Image for the back of the card |
| `backImageAlt` | string | No | Alt text for back image |

#### Usage Notes

- Users see the front first and can flip to reveal the back
- After viewing the back, users rate their performance (Easy/Hard)
- "Easy" responses improve spaced repetition scheduling
- "Hard" responses reset the spaced repetition interval

### 4. Fact Cards

Single-sided informational cards that present interesting facts or key information. These are always marked as "correct" since they're informational.

#### Structure

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

#### Additional Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fact` | string | Yes | The factual information to present |
| `title` | string | No | Optional title for the fact |
| `source` | string | No | Source attribution for the fact |
| `factImage` | string | No | Image to accompany the fact |
| `factImageAlt` | string | No | Alt text for fact image |

#### Usage Notes

- Fact cards are automatically marked as correct in progress tracking
- They advance automatically after a brief display period
- Perfect for presenting interesting trivia or key concepts
- Source attribution helps build credibility

### 5. Matching Questions

Questions where users match terms with their corresponding definitions using drag-and-drop interaction.

#### Structure

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

#### Additional Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `instruction` | string | Yes | Instructions for the matching exercise |
| `pairs` | MatchingPair[] | Yes | Array of term-definition pairs |
| `explanation` | string | No | Detailed explanation for the matches |

#### MatchingPair Structure

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `term` | string | Yes | The term to be matched |
| `definition` | string | Yes | The definition for the term |

#### Validation Rules

- `pairs` array must contain at least 2 items
- Each pair must have both `term` and `definition` properties
- Recommended to use 3-6 pairs for optimal difficulty

#### Usage Notes

- Terms and definitions are shuffled separately for each attempt
- Users drag definitions from the right column to terms in the left column
- All pairs must be matched before submission
- Correct matches are determined by the original pairing in the JSON

## Image Support

StudyQuest supports images in questions and flashcards to enhance visual learning.

### Supported Formats

- **File types**: JPG, PNG, GIF, WebP, SVG
- **Sources**: 
  - External URLs (must be publicly accessible)
  - Base64 encoded images (for embedded images)

### Image Properties

- Always include `imageAlt` text for screen readers and accessibility
- External URLs are preferred for large images to reduce file size
- Base64 encoding is useful for small icons or when external hosting isn't available

### Examples

```json
// External URL
"image": "https://example.com/diagram.jpg",
"imageAlt": "Diagram showing cellular respiration process"

// Base64 encoded (truncated for brevity)
"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
"imageAlt": "Simple red pixel"
```

### Best Practices

- Use descriptive alt text that explains the image content
- Optimize images for web (reasonable file sizes)
- Test external URLs to ensure they remain accessible
- Consider using a CDN for better performance

## Topic Organization

The `topic` field provides granular categorization within subjects, enabling focused study sessions.

### Examples by Subject

#### Biology Topics
- Cell Structure
- Photosynthesis
- Cellular Respiration
- DNA Replication
- Protein Synthesis
- Evolution
- Ecology
- Genetics
- Anatomy
- Physiology

#### Chemistry Topics
- Atomic Structure
- Chemical Bonding
- Stoichiometry
- Thermodynamics
- Kinetics
- Equilibrium
- Organic Chemistry
- Inorganic Chemistry
- Analytical Chemistry
- Physical Chemistry

#### Physics Topics
- Mechanics
- Thermodynamics
- Electromagnetism
- Optics
- Quantum Physics
- Relativity
- Waves
- Nuclear Physics
- Particle Physics
- Astrophysics

### Topic Guidelines

- Make topics specific enough to be meaningful
- Keep topics broad enough to group related questions
- Use consistent naming conventions across question sets
- Consider the learning progression when organizing topics

## Validation Rules

StudyQuest validates uploaded JSON files according to these rules:

### Required Fields Validation

**All Questions:**
- `id`, `type`, `subject`, `topic`, `difficulty` are mandatory

**Multiple Choice:**
- `question`, `options`, `correctAnswer` are required
- `correctAnswer` must be a valid index

**Select-All:**
- `question`, `options`, `correctAnswers` are required
- `correctAnswers` must be an array of valid indices

**Flashcards:**
- `front`, `back` are required

**Fact Cards:**
- `fact` is required

**Matching:**
- `instruction`, `pairs` are required
- Each pair must have `term` and `definition`

### Data Type Validation

- `correctAnswer` must be a number (index)
- `correctAnswers` must be an array of numbers
- `difficulty` must be one of: "easy", "medium", "hard"
- `type` must be one of the five supported types
- `pairs` must be an array of objects with required properties

### Logical Validation

- Answer indices must be valid for their respective options arrays
- Images must be valid URLs or base64 data URIs
- Matching questions must have at least 2 pairs
- Question IDs should be unique within a question set

## Complete Example

Here's a comprehensive example showing all question types in a single question set:

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

### Content Creation

1. **Consistent Naming**: Use consistent naming conventions for IDs and topics
2. **Clear Topics**: Make topics specific enough to be meaningful but broad enough to group related questions
3. **Balanced Difficulty**: Include questions of varying difficulty levels within each topic
4. **Quality Images**: Use high-quality, relevant images with descriptive alt text
5. **Comprehensive Explanations**: Provide detailed explanations for complex questions

### Organization

6. **Logical Grouping**: Group related questions by topic and chapter
7. **Unique IDs**: Ensure all question IDs are unique across your question sets
8. **Meaningful Facts**: For fact cards, include interesting, educational, and memorable information
9. **Balanced Matching**: Create matching questions with 3-6 pairs for optimal difficulty
10. **Source Attribution**: Include sources for fact cards to build credibility

### Technical

11. **Valid JSON**: Always validate JSON syntax before uploading
12. **Image Accessibility**: Test image URLs and provide meaningful alt text
13. **Reasonable File Sizes**: Keep JSON files manageable (under 5MB recommended)
14. **Backup Copies**: Maintain backup copies of your question banks
15. **Version Control**: Consider using version control for collaborative question creation

## Error Handling

Common validation errors and their solutions:

### Missing Required Fields
**Error**: "Question X is missing required fields"
**Solution**: Ensure all required properties are present for the question type

### Invalid Answer Indices
**Error**: "correctAnswer index is invalid"
**Solution**: Check that answer indices match available options (remember: 0-based indexing)

### Invalid Difficulty Level
**Error**: "Invalid difficulty level"
**Solution**: Use only "easy", "medium", or "hard"

### Invalid Question Type
**Error**: "Invalid question type"
**Solution**: Use only supported types: "multiple-choice", "select-all", "flashcard", "fact-card", "matching"

### Malformed JSON
**Error**: "JSON parsing error"
**Solution**: Validate JSON syntax using a JSON validator tool

### Broken Image URLs
**Error**: "Failed to load image"
**Solution**: Verify image URLs are accessible and use proper formats

### Empty Pairs Array
**Error**: "Matching question must have pairs"
**Solution**: Include at least 2 pairs in matching questions

### Missing Pair Properties
**Error**: "Pair missing term or definition"
**Solution**: Ensure each pair has both `term` and `definition` properties

## Conclusion

This schema ensures your questions work seamlessly with StudyQuest's learning algorithms and user interface. The application uses spaced repetition to optimize learning retention and provides detailed progress tracking across all question types.

For additional support or questions about the schema, refer to the application's built-in validation messages, which provide specific guidance for any formatting issues encountered during upload.

---

**Happy Question Creating! 📚✨**