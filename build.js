const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
const config = {
    postsDataPath: path.join(__dirname, 'data', 'blog', 'posts.json'),
    templatePath: path.join(__dirname, '/ukr/blog', 'post-template.html'),
    outputDir: path.join(__dirname, '/ukr/blog', ''), // A new directory to store generated post files
    baseUrl: 'https://igcu-castellon-vinaros-torreblanca.com', // Your website's base URL
    defaultImage: '/img/logo.webp' // A default fallback image
};

async function generateBlogPosts() {
    try {
        console.log('Starting blog post generation...');

        // 1. Create the output directory if it doesn't exist
        await fs.mkdir(config.outputDir, { recursive: true });

        // 2. Read the template and the posts data
        const template = await fs.readFile(config.templatePath, 'utf-8');
        const posts = JSON.parse(await fs.readFile(config.postsDataPath, 'utf-8'));

        // 3. Loop through each post and generate its HTML file
        for (const post of posts) {
            let finalHtml = template;

            const postUrl = `${config.baseUrl}/blog/posts/${post.id}.html`;
            const description = post.description || post.content.replace(/<[^>]*>/g, '').substring(0, 160);
            const imageUrl = post.images && post.images.length > 0
                ? new URL(post.images[0].replace('../../', '/'), config.baseUrl).href
                : new URL(config.defaultImage, config.baseUrl).href;

            // 4. Replace all placeholders with actual data
            finalHtml = finalHtml
                .replace(/\{\{postTitle\}\}|<%= postTitle %>/g, post.title)
                .replace(/\{\{metaDescription\}\}|"\{\{ogDescription\}\}"|"\{\{twitterDescription\}\}"/g, `"${description}"`)
                .replace(/\{\{ogImage\}\}|"\{\{twitterImage\}\}"/g, `"${imageUrl}"`)
                .replace(/\{\{ogImageAlt\}\}/g, post.title)
                .replace(/https:\/\/nasha-tserkva\.com\/blog\/\{\{postId\}\}|\{\{postId\}\}/g, `posts/${post.id}.html`)
                .replace(/https:\/\/nasha-tserkva\/(en|es)\/blog\//g, `${config.baseUrl}/$1/blog/posts/`);


            // 5. Save the new, complete HTML file
            const outputFilePath = path.join(config.outputDir, `${post.id}.html`);
            await fs.writeFile(outputFilePath, finalHtml);
            console.log(`Successfully generated: ${outputFilePath}`);
        }

        console.log('Blog post generation complete!');

    } catch (error) {
        console.error('Error during blog post generation:', error);
    }
}

generateBlogPosts();