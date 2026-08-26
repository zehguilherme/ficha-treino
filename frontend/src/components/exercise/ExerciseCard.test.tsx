import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ExerciseCard } from './ExerciseCard';

const exercise = {
  id: 'flat-bench-leg-raise',
  name: 'Elevação de Pernas no Banco Plano',
  force: 'pull',
  level: 'iniciante',
  mechanic: 'isolado',
  equipment: 'peso-do-corpo',
  primaryMuscles: ['abdominais'],
  secondaryMuscles: [],
  instructions: ['Deite-se de costas em um banco plano.'],
  category: 'forca',
  images: ['flat-bench-leg-raise/0.jpg', 'flat-bench-leg-raise/1.jpg'],
};

describe('ExerciseCard', () => {
  /**
   * An exercise card is rendered with the shared visual content.
   * Mock: one exercise with category, equipment, and primary muscle metadata.
   * Assert: the card exposes the expected exercise details and action footer.
   */
  test('renders the shared exercise details and actions', () => {
    render(
      <ExerciseCard
        exercise={exercise}
        instructionsOpen={false}
        onToggleInstructions={jest.fn()}
        trailingActions={<button type="button">Adicionar</button>}
      />,
    );

    expect(screen.getByRole('heading', { name: exercise.name })).toBeInTheDocument();
    expect(screen.getByText('Forca')).toBeInTheDocument();
    expect(screen.getByText('Peso Do Corpo')).toBeInTheDocument();
    expect(screen.getByText('Abdominais')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Instruções: ${exercise.name}` }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
  });

  /**
   * A user opens the instruction section of an exercise card.
   * Mock: the card starts closed and receives a toggle callback.
   * Assert: the instruction content becomes visible when the toggle is clicked.
   */
  test('shows instructions when the section is open', async () => {
    const user = userEvent.setup();
    const onToggleInstructions = jest.fn();

    const { rerender } = render(
      <ExerciseCard
        exercise={exercise}
        instructionsOpen={false}
        onToggleInstructions={onToggleInstructions}
        trailingActions={<button type="button">Adicionar</button>}
      />,
    );

    await user.click(screen.getByRole('button', { name: `Instruções: ${exercise.name}` }));
    expect(onToggleInstructions).toHaveBeenCalledTimes(1);

    rerender(
      <ExerciseCard
        exercise={exercise}
        instructionsOpen
        onToggleInstructions={onToggleInstructions}
        trailingActions={<button type="button">Adicionar</button>}
      />,
    );

    expect(screen.getByText(`• ${exercise.instructions[0]}`)).toBeInTheDocument();
  });
});
