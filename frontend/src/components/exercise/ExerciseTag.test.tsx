import { render, screen } from '@testing-library/react';
import { ExerciseTag } from './ExerciseTag';

describe('ExerciseTag', () => {
  test('renders a labeled value as a pill', () => {
    render(<ExerciseTag label="Categoria" value="Cardio" />);

    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Cardio')).toBeInTheDocument();
  });

  test('omits the pill when the value is empty', () => {
    render(<ExerciseTag label="Equipamento" value={null} />);

    expect(screen.queryByText('Equipamento')).not.toBeInTheDocument();
  });
});
