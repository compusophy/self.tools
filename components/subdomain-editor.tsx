'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Edit3, Sparkles, Save, Palette, Eye } from 'lucide-react';
import { updateSubdomainContentAction, improveContentWithAIAction } from '@/app/actions';
import { type SubdomainData } from '@/lib/subdomains';

interface SubdomainEditorProps {
  subdomain: string;
  data: SubdomainData;
}

const themes = [
  { id: 'default', name: 'Default', colors: 'bg-gradient-to-b from-blue-50 to-white' },
  { id: 'dark', name: 'Dark', colors: 'bg-gradient-to-b from-gray-900 to-gray-800' },
  { id: 'colorful', name: 'Colorful', colors: 'bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50' },
  { id: 'minimal', name: 'Minimal', colors: 'bg-white' },
] as const;

export function SubdomainEditor({ subdomain, data }: SubdomainEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAILoading, setIsAILoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: data.content.title,
    description: data.content.description,
    body: data.content.body,
    theme: data.content.theme,
  });

  const [aiPrompt, setAiPrompt] = useState('');

  const handleSave = () => {
    const form = new FormData();
    form.append('subdomain', subdomain);
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('body', formData.body);
    form.append('theme', formData.theme);

    startTransition(async () => {
      await updateSubdomainContentAction({}, form);
      setIsOpen(false);
      window.location.reload(); // Refresh to show changes
    });
  };

  const handleAIImprove = async (contentType: 'title' | 'description' | 'body') => {
    setIsAILoading(true);
    const content = formData[contentType];
    
    const form = new FormData();
    form.append('subdomain', subdomain);
    form.append('content', content);
    form.append('prompt', aiPrompt || `Improve this ${contentType} to be more engaging and professional`);

    try {
      const result = await improveContentWithAIAction({}, form);
      if (result.success && result.improvedContent) {
        setFormData(prev => ({
          ...prev,
          [contentType]: result.improvedContent
        }));
        setAiPrompt('');
      }
    } catch (error) {
      console.error('AI improvement failed:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown to HTML conversion for preview
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 shadow-lg"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Page
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {subdomain} Page</DialogTitle>
          <DialogDescription>
            Customize your subdomain page content with AI assistance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selector */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.theme === theme.id ? 'border-blue-500' : 'border-gray-200'
                  } ${theme.colors}`}
                >
                  <Palette className="w-4 h-4 mb-1 mx-auto" />
                  <div className="text-xs font-medium">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={previewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
          </div>

          {previewMode ? (
            /* Preview Mode */
            <div className="space-y-4 p-6 border rounded-lg bg-gray-50">
              <h1 className="text-3xl font-bold">{formData.title}</h1>
              <p className="text-lg text-gray-600">{formData.description}</p>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.body) }}
              />
            </div>
          ) : (
            /* Edit Mode */
            <>
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Improve
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <Label>Custom prompt (optional)</Label>
                        <Textarea
                          placeholder="e.g., Make it more catchy and professional"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={2}
                        />
                        <Button
                          onClick={() => handleAIImprove('title')}
                          disabled={isAILoading}
                          size="sm"
                          className="w-full"
                        >
                          {isAILoading ? 'Improving...' : 'Improve Title'}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Page title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Improve
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <Label>Custom prompt (optional)</Label>
                        <Textarea
                          placeholder="e.g., Make it more compelling and SEO-friendly"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={2}
                        />
                        <Button
                          onClick={() => handleAIImprove('description')}
                          disabled={isAILoading}
                          size="sm"
                          className="w-full"
                        >
                          {isAILoading ? 'Improving...' : 'Improve Description'}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Page description"
                  rows={2}
                />
              </div>

              {/* Body Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Content (Markdown supported)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Improve
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <Label>Custom prompt (optional)</Label>
                        <Textarea
                          placeholder="e.g., Add more sections and make it more engaging"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={3}
                        />
                        <Button
                          onClick={() => handleAIImprove('body')}
                          disabled={isAILoading}
                          size="sm"
                          className="w-full"
                        >
                          {isAILoading ? 'Improving...' : 'Improve Content'}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Write your content here (Markdown supported)"
                  rows={12}
                />
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              <Save className="w-4 h-4 mr-2" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 