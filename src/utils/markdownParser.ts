import { ParsedQuestion, ParsedAnswer, ExamQuestion } from '../types/exam';

export interface ParseResult {
  title: string;
  questions: ExamQuestion[];
  error?: string;
}

/**
 * Extract exam title if present (first top-level header # Title)
 */
export function extractExamTitle(content: string, defaultTitle: string = 'Mock Practice Exam'): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    // Exclude title lines that say "Answers & Detailed Explanations" if we want clean title
    const cleanTitle = match[1].replace(/-\s*Answers.*$/i, '').trim();
    return cleanTitle || defaultTitle;
  }
  return defaultTitle;
}

/**
 * Parses markdown containing questions
 */
export function parseQuestionsMarkdown(content: string): { title: string; questions: ParsedQuestion[] } {
  const title = extractExamTitle(content, 'Mock Practice Exam');
  const questions: ParsedQuestion[] = [];

  // Split by headers like ### Question 1 or ## Question 1 or Question 1
  // Regex to match question headings: e.g. ### Question 1 (Initiating)
  const questionHeaderRegex = /(?:^|\n)#{1,4}\s*Question\s+(\d+)(?:\s*\(([^)]+)\))?/gi;
  
  const matches: { index: number; id: number; category?: string; fullMatch: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = questionHeaderRegex.exec(content)) !== null) {
    matches.push({
      index: match.index,
      id: parseInt(match[1], 10),
      category: match[2]?.trim(),
      fullMatch: match[0]
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.fullMatch.length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : content.length;
    
    let block = content.slice(startIndex, endIndex).trim();

    // Remove horizontal rule dividers at end of block
    block = block.replace(/---+\s*$/, '').trim();

    // Parse options vs question body
    const lines = block.split('\n');
    const questionTextLines: string[] = [];
    const options: { key: string; text: string }[] = [];

    // Regex for options: A. Text, A) Text, **A.** Text, A - Text
    const optionRegex = /^\s*(?:\*\*)?([A-Z])[\.\)\:-]\s*(?:\*\*)?\s*(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const optMatch = trimmed.match(optionRegex);
      if (optMatch) {
        options.push({
          key: optMatch[1].toUpperCase(),
          text: optMatch[2].replace(/\*\*/g, '').trim()
        });
      } else {
        questionTextLines.push(line);
      }
    }

    let questionText = questionTextLines.join('\n').trim();
    // If the question text is wrapped in bold like **Question text**, unwrap outer bold if needed
    if (questionText.startsWith('**') && questionText.endsWith('**') && questionText.length > 4) {
      // Only unwrap if there are no internal bold markers
      const inner = questionText.slice(2, -2);
      if (!inner.includes('**')) {
        questionText = inner;
      }
    }

    questions.push({
      id: current.id,
      title: `Question ${current.id}`,
      category: current.category,
      questionText,
      options
    });
  }

  return { title, questions };
}

/**
 * Parses markdown containing answers and explanations
 */
export function parseAnswersMarkdown(content: string): Map<number, ParsedAnswer> {
  const answersMap = new Map<number, ParsedAnswer>();

  const questionHeaderRegex = /(?:^|\n)#{1,4}\s*Question\s+(\d+)/gi;
  const matches: { index: number; id: number; fullMatch: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = questionHeaderRegex.exec(content)) !== null) {
    matches.push({
      index: match.index,
      id: parseInt(match[1], 10),
      fullMatch: match[0]
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.fullMatch.length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : content.length;
    
    let block = content.slice(startIndex, endIndex).trim();
    block = block.replace(/---+\s*$/, '').trim();

    // Extract Correct Answer: e.g. **Correct Answer:** B  or Answer: B
    const answerMatch = block.match(/(?:\*\*)?(?:Correct\s+)?Answer:?(?:\*\*)?\s*([A-Z](?:\s*,\s*[A-Z])*)/i);
    const correctAnswer = answerMatch ? answerMatch[1].toUpperCase() : '';

    // Extract Explanation: e.g. **Explanation:** text...
    let explanation = '';
    const expMatch = block.match(/(?:\*\*)?Explanation:?(?:\*\*)?\s*([\s\S]+)/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
      // Remove trailing dividers or citation markers if desired, or keep as is
    }

    answersMap.set(current.id, {
      id: current.id,
      correctAnswer,
      explanation
    });
  }

  return answersMap;
}

/**
 * Parse combined or separate question/answer markdown contents
 */
export function parseExamFiles(questionsContent: string, answersContent?: string): ParseResult {
  try {
    const { title, questions: parsedQuestions } = parseQuestionsMarkdown(questionsContent);

    if (parsedQuestions.length === 0) {
      return {
        title: 'Mock Exam',
        questions: [],
        error: 'No valid questions found in the questions file. Please check the markdown format.'
      };
    }

    let answersMap = new Map<number, ParsedAnswer>();

    // If answers content provided, parse it
    if (answersContent && answersContent.trim().length > 0) {
      answersMap = parseAnswersMarkdown(answersContent);
    } else {
      // Try parsing answers from questionsContent if it's a combined single file!
      answersMap = parseAnswersMarkdown(questionsContent);
    }

    // Combine questions and answer keys
    const questions: ExamQuestion[] = parsedQuestions.map((q) => {
      const ans = answersMap.get(q.id);
      return {
        ...q,
        correctAnswer: ans?.correctAnswer || '',
        explanation: ans?.explanation || 'No detailed explanation provided for this question.'
      };
    });

    return {
      title,
      questions
    };
  } catch (err: any) {
    return {
      title: 'Mock Exam',
      questions: [],
      error: `Failed to parse markdown: ${err.message || err}`
    };
  }
}
