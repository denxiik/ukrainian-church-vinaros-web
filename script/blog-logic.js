const blogPostsContainer = document.getElementById('blogPostsContainer');
const singlePostContainer = document.getElementById('singlePostContainer');
const loadMoreButton = document.getElementById('loadMorePosts');

let allPosts = [];
let postsPerPage = 5;
let currentIndex = 0;

// This check helps determine if we are on the main blog list or a single post page.
const isSinglePostPage = window.location.pathname.includes('/posts/');

async function fetchPosts() {
    try {
        // Fetch the JSON data containing all blog posts.
        const response = await fetch('../../data/blog/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allPosts = await response.json();
        // Sort posts by date, newest first.
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Route the logic based on the page type.
        if (isSinglePostPage) {
            displaySinglePost();
        } else {
            displayPostsList();
        }

    } catch (error) {
        console.error("Error fetching blog posts:", error);
        // Display user-friendly error messages on the page.
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

        // UPDATED: The link now points directly to the pre-rendered HTML file for each post.
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p class="post-date">${new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div class="post-content">${post.content.substring(0, 150)}...</div>
            <div class="post-carousel">
                <div class="carousel-track" id="carouselTrackList-${post.id}">
                </div>
            </div>
            <a href="posts/${post.id}.html" class="read-more-button">Читати далі</a>
        `;
        fragment.appendChild(postElement);

        const carouselTrack = postElement.querySelector(`#carouselTrackList-${post.id}`);
        const carouselContainer = carouselTrack.parentElement;

        if (post.images && post.images.length > 0) {
            carouselContainer.classList.toggle('static-images', post.images.length <= 2);
            
            // For carousels, duplicate images for a smooth continuous loop effect with CSS.
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

    // Show or hide the "Load More" button based on whether there are more posts to display.
    if (loadMoreButton) {
        loadMoreButton.style.display = currentIndex >= allPosts.length ? 'none' : 'block';
    }
}

function displaySinglePost() {
    if (!singlePostContainer) return;

    // UPDATED: Determine the post ID from the URL path, e.g., ".../posts/post1.html" -> "post1"
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

    // --- REMOVED: DYNAMIC META TAG GENERATION ---
    // This entire section has been removed. The meta tags are now "baked in" to the HTML
    // by the `build.js` script before deployment. This ensures that social media crawlers
    // can see them immediately, fixing the sharing preview issue.

    // Create the post element to display the content.
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

        // For carousels, duplicate images for a smooth continuous loop effect with CSS.
        const imagesToDisplay = post.images.length > 2 ? [...post.images, ...post.images] : post.images;
        
        imagesToDisplay.forEach(imageSrc => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            // Adjust image path to be relative to the `posts` sub-directory.
            carouselItem.innerHTML = `<img src="${imageSrc.replace('../../', '../../')}" alt="${post.title} image">`;
            carouselTrack.appendChild(carouselItem);
        });
    } else {
        carouselContainer.style.display = 'none';
    }
}

// Add event listener for the "Load More" button if it exists.
if (loadMoreButton) {
    loadMoreButton.addEventListener('click', displayPostsList);
}

// Initial call to fetch posts when the script loads.
fetchPosts();