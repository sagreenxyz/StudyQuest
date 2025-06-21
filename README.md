# StudyQuest - Project Files Study Application

A modern, interactive study application built with React and TypeScript that helps you master your coursework through spaced repetition and adaptive learning techniques. This version loads questions exclusively from project files in the `public/questions/` directory.

## 🌟 Features

### Question Types
- **Multiple Choice Questions**: Traditional single-answer questions with explanations
- **Select-All Questions**: Multi-select questions for comprehensive understanding
- **True/False Questions**: Binary choice questions with detailed explanations
- **Flashcards**: Interactive cards with front/back content and optional hints
- **Fact Cards**: Informational cards presenting interesting facts and key information
- **Matching Questions**: Drag-and-drop exercises matching terms with definitions

### Learning Features
- **Spaced Repetition Algorithm**: Based on SM-2 algorithm for optimal retention
- **Practice All Questions**: Force quiz sessions with all questions regardless of spaced repetition
- **Adaptive Review System**: Questions appear for review based on your performance
- **Progress Tracking**: Monitor your mastery across subjects and chapters
- **Performance Analytics**: Detailed statistics and progress visualization
- **Configurable Settings**: Customize spaced repetition timing and mastery criteria

### User Experience
- **Beautiful, Modern UI**: Clean design with smooth animations and transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Image Support**: Add images to questions and flashcards for visual learning
- **Local Storage**: All progress data persists locally in your browser
- **Instant Feedback**: Immediate results with detailed explanations
- **Auto-Loading**: Questions are automatically loaded from project files on startup

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studyquest
```

2. Install dependencies:
```bash
npm install
```

3. Add your question files to the `public/questions/` directory (see [Question File Format](#question-file-format) below)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project File Structure

StudyQuest loads question files directly from your project structure:

### Adding Question Files

1. Create JSON question files following the format described below
2. Place them in the `public/questions/` directory
3. Files can be organized in subdirectories for better organization
4. Refresh the page to load new files

### Example Structure

```
public/
└── questions/
    ├── biology/
    │   ├── chapter-1.json
    │   └── chapter-2.json
    ├── chemistry/
    │   ├── basics.json
    │   └── organic.json
    └── physics/
        └── mechanics.json
