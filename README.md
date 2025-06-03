# 🚀 Subdomain Platform Kit

A powerful Next.js platform for creating and managing custom subdomains with Redis-backed storage and Farcaster frame integration.

## ✨ Features

- **🌐 Dynamic Subdomain Creation** - Instantly create custom subdomains
- **⚡ Redis-Backed Storage** - Fast, scalable content storage
- **🎨 Multiple Themes** - Dark, Light, and Color themes
- **📝 Markdown Support** - Rich content editing with markdown
- **🔧 Simple SDK** - Easy-to-use functions for content management
- **📱 Responsive Design** - Mobile-friendly interface
- **⚙️ In-Place Editing** - Edit button on every subdomain page
- **🟣 Farcaster Integration** - Frame support for Farcaster ecosystem

## 🛠️ Setup & Installation

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Redis/Upstash KV
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token

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

#### `SubdomainSDK.updateContent(subdomain: string, content: Partial<SubdomainContent>, userDeviceId: string)`
Update any part of the subdomain content.

```typescript
await SubdomainSDK.updateContent('myblog', {
  title: 'My New Blog Title',
  description: 'Updated description',
  theme: 'dark'
}, userDeviceId);
```

#### `SubdomainSDK.setTitle(subdomain: string, title: string, userDeviceId: string)`
Quick function to update just the title.

```typescript
await SubdomainSDK.setTitle('myblog', 'Welcome to My Blog', userDeviceId);
```

#### `SubdomainSDK.setDescription(subdomain: string, description: string, userDeviceId: string)`
Update the page description.

```typescript
await SubdomainSDK.setDescription('myblog', 'A blog about web development', userDeviceId);
```

#### `SubdomainSDK.setBody(subdomain: string, body: string, userDeviceId: string)`
Update the main content body (supports Markdown).

```typescript
await SubdomainSDK.setBody('myblog', `
# Welcome to My Blog

This is my awesome blog where I write about:

- Web Development
- Cool Projects
- **Latest Updates**

## Latest Posts

Coming soon!
`, userDeviceId);
```

#### `SubdomainSDK.setTheme(subdomain: string, theme: 'dark' | 'light' | 'color', userDeviceId: string)`
Change the visual theme.

```typescript
await SubdomainSDK.setTheme('myblog', 'dark', userDeviceId);
```

### Server Actions (Form-based)

#### `createSubdomainAction(formData: FormData)`
Create a new subdomain (used in forms).

```typescript
// In a form component
<form action={createSubdomainAction}>
  <input name="subdomain" placeholder="your-subdomain" />
  <input name="deviceId" value={userDeviceId} type="hidden" />
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
form.append('deviceId', userDeviceId);
await updateSubdomainContentAction({}, form);
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
  theme: 'color'
}, userDeviceId);
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

### Chat Application
Developed a real-time chat app with modern features.

## Let's Connect
- [GitHub](https://github.com/johndoe)
- [LinkedIn](https://linkedin.com/in/johndoe)
- [Email](mailto:john@example.com)
  `,
  theme: 'light'
}, userDeviceId);
```

## 🎨 Themes

### Dark Theme
Modern dark gradient with light text, great for developer portfolios and modern sites.

### Light Theme
Clean white background with dark text, perfect for professional and content-focused sites.

### Color Theme
Vibrant gradient background ideal for creative projects and eye-catching landing pages.

## 🔧 Advanced Configuration

### Custom Domain Setup
1. Add your domain to your hosting provider
2. Update the `ROOT_DOMAIN` environment variable
3. Configure DNS to point to your hosting service

### Redis Configuration
The platform uses Upstash Redis for storage. You can also use any Redis-compatible service by updating the connection in `lib/redis.ts`.

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
  createdBy: string; // Device UUID of creator
  content: {
    title: string;
    description: string;
    body: string;
    theme: 'dark' | 'light' | 'color';
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

- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 📧 [Email Support](mailto:support@yourdomain.com)

---

Made with ❤️ using Next.js, Redis, and Farcaster Frames
