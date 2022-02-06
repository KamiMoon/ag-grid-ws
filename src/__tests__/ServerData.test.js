const { getGlobalRowData, getDataSubscription } = require("../ServerData");

describe("HighFrequencyGridData", () => {
  test("can get data", () => {
    const data = getGlobalRowData();

    expect(data.length > 0).toBeTruthy();
  });

  test("can subscribe", (done) => {
    const observable = getDataSubscription();
    const subscription = observable.subscribe((item) => {
      expect(item.trade).toBeTruthy();

      subscription.unsubscribe();
      done();
    });
  });
});
