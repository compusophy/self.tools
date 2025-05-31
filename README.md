# 🚀 Subdomain Platform Kit

A powerful Next.js platform for creating and managing custom subdomains with AI-powered content editing, Redis-backed storage, and a simple SDK for developers.

## ✨ Features

- **🌐 Dynamic Subdomain Creation** - Instantly create custom subdomains
- **🤖 AI-Powered Editing** - Built-in Gemini 1.5 Flash integration for content improvement
- **⚡ Redis-Backed Storage** - Fast, scalable content storage
- **🎨 Multiple Themes** - Default, Dark, Colorful, and Minimal themes
- **📝 Markdown Support** - Rich content editing with markdown
- **🔧 Simple SDK** - Easy-to-use functions for content management
- **📱 Responsive Design** - Mobile-friendly interface
- **⚙️ In-Place Editing** - Edit button on every subdomain page

## 🛠️ Setup & Installation

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Redis/Upstash KV
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token

# Gemini AI (for content improvement)
GEMINI_API_KEY=your_gemini_api_key

# Domain Configuration
ROOT_DOMAIN=yourdomain.com
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
```

### 4. Deploy

This platform works great with Vercel, Netlify, or any Node.js hosting service.

## 📚 SDK Reference

### Core Functions

#### `SubdomainSDK.get(subdomain: string)`
Retrieve complete subdomain data including content and settings.

```typescript
const data = await SubdomainSDK.get('myblog');
console.log(data.content.title); // Page title
console.log(data.content.body);  // Markdown content
```

#### `SubdomainSDK.updateContent(subdomain: string, content: Partial<SubdomainContent>)`
Update any part of the subdomain content.

```typescript
await SubdomainSDK.updateContent('myblog', {
  title: 'My New Blog Title',
  description: 'Updated description',
  theme: 'dark'
});
```

#### `SubdomainSDK.setTitle(subdomain: string, title: string)`
Quick function to update just the title.

```typescript
await SubdomainSDK.setTitle('myblog', 'Welcome to My Blog');
```

#### `SubdomainSDK.setDescription(subdomain: string, description: string)`
Update the page description.

```typescript
await SubdomainSDK.setDescription('myblog', 'A blog about web development');
```

#### `SubdomainSDK.setBody(subdomain: string, body: string)`
Update the main content body (supports Markdown).

```typescript
await SubdomainSDK.setBody('myblog', `
# Welcome to My Blog

This is my awesome blog where I write about:

- Web Development
- AI and Machine Learning
- **Cool Projects**

## Latest Posts

Coming soon!
`);
```

#### `SubdomainSDK.setTheme(subdomain: string, theme: 'default' | 'dark' | 'colorful' | 'minimal')`
Change the visual theme.

```typescript
await SubdomainSDK.setTheme('myblog', 'dark');
```

### Server Actions (Form-based)

#### `createSubdomainAction(formData: FormData)`
Create a new subdomain (used in forms).

```typescript
// In a form component
<form action={createSubdomainAction}>
  <input name="subdomain" placeholder="your-subdomain" />
  <button type="submit">Create</button>
</form>
```

#### `updateSubdomainContentAction(formData: FormData)`
Update content via form submission.

```typescript
const form = new FormData();
form.append('subdomain', 'myblog');
form.append('title', 'New Title');
form.append('body', 'New content');
await updateSubdomainContentAction({}, form);
```

#### `improveContentWithAIAction(formData: FormData)`
Use Gemini 1.5 Flash to improve content.

```typescript
const form = new FormData();
form.append('subdomain', 'myblog');
form.append('content', 'Current content to improve');
form.append('prompt', 'Make it more engaging and professional');
const result = await improveContentWithAIAction({}, form);
```

## 🎯 Quick Start Examples

### Example 1: Create a Simple Landing Page

```typescript
// Create the subdomain
await SubdomainSDK.updateContent('myproject', {
  title: 'My Awesome Project',
  description: 'A revolutionary new app that changes everything',
  body: `
# Welcome to My Project

## What we do
We build amazing things that make life better.

## Features
- **Fast** - Lightning quick performance
- **Secure** - Your data is safe with us
- **Easy** - Simple to use interface

## Get Started
Ready to try it out? [Contact us](mailto:hello@example.com)
  `,
  theme: 'colorful'
});
```

### Example 2: Create a Developer Portfolio

```typescript
await SubdomainSDK.updateContent('johndoe', {
  title: 'John Doe - Full Stack Developer',
  description: 'Experienced developer specializing in React, Node.js, and cloud architecture',
  body: `
# Hi, I'm John! 👋

I'm a **Full Stack Developer** with 5+ years of experience building scalable web applications.

## Skills
- Frontend: React, Next.js, TypeScript
- Backend: Node.js, Python, PostgreSQL
- Cloud: AWS, Vercel, Docker

## Recent Projects

### E-commerce Platform
Built a complete e-commerce solution handling 10k+ daily users.

### AI Chat Application
Developed a real-time chat app with AI integration.

## Let's Connect
- [GitHub](https://github.com/johndoe)
- [LinkedIn](https://linkedin.com/in/johndoe)
- [Email](mailto:john@example.com)
  `,
  theme: 'minimal'
});
```

### Example 3: AI-Powered Content Improvement

```typescript
// Get current content
const currentData = await SubdomainSDK.get('myblog');

// Improve it with AI
const form = new FormData();
form.append('subdomain', 'myblog');
form.append('content', currentData.content.body);
form.append('prompt', 'Make this content more engaging, add emojis, and improve the structure');

const result = await improveContentWithAIAction({}, form);

if (result.success) {
  // Update with improved content
  await SubdomainSDK.setBody('myblog', result.improvedContent);
}
```

## 🎨 Themes

### Default Theme
Clean, professional blue gradient background perfect for business sites.

### Dark Theme
Modern dark gradient with light text, great for developer portfolios.

### Colorful Theme
Vibrant purple-pink-orange gradient ideal for creative projects.

### Minimal Theme
Clean white background with simple typography for content-focused sites.

## 🔧 Advanced Configuration

### Custom Domain Setup
1. Add your domain to your hosting provider
2. Update the `ROOT_DOMAIN` environment variable
3. Configure DNS to point to your hosting service

### Redis Configuration
The platform uses Upstash Redis for storage. You can also use any Redis-compatible service by updating the connection in `lib/redis.ts`.

### AI Configuration
Currently supports Gemini 1.5 Flash. To use a different AI service, modify the `improveContentWithAIAction` function in `app/actions.ts`.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms
The platform works on any Node.js hosting service. Make sure to:
- Set all required environment variables
- Configure your domain properly
- Ensure Redis is accessible

## 📝 API Reference

### Data Types

```typescript
type SubdomainData = {
  createdAt: number;
  content: {
    title: string;
    description: string;
    body: string;
    theme: 'default' | 'dark' | 'colorful' | 'minimal';
    lastModified: number;
  };
  settings: {
    allowEditing: boolean;
    isPublished: boolean;
  };
};
```

### Redis Keys
- `subdomain:{name}` - Stores complete subdomain data
- Keys are automatically sanitized (lowercase, alphanumeric + hyphens only)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

Need help? Here are some resources:

- 📚 [Documentation](https://github.com/your-repo/wiki)
- 💬 [Discord Community](https://discord.gg/your-server)
- 📧 [Email Support](mailto:support@yourdomain.com)
- 🐛 [Report Issues](https://github.com/your-repo/issues)

---

Made with ❤️ using Next.js, Redis, and Gemini AI
