import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

describe('ticket badges', () => {
  it.each([
    ['non résolu', 'Open'],
    ['en cours', 'In progress'],
    ['résolu', 'Resolved'],
  ])('status %s is shown as "%s"', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([
    ['low', 'Low'],
    ['normal', 'Normal'],
    ['high', 'High'],
    ['urgent', 'Urgent'],
  ])('priority %s is shown as "%s"', (priority, label) => {
    render(<PriorityBadge priority={priority} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
