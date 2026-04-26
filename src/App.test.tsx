import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Interactive Time Master app', () => {
  it('renders the classroom clock learning surface', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '째깍째깍 시간 탐험대' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: '분침을 움직이는 아날로그 시계' })).toBeInTheDocument();
    expect(screen.getByText('Lv. 3')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '보상함' })).toBeInTheDocument();
    expect(screen.getByText('탐험 지도')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('4시 15분을 만들어보세요!')).toBeInTheDocument();
    expect(screen.getByText('03:00')).toBeInTheDocument();
  });

  it('moves the clock by 5 minutes with keyboard controls', async () => {
    const user = userEvent.setup();
    render(<App />);

    screen.getByRole('slider', { name: '분침을 움직이는 아날로그 시계' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByText('03:05')).toBeInTheDocument();
    expect(screen.getByText('3시 5분')).toBeInTheDocument();
  });

  it('announces an incorrect answer with the minute difference', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '정답 확인' }));

    expect(screen.getByRole('status')).toHaveTextContent('아직 75분 차이가 납니다');
  });

  it('announces a correct answer after matching the mission', async () => {
    const user = userEvent.setup();
    render(<App />);
    const clock = screen.getByRole('slider', { name: '분침을 움직이는 아날로그 시계' });
    clock.focus();

    for (let index = 0; index < 15; index += 1) {
      await user.keyboard('{ArrowRight}');
    }

    await user.click(screen.getByRole('button', { name: '정답 확인' }));

    expect(screen.getByRole('status')).toHaveTextContent('정답입니다');
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('정답 보상이 준비됐어요.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /보상함/ }));
    expect(screen.getByText('별 스티커 보상을 찾았어요!')).toBeInTheDocument();
  });

  it('moves to the next mission', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '다음 미션' }));

    expect(screen.getByText('3시 반을 만들어보세요!')).toBeInTheDocument();
  });
});
