import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ExerciseCard } from './ExerciseCard';

const renderExerciseCard = (ui: ReactElement): ReturnType<typeof render> =>
  render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>);

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
    renderExerciseCard(
      <ExerciseCard
        exercise={exercise}
        instructionsOpen={false}
        onToggleInstructions={jest.fn()}
        trailingActions={<button type="button">Adicionar</button>}
      />,
    );

    expect(screen.getByRole('heading', { name: exercise.name })).toBeInTheDocument();
    expect(screen.getByText('Força')).toBeInTheDocument();
    expect(screen.getByText('Peso do corpo')).toBeInTheDocument();
    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Equipamento')).toBeInTheDocument();
    expect(screen.getByText('Iniciante')).toBeInTheDocument();
    expect(screen.getByText('Puxar')).toBeInTheDocument();
    expect(screen.getByText('Isolado')).toBeInTheDocument();
    expect(screen.getByText('Nível').querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Tipo de força').querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Mecânica').querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Iniciante')).toHaveClass('pl-5');
    expect(screen.getByText('Puxar')).toHaveClass('pl-5');
    expect(screen.getByText('Isolado')).toHaveClass('pl-5');
    const details = screen.getByText('Nível').closest('dl');
    expect(details).toHaveClass('flex-wrap');
    expect(details).not.toHaveClass('grid-cols-1');
    expect(screen.getByText('Abdominais')).toBeInTheDocument();
    const instructionsButton = screen.getByRole('button', {
      name: `Instruções: ${exercise.name}`,
    });
    expect(instructionsButton).toHaveAttribute('type', 'button');
    expect(instructionsButton).toHaveAttribute(
      'aria-controls',
      `exercise-instructions-${exercise.id}`,
    );
    expect(screen.getByText(`• ${exercise.instructions[0]}`)).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
  });

  test('explains exercise levels through the accessible info control', async () => {
    const user = userEvent.setup();

    renderExerciseCard(
      <ExerciseCard
        exercise={exercise}
        instructionsOpen={false}
        onToggleInstructions={jest.fn()}
      />,
    );

    const infoButton = screen.getByRole('button', { name: 'Sobre os níveis de exercício' });
    expect(infoButton).toHaveAttribute('data-state', 'closed');

    await user.hover(infoButton);
    const levelInfo = await screen.findByRole('tooltip');
    expect(levelInfo).toBeVisible();
    expect(levelInfo).toHaveClass('max-h-[calc(100dvh-2rem)]');
    expect(levelInfo).toHaveTextContent(
      'O nível é uma classificação relativa do catálogo: ele compara a complexidade de execução entre exercícios',
    );
    expect(levelInfo).toHaveTextContent('não define pontuação, carga, número de repetições');
    expect(levelInfo).toHaveTextContent('Iniciante: execução geralmente mais simples');
    expect(levelInfo).toHaveTextContent('Intermediário: requer técnica consistente');
    expect(levelInfo).toHaveTextContent('Avançado: exige domínio técnico');
    expect(levelInfo).toHaveTextContent('Use o nível para comparar a complexidade do movimento');

    await user.keyboard('{Escape}');
    expect(levelInfo).not.toBeVisible();

    await user.unhover(infoButton);
    fireEvent.pointerDown(infoButton);
    fireEvent.click(infoButton);
    const clickedLevelInfo = await screen.findByRole('tooltip');
    expect(clickedLevelInfo).toBeVisible();
  });

  test('opens the level tooltip on the first touch', async () => {
    renderExerciseCard(
      <ExerciseCard
        exercise={exercise}
        instructionsOpen={false}
        onToggleInstructions={jest.fn()}
      />,
    );

    const infoButton = screen.getByRole('button', { name: 'Sobre os níveis de exercício' });
    fireEvent.pointerDown(infoButton, { pointerType: 'touch' });
    fireEvent.click(infoButton);

    const levelInfo = await screen.findByRole('tooltip');
    expect(levelInfo).toBeVisible();

    fireEvent.pointerDown(infoButton, { pointerType: 'touch' });
    fireEvent.click(infoButton);
    expect(levelInfo).not.toBeVisible();
  });

  test('renders exercise metadata with Brazilian Portuguese accents and casing', () => {
    renderExerciseCard(
      <ExerciseCard
        exercise={{
          ...exercise,
          category: 'levantamento-olimpico',
          equipment: 'bola-de-exercicio',
          level: 'intermediario',
          force: 'push',
          mechanic: 'composto',
          primaryMuscles: ['biceps'],
          secondaryMuscles: ['gluteos', 'quadriceps'],
        }}
        instructionsOpen={false}
        onToggleInstructions={jest.fn()}
      />,
    );

    expect(screen.getByText('Levantamento olímpico')).toBeInTheDocument();
    expect(screen.getByText('Bola de exercício')).toBeInTheDocument();
    expect(screen.getByText('Intermediário')).toBeInTheDocument();
    expect(screen.getByText('Empurrar')).toBeInTheDocument();
    expect(screen.getByText('Composto')).toBeInTheDocument();
    expect(screen.getByText('Bíceps')).toBeInTheDocument();
    expect(screen.getByText('Glúteos, Quadríceps')).toBeInTheDocument();
  });

  test('omits optional force and mechanic details when unavailable', () => {
    renderExerciseCard(
      <ExerciseCard
        exercise={{ ...exercise, force: null, mechanic: null }}
        instructionsOpen={false}
        onToggleInstructions={jest.fn()}
      />,
    );

    expect(screen.queryByText('Tipo de força')).not.toBeInTheDocument();
    expect(screen.queryByText('Mecânica')).not.toBeInTheDocument();
  });

  /**
   * A user opens the instruction section of an exercise card.
   * Mock: the card starts closed and receives a toggle callback.
   * Assert: the instruction content becomes visible when the toggle is clicked.
   */
  test('shows instructions when the section is open', async () => {
    const user = userEvent.setup();
    const onToggleInstructions = jest.fn();

    const { rerender } = renderExerciseCard(
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
      <TooltipProvider>
        <ExerciseCard
          exercise={exercise}
          instructionsOpen
          onToggleInstructions={onToggleInstructions}
          trailingActions={<button type="button">Adicionar</button>}
        />
      </TooltipProvider>,
    );

    expect(screen.getByText(`• ${exercise.instructions[0]}`)).toBeVisible();
  });
});
