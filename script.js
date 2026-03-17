const backgrounds = {
  future: 'images/bg_future.jpg',
  distance: 'images/bg_distance.jpg',
  finance: 'images/bg_finance.jpg'
};

function selectCategory(id) {
  const bg = backgrounds[id];
  if (bg) {
    document.body.style.backgroundImage = `url(${bg})`;
  }
}