```

### Sample Files Included

The project includes two sample question files:

- `public/questions/tests/sample-biology.json` - Basic biology concepts
- `public/questions/tests/sample-chemistry.json` - Chemistry fundamentals

These demonstrate the question format and are loaded automatically.

## 📚 Question File Format

StudyQuest uses JSON files to define questions. Here's the structure:

### Basic Question Set Structure
```json
{
  "name": "Chapter 1 - Introduction to Biology",
  "description": "Basic concepts and terminology",
  "subject": "Biology",
  "questions": [
    // Questions go here
  ]
}
```

### Multiple Choice Question
```json
{
  "id": "bio-ch1-001",
  "type": "multiple-choice",
  "subject": "Biology",
  "topic": "Cell Theory",
  "chapter": "Chapter 1",
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

### Select-All Question
```json
{
  "id": "bio-ch1-002",
  "type": "select-all",
  "subject": "Biology",
  "topic": "Characteristics of Life",
  "chapter": "Chapter 1",
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
  "explanation": "Living organisms grow, respond to their environment, reproduce, and have metabolism. They do not have static composition."
}
```

### True/False Question
```json
{
  "id": "bio-ch1-003",
  "type": "true-false",
  "subject": "Biology",
  "topic": "Cell Theory",
  "chapter": "Chapter 1",
  "difficulty": "easy",
  "question": "All living things are made of cells.",
  "options": ["True", "False"],
  "correctAnswer": 0,
  "explanation": "This is one of the fundamental principles of cell theory."
}
```

### Flashcard
```json
{
  "id": "bio-ch1-004",
  "type": "flashcard",
  "subject": "Biology",
  "topic": "Scientific Method",
  "chapter": "Chapter 1",
  "difficulty": "easy",
  "front": "What does 'homeostasis' mean?",
  "back": "The maintenance of stable internal conditions in an organism despite changes in the external environment.",
  "hint": "Think about balance and stability",
  "frontImage": "https://example.com/homeostasis-front.jpg",
  "frontImageAlt": "Homeostasis concept illustration",
  "backImage": "https://example.com/homeostasis-back.jpg",
  "backImageAlt": "Detailed homeostasis diagram"
}
```

### Fact Card
```json
{
  "id": "bio-ch1-005",
  "type": "fact-card",
  "subject": "Biology",
  "topic": "Cell Biology",
  "chapter": "Chapter 1",
  "difficulty": "easy",
  "title": "Amazing Cell Fact",
  "fact": "A single human cell contains about 6 billion base pairs of DNA, which if stretched out would be about 2 meters long!",
  "source": "National Human Genome Research Institute",
  "factImage": "https://example.com/dna-structure.jpg",
  "factImageAlt": "DNA double helix structure"
}
```

### Matching Question
```json
{
  "id": "bio-ch1-006",
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
  "explanation": "Each organelle has a specialized function essential for cell survival."
}
```

### Required Fields

#### All Questions
- `id`: Unique identifier for the question
- `type`: Question type (`"multiple-choice"`, `"select-all"`, `"true-false"`, `"flashcard"`, `"fact-card"`, or `"matching"`)
- `subject`: Subject area (e.g., "Biology", "Chemistry", "Physics")
- `topic`: Specific topic within the subject
- `difficulty`: Difficulty level (`"easy"`, `"medium"`, or `"hard"`)

#### Type-Specific Required Fields
- **Multiple Choice**: `question`, `options`, `correctAnswer`
- **Select-All**: `question`, `options`, `correctAnswers`
- **True/False**: `question`, `options` (must be `["True", "False"]`), `correctAnswer`
- **Flashcards**: `front`, `back`
- **Fact Cards**: `fact`
- **Matching**: `instruction`, `pairs` (with `term` and `definition` for each pair)

### Optional Fields
- `chapter`: Chapter or section name
- `explanation`: Detailed explanation for the answer
- `image`: URL for question image
- `imageAlt`: Alt text for accessibility
- `frontImage`/`backImage`: Images for flashcard sides
- `frontImageAlt`/`backImageAlt`: Alt text for flashcard images
- `hint`: Hint text for flashcards
- `tags`: Array of tags for categorization
- `title`: Title for fact cards
- `source`: Source attribution for fact cards
- `factImage`: Image for fact cards
- `factImageAlt`: Alt text for fact card images

## 🧠 Learning Algorithms

### Spaced Repetition (SM-2 Algorithm)
StudyQuest uses a configurable SM-2 (SuperMemo 2) algorithm for optimal retention:

- **First correct answer**: Review in 24 hours (configurable)
- **Second correct answer**: Review in 6 days (configurable)
- **Subsequent correct answers**: Interval increases based on ease factor
- **Incorrect answers**: Reset progress and review in 1 hour (configurable)
- **Ease factor**: Adjusts based on performance (increases with correct answers, decreases with incorrect ones)
- **Mastery threshold**: Questions are considered mastered after 3 consecutive correct answers (configurable)

### Customizable Settings
- **Review Timing**: Adjust when questions appear for first, second, and incorrect reviews
- **Mastery Criteria**: Set how many consecutive correct answers constitute mastery
- **Ease Factors**: Fine-tune how question difficulty adapts to your performance
- **Presets**: Choose from Intensive, Balanced, or Thorough learning schedules

### Practice All Questions Mode
- **Comprehensive Coverage**: Includes every question in your dataset
- **Random Order**: Questions are shuffled to prevent pattern memorization
- **No Limits**: Unlike spaced repetition, this mode doesn't limit based on review schedules
- **Perfect for**: Exam preparation, comprehensive review, or when you want to practice everything

## 📊 Progress Tracking

The application tracks:
- **Total questions** loaded from project files
- **Questions studied** (attempted at least once)
- **Mastered questions** (answered correctly based on mastery threshold)
- **Questions due for review** based on spaced repetition
- **Subject-wise progress** with visual progress bars
- **Topic-wise progress** with detailed breakdowns
- **Recent activity** showing your latest study sessions

## 🎨 Design Philosophy

StudyQuest follows modern design principles:
- **Clean, minimalist interface** that focuses on content
- **Consistent color system** with semantic meaning
- **Responsive design** that works on all devices
- **Accessibility first** with proper contrast ratios and alt text
- **Smooth animations** that enhance user experience
- **Progressive disclosure** to manage complexity

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: Browser localStorage with automatic date parsing
- **Linting**: ESLint with TypeScript support

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with statistics
│   ├── ProjectFileLoader.tsx # Project file discovery and loading
│   ├── QuestionCard.tsx # Individual question display
│   ├── QuizMode.tsx     # Quiz interface and logic
│   ├── QuizResults.tsx  # Results display and analysis
│   ├── QuizConfiguration.tsx # Quiz setup and filtering
│   ├── SpacedRepetitionConfig.tsx # Spaced review configuration
│   └── SpacedRepetitionSettings.tsx # Settings for spaced repetition
├── hooks/               # Custom React hooks
│   └── useLocalStorage.ts # localStorage with date parsing and quota handling
├── types/               # TypeScript type definitions
│   └── Question.ts      # Question, progress, and settings types
├── utils/               # Utility functions
│   └── spacedRepetition.ts # SM-2 algorithm implementation
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles

public/
└── questions/           # Project question files
    └── tests/
        ├── sample-biology.json
        └── sample-chemistry.json
```

## 🔧 Configuration

### Vite Configuration

The application is configured to work with GitHub Pages deployment:

```javascript
// vite.config.ts
export default defineConfig({
  base: '/StudyQuest/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### File Loading

Questions are loaded using Vite's `import.meta.glob` feature to discover all JSON files in the `public/questions/` directory and its subdirectories.

## 🚀 Deployment

### GitHub Pages

The application is configured for GitHub Pages deployment:

1. Build the project: `npm run build`
2. Deploy the `dist` directory to GitHub Pages
3. The GitHub Actions workflow in `.github/workflows/deploy.yml` handles automatic deployment

### Other Platforms

For other deployment platforms, you may need to adjust the `base` path in `vite.config.ts`:

```javascript
// For root domain deployment
base: '/',

// For subdirectory deployment
base: '/your-subdirectory/',
```

## 📝 Best Practices

### Question Creation
1. **Consistent Naming**: Use consistent naming conventions for IDs and topics
2. **Clear Topics**: Make topics specific enough to be meaningful but broad enough to group related questions
3. **Balanced Difficulty**: Include questions of varying difficulty levels
4. **Quality Images**: Use high-quality, relevant images with descriptive alt text
5. **Comprehensive Explanations**: Provide detailed explanations for complex questions

### File Organization
6. **Logical Grouping**: Group related questions by subject and topic in separate files
7. **Unique IDs**: Ensure all question IDs are unique across your question sets
8. **Meaningful Facts**: For fact cards, include interesting, educational, and memorable information
9. **Balanced Matching**: Create matching questions with 3-6 pairs for optimal difficulty
10. **Source Attribution**: Include sources for fact cards to build credibility

### Technical
11. **Valid JSON**: Always validate JSON syntax before adding files
12. **Image Accessibility**: Use external URLs for images and provide meaningful alt text
13. **Reasonable File Sizes**: Keep JSON files manageable (under 1MB recommended)
14. **Backup Copies**: Maintain backup copies of your question files
15. **Version Control**: Use Git to track changes to your question files

## 🆘 Troubleshooting

### Common Issues

1. **Questions not loading**: Check that JSON files are in `public/questions/` and have valid syntax
2. **Images not displaying**: Verify image URLs are accessible and use proper formats
3. **Progress not saving**: Check browser localStorage quota and clear data if needed
4. **Validation errors**: Ensure all required fields are present for each question type

### File Validation

The application validates:
- Required fields for each question type
- Correct answer indices for multiple choice and select-all questions
- True/False questions have exactly `["True", "False"]` options
- Matching questions have at least 2 pairs with term and definition
- JSON syntax and structure

## 🔮 Future Enhancements

- Export/import progress data
- Study streak tracking
- Advanced analytics and insights
- Audio support for questions
- Offline mode with service workers
- Question difficulty adjustment based on performance
- Study session scheduling
- Performance comparison over time
- Collaborative question creation tools

---

**Happy Studying! 📚✨**