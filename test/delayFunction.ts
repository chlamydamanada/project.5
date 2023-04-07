export const delay = (delayInSec: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayInSec));
};
