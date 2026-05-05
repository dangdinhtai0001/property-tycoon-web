import { describe, it, expect } from 'vitest'
import { StateMachine } from './StateMachine'
import type { Transition } from './StateMachine'

type Phase = 'IDLE' | 'RUNNING' | 'PAUSED' | 'DONE'
type Action = 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'INVALID_ACTION'

const transitions: Transition<Phase, Action>[] = [
  { from: 'IDLE', action: 'START', to: 'RUNNING' },
  { from: 'RUNNING', action: 'PAUSE', to: 'PAUSED' },
  { from: 'PAUSED', action: 'RESUME', to: 'RUNNING' },
  { from: ['RUNNING', 'PAUSED'], action: 'STOP', to: 'DONE' },
  {
    from: 'RUNNING',
    action: 'START',
    to: 'RUNNING',
    guard: (s: any) => s.speed < 100,
  },
]

const machine = new StateMachine<Phase, Action>(transitions)
const state: any = { speed: 50 }
const fastState: any = { speed: 100 }

describe('StateMachine', () => {
  it('returns target phase for a valid transition', () => {
    expect(machine.transition('IDLE', 'START', state)).toBe('RUNNING')
  })

  it('returns null for an invalid action from the current phase', () => {
    expect(machine.transition('IDLE', 'PAUSE', state)).toBeNull()
  })

  it('returns null for a completely unknown action', () => {
    expect(machine.transition('IDLE', 'INVALID_ACTION', state)).toBeNull()
  })

  it('supports array of source phases', () => {
    expect(machine.transition('RUNNING', 'STOP', state)).toBe('DONE')
    expect(machine.transition('PAUSED', 'STOP', state)).toBe('DONE')
  })

  it('guard passes — transition allowed', () => {
    expect(machine.transition('RUNNING', 'START', state)).toBe('RUNNING')
  })

  it('guard fails — transition blocked, returns null', () => {
    expect(machine.transition('RUNNING', 'START', fastState)).toBeNull()
  })

  it('canTransition returns true for valid transition', () => {
    expect(machine.canTransition('IDLE', 'START', state)).toBe(true)
  })

  it('canTransition returns false for invalid transition', () => {
    expect(machine.canTransition('IDLE', 'PAUSE', state)).toBe(false)
  })
})
