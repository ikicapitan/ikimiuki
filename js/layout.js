document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".custom-header");
    const footer = document.querySelector("footer");

    if (header) {
        header.innerHTML = `
            <img src="img/logo.png" alt="Logo" class="main-logo">
            <nav class="cat-nav">
                <a href="index.html"><img src="img/btn-home.png" alt="Home"></a>
                <a href="books.html"><img src="img/btn-books.png" alt="Books"></a>
                <a href="music.html"><img src="img/btn-music.png" alt="Music"></a>
                <a href="more.html"><img src="img/btn-more.png" alt="More"></a>
            </nav>
        `;
    }

    if (footer) {
        footer.innerHTML = `
            <p>&copy; 2026 Iki</p>
            <p>Iki Capitan (Alan Wilhelm)</p>
            <p>PepiCA</p>
        `;
    }
});