import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { PROGRESS_STORAGE_KEY } from './game/progress';

describe('Interactive Time Master app', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the classroom clock learning surface', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '째깍째깍 시간 탐험대' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: '분침을 움직이는 아날로그 시계' })).toBeInTheDocument();
    expect(screen.getByText('Lv. 1')).toBeInTheDocument();
    expect(screen.getByLabelText('레벨 1, 경험치 0 / 100')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '보상함' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '학습 기록' })).toHaveTextContent('탐험 0 / 10');
    expect(screen.getByText('탐험 지도')).toBeInTheDocument();
    expect(screen.getByLabelText('별 점수 0점')).toBeInTheDocument();
    expect(screen.getByLabelText('1번 미션 current')).toBeInTheDocument();
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
    expect(screen.getByLabelText('레벨 1, 경험치 20 / 100')).toBeInTheDocument();
    expect(screen.getByLabelText('별 점수 5점')).toBeInTheDocument();
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

  it('loads the next unsolved mission and keeps earned scores after reopening', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const clock = screen.getByRole('slider', { name: '분침을 움직이는 아날로그 시계' });
    clock.focus();

    for (let index = 0; index < 15; index += 1) {
      await user.keyboard('{ArrowRight}');
    }

    await user.click(screen.getByRole('button', { name: '정답 확인' }));

    await waitFor(() => {
      expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toContain('"nextMissionIndex":1');
    });

    unmount();
    render(<App />);

    expect(screen.getByText('Lv. 1')).toBeInTheDocument();
    expect(screen.getByLabelText('레벨 1, 경험치 20 / 100')).toBeInTheDocument();
    expect(screen.getByLabelText('별 점수 5점')).toBeInTheDocument();
    expect(screen.getByText('3시 반을 만들어보세요!')).toBeInTheDocument();
    expect(screen.getByLabelText('1번 미션 completed')).toBeInTheDocument();
    expect(screen.getByLabelText('2번 미션 current')).toBeInTheDocument();
  });

  it('asks learners to restart or exit when every map stop is completed', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      completedStops: 10,
      experience: 200,
      stars: 50,
      nextMissionIndex: 10,
    }));

    render(<App />);

    expect(screen.getByText('모든 탐험을 끝냈어요!')).toBeInTheDocument();
    expect(screen.getByText('처음부터 다시 탐험을 시작하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /오늘은 종료/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /처음부터 다시/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /오늘은 종료/ }));

    expect(screen.getByText('오늘의 탐험을 종료했어요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다시 탐험하기/ })).toBeInTheDocument();
  });

  it('restarts a completed exploration from map stop 1 while keeping earned scores', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      completedStops: 10,
      experience: 200,
      stars: 50,
      nextMissionIndex: 10,
    }));

    render(<App />);
    await user.click(screen.getByRole('button', { name: /처음부터 다시/ }));

    expect(screen.getByLabelText('레벨 3, 경험치 0 / 100')).toBeInTheDocument();
    expect(screen.getByLabelText('별 점수 50점')).toBeInTheDocument();
    expect(screen.getByLabelText('1번 미션 current')).toBeInTheDocument();
    expect(screen.getByText('10시 40분을 만들어보세요!')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toContain('"completedStops":0');
    });
  });

  it('shows a learning record and can restart only the map', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      completedStops: 6,
      experience: 120,
      stars: 30,
      nextMissionIndex: 6,
    }));

    render(<App />);

    expect(screen.getByRole('region', { name: '학습 기록' })).toHaveTextContent('탐험 6 / 10');
    expect(screen.getByRole('region', { name: '학습 기록' })).toHaveTextContent('별 30개');

    await user.click(screen.getByRole('button', { name: '지도 다시 시작' }));

    expect(screen.getByLabelText('별 점수 30점')).toBeInTheDocument();
    expect(screen.getByLabelText('레벨 2, 경험치 20 / 100')).toBeInTheDocument();
    expect(screen.getByLabelText('1번 미션 current')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('탐험 지도만 1번부터 다시 시작해요');
  });

  it('can reset all saved learning progress', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      completedStops: 6,
      experience: 120,
      stars: 30,
      nextMissionIndex: 6,
    }));

    render(<App />);

    await user.click(screen.getByRole('button', { name: '전체 초기화' }));

    expect(screen.getByLabelText('레벨 1, 경험치 0 / 100')).toBeInTheDocument();
    expect(screen.getByLabelText('별 점수 0점')).toBeInTheDocument();
    expect(screen.getByLabelText('1번 미션 current')).toBeInTheDocument();
    expect(screen.getByText('4시 15분을 만들어보세요!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('학습 기록을 처음 상태로 되돌렸어요');
  });
});
