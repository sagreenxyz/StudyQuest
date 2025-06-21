## 📁 Project File Structure

StudyQuest now supports loading question files directly from your project structure in addition to uploading files. This is useful for:

- **Development**: Include sample questions with your project
- **Distribution**: Ship pre-built question sets
- **Version Control**: Track question files alongside your code

### Adding Project Files

1. Create a `public/questions/` directory in your project
2. Add JSON question files following the same format as uploaded files
3. Files will be automatically discovered and available in the "Project Files" tab

### Example Structure

```
public/
└── questions/
    ├── biology-chapter-1.json
    ├── chemistry-basics.json
    └── physics-mechanics.json
```

### Sample Files Included

The project includes two sample question files:

- `public/questions/sample-biology.json` - Basic biology concepts
- `public/questions/sample-chemistry.json` - Chemistry fundamentals

These demonstrate the question format and can be loaded immediately to test the application.

### File Loading Options

StudyQuest provides two ways to load questions:

1. **Upload Files**: Traditional file upload from your computer
2. **Project Files**: Load from the `public/questions/` directory

Both methods support:
- Multiple file selection
- Duplicate question ID detection
- Comprehensive validation
- Progress tracking
- File management (delete/re-upload)

---

# StudyQuest - Comprehensive Study Application

A modern, interactive study application built with React and TypeScript that helps you master your coursework through spaced repetition and adaptive learning techniques.

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
- **File Management**: Track uploaded files, delete specific question sets, and re-upload files

### User Experience
- **Beautiful, Modern UI**: Clean design with smooth animations and transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Image Support**: Add images to questions and flashcards for visual learning
- **Local Storage**: All data persists locally in your browser
- **Instant Feedback**: Immediate results with detailed explanations
- **Configurable Settings**: Customize spaced repetition timing and mastery criteria

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

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📚 Usage

### Getting Started
1. **Load Questions**: Either upload JSON files or load from project files
2. **Review Dashboard**: View your progress and statistics
3. **Practice All Questions**: Quiz yourself on all questions in random order
4. **Spaced Review**: Review questions that are due based on the spaced repetition algorithm
5. **Manage Files**: View, delete, or re-upload specific question files

### Quiz Modes
- **Practice All Questions**: Includes every question in your dataset, shuffled randomly
- **Spaced Review**: Only shows questions due for review based on the spaced repetition algorithm
- **Subject-Specific**: Practice questions from a specific subject area
- **Topic-Specific**: Focus on particular topics within subjects

### File Management
- **Upload Files**: Traditional file upload with drag-and-drop support
- **Project Files**: Load questions from the `public/questions/` directory
- **File Tracking**: See when files were uploaded and how many questions they contain
- **Delete Files**: Remove specific question files and their associated progress
- **Re-upload Files**: Replace existing files with updated versions
- **Duplicate Detection**: Automatically skip questions with duplicate IDs

### Creating Question Files

StudyQuest uses JSON files to import questions. Here's the structure:

#### Basic Question Set Structure
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

#### Multiple Choice Question
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

#### Select-All Question
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
  "explanation": "Living organisms grow, respond to their environment, reproduce, and have metabolism. They do not have static composition.",
  "image": "https://example.com/living-characteristics.jpg",
  "imageAlt": "Characteristics of living organisms"
}
```

#### True/False Question
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

#### Flashcard
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
  "backImageAlt": "Detailed homeostasis diagram",
  "tags": ["terminology", "physiology"]
}
```

#### Fact Card
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
  "factImageAlt": "DNA double helix structure",
  "tags": ["facts", "dna", "cell-biology"]
}
```

#### Matching Question
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
  "explanation": "Each organelle has a specialized function essential for cell survival.",
  "tags": ["organelles", "cell-function"]
}
```

### Required Fields

#### All Questions
- `id`: Unique identifier for the question
- `type`: Question type (`"multiple-choice"`, `"select-all"`, `"true-false"`, `"flashcard"`, `"fact-card"`, or `"matching"`)
- `subject`: Subject area (e.g., "Biology", "Chemistry", "Physics")
- `topic`: Specific topic within the subject
- `difficulty`: Difficulty level (`"easy"`, `"medium"`, or `"hard"`)

#### Multiple Choice Questions
- `question`: The question text
- `options`: Array of answer choices
- `correctAnswer`: Index of the correct answer (0-based)

#### Select-All Questions
- `question`: The question text
- `options`: Array of answer choices
- `correctAnswers`: Array of indices for correct answers

#### True/False Questions
- `question`: The question text
- `options`: Must be `["True", "False"]`
- `correctAnswer`: 0 for True, 1 for False

#### Flashcards
- `front`: Text for the front of the card
- `back`: Text for the back of the card

#### Fact Cards
- `fact`: The factual information to present

#### Matching Questions
- `instruction`: Instructions for the matching exercise
- `pairs`: Array of objects with `term` and `definition` properties

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
- **Total questions** loaded from all files
- **Questions studied** (attempted at least once)
- **Mastered questions** (answered correctly based on mastery threshold)
- **Questions due for review** based on spaced repetition
- **Subject-wise progress** with visual progress bars
- **Topic-wise progress** with detailed breakdowns
- **File-wise statistics** showing progress per uploaded file
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
│   ├── FileUpload.tsx   # File upload and project file loading
│   ├── FileManagement.tsx # File management interface
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
│   └── Question.ts      # Question, progress, and file types
├── utils/               # Utility functions
│   └── spacedRepetition.ts # SM-2 algorithm implementation
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles

public/
└── questions/           # Project question files
    ├── sample-biology.json
    └── sample-chemistry.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure your JSON files follow the correct format
3. Verify that images are accessible via their URLs
4. Use "Clear Data" if you encounter persistent data issues
5. Check the File Management section to see which files are loaded

## 🔮 Future Enhancements

- Export/import progress data
- Study streak tracking
- Advanced analytics and insights
- Collaborative study sets
- Audio support for questions
- Offline mode with service workers
- Integration with popular study platforms
- Question difficulty adjustment based on performance
- Bulk question editing interface
- Question search and filtering
- Study session scheduling
- Performance comparison over time

---

**Happy Studying! 📚✨**