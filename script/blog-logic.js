// Remove the DOMContentLoaded wrapper.
// This script will now execute immediately when the browser encounters its <script> tag.
// Since it's placed just before </body> in index.html, all required DOM elements will be present.

    const blogPostsContainer = document.getElementById('blogPostsContainer');
    const loadMoreButton = document.getElementById('loadMorePosts');
    let allPosts = [];
    let postsPerPage = 5; // Number of posts to show initially and on "Load More"
    let currentIndex = 0;

    // Function to fetch blog posts from JSON
    async function fetchPosts() {
        try {
            const response = await fetch('../../data/blog/posts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPosts = await response.json();
            // Sort posts by date in descending order (newest first)
            allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            displayPosts();
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            blogPostsContainer.innerHTML = '<p>Не вдалося завантажити дописи. Спробуйте пізніше.</p>';
            loadMoreButton.style.display = 'none'; // Hide button on error
        }
    }

    // Function to display posts
    function displayPosts() {
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

            // Populate carousel track for this post
            const carouselTrack = postElement.querySelector(`#carouselTrack-${post.id}`);
            if (carouselTrack && post.images && post.images.length > 0) {
                // Duplicate images for infinite scroll effect
                const allCarouselImages = [...post.images, ...post.images];
                allCarouselImages.forEach(imageSrc => {
                    const carouselItem = document.createElement('div');
                    carouselItem.classList.add('carousel-item');
                    carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
                    carouselTrack.appendChild(carouselItem);
                });
            } else if (carouselTrack) {
                 // If no images, remove the carousel container
                 carouselTrack.parentElement.style.display = 'none';
            }
        });

        blogPostsContainer.appendChild(fragment);
        currentIndex += postsToLoad.length;

        // Hide load more button if no more posts
        if (currentIndex >= allPosts.length) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block'; // Ensure it's visible if there are more
        }
    }

    // Load More button event listener
    loadMoreButton.addEventListener('click', displayPosts);

    // Initial fetch and display
    fetchPosts();