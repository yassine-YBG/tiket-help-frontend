import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

const info = (page, total = 57, limit = 20) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
};

describe('Pagination', () => {
  it('shows the range and total', () => {
    render(<Pagination pagination={info(2)} onPageChange={() => {}} />);
    expect(screen.getByRole('navigation')).toHaveTextContent('Showing 21–40 of 57');
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination pagination={info(1)} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeEnabled();
    rerender(<Pagination pagination={info(3)} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    expect(screen.getByRole('navigation')).toHaveTextContent('Showing 41–57 of 57');
  });

  it('calls onPageChange with the new page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination pagination={info(2)} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText('Next page'));
    await userEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<Pagination pagination={info(1, 0)} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
