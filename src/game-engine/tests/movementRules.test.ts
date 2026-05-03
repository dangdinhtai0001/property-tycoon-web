import { describe, it, expect } from 'vitest';
import { calculateNewPosition } from '../rules/movementRules';

describe('Movement Rules', () => {
  it('should calculate new position correctly within board limits', () => {
    const { position, passedStart } = calculateNewPosition(0, 5, 44);
    expect(position).toBe(5);
    expect(passedStart).toBe(false);
  });

  it('should wrap around the board and detect passing start', () => {
    const { position, passedStart } = calculateNewPosition(42, 5, 44);
    expect(position).toBe(3);
    expect(passedStart).toBe(true);
  });

  it('should detect passing start when landing exactly on 0', () => {
    const { position, passedStart } = calculateNewPosition(39, 5, 44);
    expect(position).toBe(0);
    expect(passedStart).toBe(true);
  });
});
