const blogPostsContainer = document.getElementById('blogPostsContainer');
const singlePostContainer = document.getElementById('singlePostContainer');
const loadMoreButton = document.getElementById('loadMorePosts');

let allPosts = [];
let postsPerPage = 5;
let currentIndex = 0;

// UPDATED: A more robust way to check if we are on a single post page.
// It checks if the path is an HTML file but not the main 'index.html'.
const isSinglePostPage = window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('/index.html');


async function fetchPosts() {
    try {
        // The path to the JSON is the same from both /blog/index.html and /blog/post1.html
        const response = await fetch('../../data/blog/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allPosts = await response.json();
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (isSinglePostPage) {
            displaySinglePost();
        } else {
            displayPostsList();
        }

    } catch (error) {
        console.error("Error fetching blog posts:", error);
        if (blogPostsContainer) {
            blogPostsContainer.innerHTML = '<p>Не вдалося завантажити дописи. Спробуйте пізніше.</p>';
            if (loadMoreButton) loadMoreButton.style.display = 'none';
        } else if (singlePostContainer) {
            singlePostContainer.innerHTML = '<p>Не вдалося завантажити допис. Спробуйте пізніше.</p>';
        }
    }
}

function displayPostsList() {
    if (!blogPostsContainer) return;

    const fragment = document.createDocumentFragment();
    const postsToLoad = allPosts.slice(currentIndex, currentIndex + postsPerPage);

    postsToLoad.forEach(post => {
        const postElement = document.createElement('article');
        postElement.classList.add('blog-post');

        // UPDATED: The link is now relative to index.html within the /blog/ directory.
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p class="post-date">${new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div class="post-content">${post.content.substring(0, 150)}...</div>
            <div class="post-carousel">
                <div class="carousel-track" id="carouselTrackList-${post.id}">
                </div>
            </div>
            <a href="${post.id}.html" class="read-more-button">Читати далі</a>
        `;
        fragment.appendChild(postElement);

        const carouselTrack = postElement.querySelector(`#carouselTrackList-${post.id}`);
        const carouselContainer = carouselTrack.parentElement;

        if (post.images && post.images.length > 0) {
            carouselContainer.classList.toggle('static-images', post.images.length <= 2);
            const imagesToDisplay = post.images.length > 2 ? [...post.images, ...post.images] : post.images;

            imagesToDisplay.forEach(imageSrc => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
                carouselTrack.appendChild(carouselItem);
            });
        } else {
            carouselContainer.style.display = 'none';
        }
    });

    blogPostsContainer.appendChild(fragment);
    currentIndex += postsToLoad.length;

    if (loadMoreButton) {
        loadMoreButton.style.display = currentIndex >= allPosts.length ? 'none' : 'block';
    }
}

function displaySinglePost() {
    if (!singlePostContainer) return;

    // This logic still works perfectly for getting the ID from the filename.
    const pathParts = window.location.pathname.split('/');
    const postId = pathParts.pop().replace('.html', '');

    if (!postId) {
        singlePostContainer.innerHTML = '<p>Допис не знайдено.</p>';
        return;
    }

    const post = allPosts.find(p => p.id === postId);

    if (!post) {
        singlePostContainer.innerHTML = '<p>Допис з таким ID не знайдено.</p>';
        return;
    }

    // The content is displayed dynamically, while the meta tags are pre-rendered.
    const postElement = document.createElement('article');
    postElement.classList.add('blog-post', 'single-view');
    postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p class="post-date">${new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div class="post-content">${post.content}</div>
        <div class="post-carousel">
            <div class="carousel-track" id="carouselTrackSingle-${post.id}">
            </div>
        </div>
    `;
    singlePostContainer.appendChild(postElement);

    const carouselTrack = postElement.querySelector(`#carouselTrackSingle-${post.id}`);
    const carouselContainer = carouselTrack.parentElement;

    if (post.images && post.images.length > 0) {
        carouselContainer.classList.toggle('static-images', post.images.length <= 2);
        const imagesToDisplay = post.images.length > 2 ? [...post.images, ...post.images] : post.images;
        
        imagesToDisplay.forEach(imageSrc => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            // The image paths from posts.json (e.g., ../../img/...) are correct
            // relative to the new post location (/blog/post1.html), so no change is needed.
            carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
            carouselTrack.appendChild(carouselItem);
        });
    } else {
        carouselContainer.style.display = 'none';
    }
}

if (loadMoreButton) {
    loadMoreButton.addEventListener('click', displayPostsList);
}

fetchPosts();