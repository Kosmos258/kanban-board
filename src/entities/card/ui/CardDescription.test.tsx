import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CardDescription } from './CardDescription';

describe('CardDescription', () => {
  it('показывает пустое поле-плейсхолдер и сохраняет введённый текст', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CardDescription value={null} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Добавить описание' }));
    await user.type(screen.getByLabelText('Описание карточки'), 'Новый текст');
    await user.tab();

    expect(onSave).toHaveBeenCalledWith('Новый текст');
    expect(screen.getByText('Новый текст')).toBeInTheDocument();
  });

  it('Escape отменяет правку и ничего не сохраняет', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<CardDescription value="Старый" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: /Описание: Старый/ }));
    await user.type(
      screen.getByLabelText('Описание карточки'),
      ' плюс{Escape}'
    );

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Старый')).toBeInTheDocument();
  });

  it('очищенный текст сохраняется как null', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<CardDescription value="Было" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: /Описание: Было/ }));
    await user.clear(screen.getByLabelText('Описание карточки'));
    await user.tab();

    expect(onSave).toHaveBeenCalledWith(null);
  });

  it('без обработчика пустое описание не рисуется вовсе', () => {
    const { container } = render(<CardDescription value={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
