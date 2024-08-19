export const formatMilliseconds = (ms?: number) => {
  if (!ms) return "0:00";

  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  const secondsRemainder = seconds < 10 ? `0${seconds}` : seconds;

  return `${minutes}:${secondsRemainder}`;
};
