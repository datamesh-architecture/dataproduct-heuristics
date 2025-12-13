import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { AnswerMap, QuestionStep, STEPS, STORAGE_KEY } from '../data/heuristics';

describe('App', () => {
  const questionSteps = STEPS.filter((step): step is QuestionStep => step.kind === 'question');

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('requires an answer before continuing and advances to the next question', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByText('Do concrete teams or roles exist now?')
    ).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Partially / unclear' }));
    expect(nextButton).toBeEnabled();

    await user.click(nextButton);
    expect(
      screen.getByText('Can consumers use this without stitching other products?')
    ).toBeInTheDocument();
  });

  it('hydrates from local storage and jumps to the first unanswered heuristic', () => {
    const savedAnswers: AnswerMap = { [questionSteps[0].id]: 2 };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAnswers));

    render(<App />);

    expect(
      screen.getByText('Can consumers use this without stitching other products?')
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

    expect(screen.getByText('Outcome transparency')).toBeInTheDocument();
    expect(
      screen.getByText('Multiple archetypes qualify. Layer the products deliberately.')
    ).toBeInTheDocument();

    expect(screen.getAllByText('Do concrete teams or roles exist now?')[0]).toBeInTheDocument();
    expect(screen.getAllByText('2')[0]).toBeInTheDocument();
  });
});
