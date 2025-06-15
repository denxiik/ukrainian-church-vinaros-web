const blogPostsContainer = document.getElementById('blogPostsContainer');
const singlePostContainer = document.getElementById('singlePostContainer');
const loadMoreButton = document.getElementById('loadMorePosts');

let allPosts = [];
let postsPerPage = 5;
let currentIndex = 0;

const isSinglePostPage = window.location.pathname.includes('/post.html');

async function fetchPosts() {
    try {
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
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p class="post-date">${new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div class="post-content">${post.content}</div>
            <div class="post-carousel">
                <div class="carousel-track" id="carouselTrack-${post.id}">
                </div>
            </div>
        `;
        fragment.appendChild(postElement);

        const carouselTrack = postElement.querySelector(`#carouselTrack-${post.id}`);
        const carouselContainer = carouselTrack.parentElement;

        if (post.images && post.images.length > 0) {
            if (post.images.length <= 2) {
                carouselContainer.classList.add('static-images');
                post.images.forEach(imageSrc => {
                    const carouselItem = document.createElement('div');
                    carouselItem.classList.add('carousel-item');
                    carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
                    carouselTrack.appendChild(carouselItem);
                });
            } else {
                const allCarouselImages = [...post.images, ...post.images];
                allCarouselImages.forEach(imageSrc => {
                    const carouselItem = document.createElement('div');
                    carouselItem.classList.add('carousel-item');
                    carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
                    carouselTrack.appendChild(carouselItem);
                });
            }
        } else {
            carouselContainer.style.display = 'none';
        }
    });

    blogPostsContainer.appendChild(fragment);
    currentIndex += postsToLoad.length;

    if (loadMoreButton) {
        if (currentIndex >= allPosts.length) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
    }
}

function displaySinglePost() {
    if (!singlePostContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (!postId) {
        singlePostContainer.innerHTML = '<p>Допис не знайдено. Будь ласка, вкажіть ID допису.</p>';
        return;
    }

    const post = allPosts.find(p => p.id === postId);

    if (!post) {
        singlePostContainer.innerHTML = '<p>Допис з таким ID не знайдено.</p>';
        return;
    }

    const postElement = document.createElement('article');
    postElement.classList.add('blog-post', 'single-view');
    postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p class="post-date">${new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div class="post-content">${post.content}</div>
        <div class="post-carousel">
            <div class="carousel-track" id="carouselTrack-${post.id}">
            </div>
        </div>
    `;
    singlePostContainer.appendChild(postElement);

    const carouselTrack = postElement.querySelector(`#carouselTrack-${post.id}`);
    const carouselContainer = carouselTrack.parentElement;

    if (post.images && post.images.length > 0) {
        if (post.images.length <= 2) {
            carouselContainer.classList.add('static-images');
            post.images.forEach(imageSrc => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
                carouselTrack.appendChild(carouselItem);
            });
        } else {
            post.images.forEach(imageSrc => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
                carouselTrack.appendChild(carouselItem);
            });
        }
    } else {
        carouselContainer.style.display = 'none';
    }
}

if (loadMoreButton) {
    loadMoreButton.addEventListener('click', displayPostsList);
}

fetchPosts();