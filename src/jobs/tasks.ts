const EVERY_MINUTE = '* * * * *'; // TEST

const tasks = {
  TEST: {
    interval: EVERY_MINUTE,
    task: () =>
      Promise.resolve({
        test: 'test',
      }),
  },
};

export default tasks;
