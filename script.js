const container = document.getElementById("meme-container");
const search = document.getElementById("search");
const sort = document.getElementById("sort");

const allBtn = document.getElementById("allBtn");

const likedBtn = document.getElementById("likedBtn");
const backBtn = document.getElementById("backBtn");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");

const shareBtn = document.getElementById("shareBtn");
const downloadBtn = document.getElementById("downloadBtn");
const likeBtn = document.getElementById("likeBtn");

const close = document.getElementById("close");
const toggle = document.getElementById("themeToggle");

let memes = [];
let filtered = [];
let liked = JSON.parse(localStorage.getItem("liked")) || [];
let current = {};



fetch("https://api.imgflip.com/get_memes")
    .then(res => res.json())
    .then(data => {
        memes = data.data.memes;
        filtered = memes;
        display(filtered);
    });

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}


function display(data) {
    container.innerHTML = data.map(meme => {
        const isLiked = liked.includes(meme.id);
        const nameSafe = escapeHTML(meme.name);
        return `
        <div class="card">
            <div class="card-img-wrapper" onclick="openModal('${meme.url}', '${nameSafe}', '${meme.id}')">
                <img src="${meme.url}" alt="${nameSafe}" loading="lazy">
            </div>
            <div class="card-content">
                <h3 class="card-title">${nameSafe}</h3>
                <div class="card-actions">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${meme.id}')" title="Like">
                        <i class="${isLiked ? 'ph-fill' : 'ph'} ph-heart"></i>
                    </button>
                    <button class="action-btn" onclick="share('${meme.url}')" title="Share">
                        <i class="ph ph-share-network"></i>
                    </button>
                    <button class="action-btn primary" onclick="download('${meme.url}')" title="Download">
                        <i class="ph ph-download-simple"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join("");
}



function openModal(url, name, id) {
    modal.style.display = "flex";
    void modal.offsetWidth;
    modal.classList.add("active");
    document.body.classList.add("no-scroll");

    modalImg.src = url;
    modalTitle.textContent = name;

    current = { url, id };

    const isLiked = liked.includes(id);
    likeBtn.className = `action-btn ${isLiked ? 'liked' : ''}`;
    likeBtn.innerHTML = `<i class="${isLiked ? 'ph-fill' : 'ph'} ph-heart"></i> Like`;
}



close.onclick = () => {
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300); 
}


document.querySelector(".modal-backdrop").addEventListener("click", () => {
    close.onclick();
});


function share(url) {
    navigator.clipboard.writeText(url)
        .then(() => alert("URL Copied to clipboard!"))
        .catch(() => alert("Failed to copy URL"));
}

shareBtn.onclick = () => {
    share(current.url);
}



async function download(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = blobUrl;
        const filename = url.split('/').pop() || "meme.jpg";
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Error downloading image:", error);
        window.open(url, '_blank');
    }
}

downloadBtn.onclick = () => {
    download(current.url);
}


function toggleLike(id) {
    if (liked.includes(id)) {
        liked = liked.filter(x => x !== id);
    } else {
        liked.push(id);
    }

    localStorage.setItem("liked", JSON.stringify(liked));
    display(filtered);
    if (current.id === id) {
        const isLiked = liked.includes(id);
        likeBtn.className = `action-btn ${isLiked ? 'liked' : ''}`;
        likeBtn.innerHTML = `<i class="${isLiked ? 'ph-fill' : 'ph'} ph-heart"></i> Like`;
    }
}

likeBtn.onclick = () => {
    toggleLike(current.id);
}


search.addEventListener("input", e => {
    let val = e.target.value.toLowerCase();
    filtered = memes.filter(m =>
        m.name.toLowerCase().includes(val)
    );
    display(filtered);
});


function setActiveFilterBtn(btn) {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
}

sort.addEventListener("change", e => {
    let sorted = [...filtered];
    if (e.target.value === "az") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (e.target.value === "za") {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    display(sorted);
});


allBtn.onclick = () => {
    filtered = memes;
    display(filtered);
    backBtn.style.display = "none";
    setActiveFilterBtn(allBtn);
}




likedBtn.onclick = () => {
    filtered = memes.filter(m => liked.includes(m.id));
    display(filtered);
    backBtn.style.display = "flex";
    setActiveFilterBtn(likedBtn);
}



backBtn.onclick = () => {
    filtered = memes;
    display(filtered);
    backBtn.style.display = "none";
    setActiveFilterBtn(allBtn);
}



toggle.onclick = () => {
    document.body.classList.toggle("light");
    const icon = toggle.querySelector('i');
    if (document.body.classList.contains("light")) {
        icon.classList.remove("ph-moon");
        icon.classList.add("ph-sun");
    } else {
        icon.classList.remove("ph-sun");
        icon.classList.add("ph-moon");
    }
}
