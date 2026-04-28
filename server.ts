import route from "./route";

//Routes
(async function () {
  try {
    const port = process.env.PORT || 8094;
    await route.listen(port, () => {
      console.log("Server is up on port: " + port);
    });
  } catch (e) {
    console.log(e);
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  }
})();
