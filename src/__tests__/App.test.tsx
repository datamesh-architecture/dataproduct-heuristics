import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { AnswerMap, QuestionStep, STEPS, STORAGE_KEY } from '../data/heuristics';

describe('App', () => {
  const questionSteps = STEPS.filter((step): step is QuestionStep => step.kind === 'question');

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('auto-advances to the next question after selecting an answer', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByText('Are there any specific teams or roles that want to use this product right now?')
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Partially / unclear' }));

    expect(
      screen.getByText('Can consumers use this without stitching data products together?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('hydrates from local storage and jumps to the first unanswered heuristic', () => {
    const savedAnswers: AnswerMap = { [questionSteps[0].id]: 2 };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAnswers));

    render(<App />);

    expect(
      screen.getByText('Can consumers use this without stitching data products together?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
  });

  it('shows the final transparency table when every heuristic is answered', () => {
    const allAnswered = questionSteps.reduce<AnswerMap>((acc, step) => {
      acc[step.id] = step.maxScore;
      return acc;
    }, {} as AnswerMap);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allAnswered));

    render(<App />);

    expect(screen.getByText('Overall summary')).toBeInTheDocument();
    expect(
      screen.getByText('Multiple archetypes qualify. Consider layering the products deliberately.')
    ).toBeInTheDocument();

    expect(
      screen.getAllByText('Are there any specific teams or roles that want to use this product right now?')[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText('2')[0]).toBeInTheDocument();
  });

  it('restores the saved step index when stored state includes it', () => {
    const answered = questionSteps.slice(0, 3).reduce<AnswerMap>((acc, step) => {
      acc[step.id] = step.maxScore;
      return acc;
    }, {} as AnswerMap);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers: answered, currentIndex: 5 })
    );

    render(<App />);

    expect(screen.getByText(questionSteps[5].prompt)).toBeInTheDocument();
  });
});
