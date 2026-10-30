import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';

function setup(value = 'Старое') {
  const onSave = vi.fn();
  render(<InlineEdit value={value} onSave={onSave} label="Название" />);
  return { onSave, user: userEvent.setup() };
}

describe('InlineEdit', () => {
  it('по клику показывает поле ввода', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox', { name: 'Название' })).toHaveValue(
      'Старое'
    );
  });

  it('Enter сохраняет новое значение без пробелов по краям', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '  Новое  {Enter}');
    expect(onSave).toHaveBeenCalledExactlyOnceWith('Новое');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('потеря фокуса тоже сохраняет', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('textbox'), '2');
    await user.tab();
    expect(onSave).toHaveBeenCalledExactlyOnceWith('Старое2');
  });

  it('Escape отменяет изменения', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('textbox'), 'xyz{Escape}');
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('Старое');
  });

  it('пустое значение и то же самое значение не сохраняются', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button'));
    await user.clear(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    expect(onSave).not.toHaveBeenCalled();
  });
});
