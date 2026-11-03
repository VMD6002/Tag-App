const TIMEOUTS = {
  timeouts: [""],
  setTimeout: function (fn: () => void, delay: number) {
    const id = setTimeout(fn, delay);
    // @ts-expect-error
    this.timeouts.push(id);
  },
  clearAllTimeouts: function () {
    while (this.timeouts.length) {
      clearTimeout(this.timeouts.pop());
    }
  },
};
export default TIMEOUTS;
