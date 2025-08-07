export const domain = (() => {
  if ($app.stage === "production") return "rewnad.dev";
  if ($app.stage === "dev") return "dev.rewnad.dev";
  return `${$app.stage}.dev.rewnad.dev`;
})();

export const subdomain = (subdomain: string) => {
  return `${subdomain}.${domain}`;
};
