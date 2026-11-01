import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilePicker } from './FilePicker';

function Harness({ onChange = () => {} }) {
  const [files, setFiles] = useState([]);
  return <FilePicker files={files} onChange={(f) => { setFiles(f); onChange(f); }} />;
}

const file = (name, type, size = 100) => new File([new Uint8Array(size)], name, { type });

describe('FilePicker', () => {
  it('lists chosen files and lets you remove them', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<Harness />);
    await user.upload(screen.getByLabelText('Attach files'), [file('photo.png', 'image/png'), file('doc.pdf', 'application/pdf')]);
    const list = screen.getByRole('list', { name: 'Selected files' });
    expect(list).toHaveTextContent('photo.png');
    expect(list).toHaveTextContent('doc.pdf');
    await user.click(screen.getByRole('button', { name: 'Remove photo.png' }));
    expect(list).not.toHaveTextContent('photo.png');
  });

  it('shows an error for a forbidden file and does not add it', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.upload(screen.getByLabelText('Attach files'), file('page.html', 'text/html'));
    expect(screen.getByRole('alert')).toHaveTextContent('"page.html": this file type is not allowed');
    expect(onChange).not.toHaveBeenCalled();
  });
});
