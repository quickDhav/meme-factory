const container = document.getElementById("meme-container");
const loader = document.getElementById("loader");

fetch("https://api.imgflip.com/get_memes")
  .then(response => response.json())
  .then(data => {
    loader.style.display = "none";

    const memes = data.data.memes;

    memes.forEach(meme => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${meme.url}" alt="${meme.name}">
        <h3>${meme.name}</h3>
      `;

      container.appendChild(card);
    });
  })
  .catch(error => {
    loader.innerText = "Failed to load memes 😢";
    console.error(error);
  });