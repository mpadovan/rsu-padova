export default {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["performance", "best-practices", "accessibility", "pwa"],
    formFactor: "desktop",
    screenEmulation: {
      mobile: false,
      width: 1280,
      height: 720,
      deviceScaleRatio: 1
    }
  }
};
