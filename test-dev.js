const check = async (path) => {
  try {
    const res = await fetch('http://localhost:3000' + path);
    console.log(path, ':', res.status);
    if (res.status !== 200) {
       console.log("Response text:", await res.text());
    }
  } catch (e) {
    console.log(path, 'error:', e.message);
  }
};

(async () => {
  await check('/src/main.tsx');
  await check('/src/App.tsx');
  await check('/src/components/GameScene.tsx');
  await check('/src/components/ClawMachine.tsx');
  await check('/src/components/ShimaEnaga.tsx');
})();
