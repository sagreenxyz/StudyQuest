# StudyQuest - Comprehensive Study Application

A modern, interactive study application built with React and TypeScript that helps you master your coursework through spaced repetition and adaptive learning techniques.

## 🌟 Features

### Question Types
- **Multiple Choice Questions**: Traditional single-answer questions with explanations
- **Select-All Questions**: Multi-select questions for comprehensive understanding
- **Flashcards**: Interactive cards with front/back content and optional hints

### Learning Features
- **Spaced Repetition Algorithm**: Based on SM-2 algorithm for optimal retention
- **Practice All Questions**: Force quiz sessions with all questions regardless of spaced repetition
- **Adaptive Review System**: Questions appear for review based on your performance
- **Progress Tracking**: Monitor your mastery across subjects and chapters
- **Performance Analytics**: Detailed statistics and progress visualization
- **Data Management**: Clear all data to start fresh with new study materials

### User Experience
- **Beautiful, Modern UI**: Clean design with smooth animations and transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Image Support**: Add images to questions and flashcards for visual learning
- **Local Storage**: All data persists locally in your browser
- **Instant Feedback**: Immediate results with detailed explanations

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
1. **Upload Questions**: Start by uploading a JSON file containing your questions
2. **Review Dashboard**: View your progress and statistics
3. **Practice All Questions**: Quiz yourself on all questions in random order
4. **Spaced Review**: Review questions that are due based on the spaced repetition algorithm
5. **Clear Data**: Remove all questions and progress to start fresh

### Quiz Modes
- **Practice All Questions**: Includes every question in your dataset, shuffled randomly
- **Spaced Review**: Only shows questions due for review based on the spaced repetition algorithm
- **Subject-Specific**: Practice questions from a specific subject area

### Data Management
- **Local Storage**: All data is stored in your browser's local storage
- **Clear Data**: Use the "Clear Data" button to remove all questions and progress
- **Fresh Start**: Perfect for switching between different courses or study periods

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

#### Flashcard
```json
{
  "id": "bio-ch1-003",
  "type": "flashcard",
  "subject": "Biology",
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

### Required Fields

#### All Questions
- `id`: Unique identifier for the question
- `type`: Question type (`"multiple-choice"`, `"select-all"`, or `"flashcard"`)
- `subject`: Subject area (e.g., "Biology", "Chemistry", "Physics")
- `difficulty`: Difficulty level (`"easy"`, `"medium"`, or `"hard"`)

#### Multiple Choice Questions
- `question`: The question text
- `options`: Array of answer choices
- `correctAnswer`: Index of the correct answer (0-based)

#### Select-All Questions
- `question`: The question text
- `options`: Array of answer choices
- `correctAnswers`: Array of indices for correct answers

#### Flashcards
- `front`: Text for the front of the card
- `back`: Text for the back of the card

### Optional Fields
- `chapter`: Chapter or section name
- `explanation`: Detailed explanation for the answer
- `image`: URL for question image
- `imageAlt`: Alt text for accessibility
- `frontImage`/`backImage`: Images for flashcard sides
- `frontImageAlt`/`backImageAlt`: Alt text for flashcard images
- `hint`: Hint text for flashcards
- `tags`: Array of tags for categorization

## 🧠 Learning Algorithms

### Spaced Repetition (SM-2 Algorithm)
StudyQuest uses a modified SM-2 (SuperMemo 2) algorithm for optimal retention:

- **First correct answer**: Review in 1 day
- **Second correct answer**: Review in 6 days
- **Subsequent correct answers**: Interval increases based on ease factor
- **Incorrect answers**: Reset progress and review in 1 hour
- **Ease factor**: Adjusts based on performance (increases with correct answers, decreases with incorrect ones)

### Practice All Questions Mode
- **Comprehensive Coverage**: Includes every question in your dataset
- **Random Order**: Questions are shuffled to prevent pattern memorization
- **No Limits**: Unlike spaced repetition, this mode doesn't limit based on review schedules
- **Perfect for**: Exam preparation, comprehensive review, or when you want to practice everything

## 📊 Progress Tracking

The application tracks:
- **Total questions** loaded
- **Questions studied** (attempted at least once)
- **Mastered questions** (answered correctly 3+ times)
- **Questions due for review** based on spaced repetition
- **Subject-wise progress** with visual progress bars
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
│   ├── FileUpload.tsx   # JSON file upload component
│   ├── QuestionCard.tsx # Individual question display
│   ├── QuizMode.tsx     # Quiz interface and logic
│   └── QuizResults.tsx  # Results display and analysis
├── hooks/               # Custom React hooks
│   └── useLocalStorage.ts # localStorage with date parsing
├── types/               # TypeScript type definitions
│   └── Question.ts      # Question and progress types
├── utils/               # Utility functions
│   └── spacedRepetition.ts # SM-2 algorithm implementation
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
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

## 🔮 Future Enhancements

- Export/import progress data
- Study streak tracking
- Advanced analytics and insights
- Collaborative study sets
- Audio support for questions
- Offline mode with service workers
- Integration with popular study platforms
- Question difficulty adjustment based on performance

---

**Happy Studying! 📚✨**