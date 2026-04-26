type RewardChestProps = {
  unlocked: boolean;
  opened: boolean;
  onOpen: () => void;
};

export function RewardChest({ unlocked, opened, onOpen }: RewardChestProps) {
  const rewardAssetUrl = `${import.meta.env.BASE_URL}assets/time-adventure-reward.png`;

  return (
    <section className={`reward-chest ${unlocked ? 'unlocked' : 'locked'}`} aria-label="보상함">
      <img src={rewardAssetUrl} alt="" aria-hidden="true" />
      <button type="button" onClick={onOpen} disabled={!unlocked}>
        <span aria-hidden="true">🏆</span>
        보상함
      </button>
      <p>
        {opened
          ? '별 스티커 보상을 찾았어요!'
          : unlocked
            ? '정답 보상이 준비됐어요.'
            : '정답을 맞혀 보상을 열어요.'}
      </p>
    </section>
  );
}
