import { Question, QuestionSet } from '../types/Question';

/**
 * Lightweight metadata for a question - stored in localStorage
 */
export interface QuestionMetadata {
  id: string;
  type: string;
  subject: string;
  topic: string;
  chapter?: string;
  difficulty: string;
  sourceFile: string;
}

/**
 * Index of all available questions - stored in localStorage
 */
export interface QuestionIndex {
  questions: QuestionMetadata[];
  lastUpdated: Date;
}

/**
 * Service for loading questions on-demand
 */
export class QuestionService {
  private static BASE_PATH = '/StudyQuest/questions/';
  private cache: Map<string, QuestionSet> = new Map();

  /**
   * Build an index of all available questions by scanning files
   */
  async buildQuestionIndex(): Promise<QuestionIndex> {
    const questionModules = import.meta.glob('/public/questions/**/*.json');
    const allMetadata: QuestionMetadata[] = [];
    const errors: string[] = [];

    for (const [path] of Object.entries(questionModules)) {
      try {
        const filename = path.replace('/public/questions/', '');

        // Skip hidden files/folders
        if (this.shouldIgnorePath(filename)) {
          continue;
        }

        const fetchPath = `${QuestionService.BASE_PATH}${filename}`;
        const response = await fetch(fetchPath);

        if (!response.ok) {
          errors.push(`Failed to fetch ${filename}: ${response.statusText}`);
          continue;
        }

        const questionSet: QuestionSet = await response.json();

        if (!questionSet.questions || !Array.isArray(questionSet.questions)) {
          errors.push(`Invalid format in ${filename}`);
          continue;
        }

        // Extract only metadata
        questionSet.questions.forEach((q) => {
          if (q.id && q.type && q.subject && q.topic) {
            allMetadata.push({
              id: q.id,
              type: q.type,
              subject: q.subject,
              topic: q.topic,
              chapter: q.chapter,
              difficulty: q.difficulty,
              sourceFile: filename,
            });
          }
        });
      } catch (error) {
        errors.push(`Error loading ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Errors building question index:', errors);
    }

    return {
      questions: allMetadata,
      lastUpdated: new Date(),
    };
  }

  /**
   * Load actual question content for specific questions by their IDs
   */
  async loadQuestions(questionIds: string[], index: QuestionIndex): Promise<Question[]> {
    // Group questions by source file for efficient loading
    const fileGroups = new Map<string, string[]>();

    questionIds.forEach(id => {
      const metadata = index.questions.find(q => q.id === id);
      if (metadata) {
        const ids = fileGroups.get(metadata.sourceFile) || [];
        ids.push(id);
        fileGroups.set(metadata.sourceFile, ids);
      }
    });

    const loadedQuestions: Question[] = [];

    // Load each file and extract requested questions
    for (const [sourceFile, ids] of fileGroups.entries()) {
      try {
        const questions = await this.loadQuestionsFromFile(sourceFile);
        const matchingQuestions = questions.filter(q => ids.includes(q.id));
        loadedQuestions.push(...matchingQuestions);
      } catch (error) {
        console.error(`Error loading questions from ${sourceFile}:`, error);
      }
    }

    return loadedQuestions;
  }

  /**
   * Load all questions from a specific file
   */
  async loadQuestionsFromFile(sourceFile: string): Promise<Question[]> {
    // Check cache first
    if (this.cache.has(sourceFile)) {
      return this.cache.get(sourceFile)!.questions;
    }

    const fetchPath = `${QuestionService.BASE_PATH}${sourceFile}`;
    const response = await fetch(fetchPath);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${sourceFile}: ${response.statusText}`);
    }

    const questionSet: QuestionSet = await response.json();

    if (!questionSet.questions || !Array.isArray(questionSet.questions)) {
      throw new Error(`Invalid question set format in ${sourceFile}`);
    }

    // Add sourceFile to each question
    questionSet.questions.forEach(q => {
      q.sourceFile = sourceFile;
    });

    // Cache the result
    this.cache.set(sourceFile, questionSet);

    return questionSet.questions;
  }

  /**
   * Load questions by subject
   */
  async loadQuestionsBySubject(subject: string, index: QuestionIndex): Promise<Question[]> {
    const questionIds = index.questions
      .filter(q => q.subject === subject)
      .map(q => q.id);

    return this.loadQuestions(questionIds, index);
  }

  /**
   * Load questions by topic
   */
  async loadQuestionsByTopic(topic: string, index: QuestionIndex): Promise<Question[]> {
    const questionIds = index.questions
      .filter(q => q.topic === topic)
      .map(q => q.id);

    return this.loadQuestions(questionIds, index);
  }

  /**
   * Load questions by multiple filters
   */
  async loadQuestionsByFilter(
    filter: {
      subjects?: string[];
      topics?: string[];
      difficulties?: string[];
      chapters?: string[];
    },
    index: QuestionIndex
  ): Promise<Question[]> {
    let filtered = index.questions;

    if (filter.subjects && filter.subjects.length > 0) {
      filtered = filtered.filter(q => filter.subjects!.includes(q.subject));
    }

    if (filter.topics && filter.topics.length > 0) {
      filtered = filtered.filter(q => filter.topics!.includes(q.topic));
    }

    if (filter.difficulties && filter.difficulties.length > 0) {
      filtered = filtered.filter(q => filter.difficulties!.includes(q.difficulty));
    }

    if (filter.chapters && filter.chapters.length > 0) {
      filtered = filtered.filter(q => q.chapter && filter.chapters!.includes(q.chapter));
    }

    const questionIds = filtered.map(q => q.id);
    return this.loadQuestions(questionIds, index);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if a path should be ignored
   */
  private shouldIgnorePath(path: string): boolean {
    const segments = path.split('/');
    return segments.some(segment => segment.startsWith('.'));
  }
}

// Export singleton instance
export const questionService = new QuestionService();
