import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

function setup(onConfirm) {
  const onOpenChange = vi.fn();
  render(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title="Delete this ticket?"
      description="It will be hidden."
      confirmLabel="Delete"
      destructive
      onConfirm={onConfirm}
    />
  );
  return { onOpenChange };
}

describe('ConfirmDialog', () => {
  it('runs the action and closes on success', async () => {
    const onConfirm = vi.fn().mockResolvedValue();
    const { onOpenChange } = setup(onConfirm);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('stays open when the action fails', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('nope'));
    const { onOpenChange } = setup(onConfirm);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('cancel does not run the action', async () => {
    const onConfirm = vi.fn();
    const { onOpenChange } = setup(onConfirm);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
