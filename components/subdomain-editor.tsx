'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Edit3, Sparkles, Save, Palette } from 'lucide-react';
import { updateSubdomainContentAction, improveContentWithAIAction } from '@/app/actions';
import { type SubdomainData } from '@/lib/subdomains';

interface SubdomainEditorProps {
  subdomain: string;
  data: SubdomainData;
}

const themes = [
  { id: 'dark', name: 'DARK', colors: 'bg-black text-white' },
  { id: 'light', name: 'LIGHT', colors: 'bg-white text-black border border-gray-300' },
  { id: 'color', name: 'COLOR', colors: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' },
] as const;

export function SubdomainEditor({ subdomain, data }: SubdomainEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAILoading, setIsAILoading] = useState(false);
  
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-screen flex flex-col p-0 gap-0 !border-0">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 border-b border">
          <DialogTitle className="text-xl font-bold">Edit {subdomain}.self.tools</DialogTitle>
        </div>

        {/* Scrollable Content Area with proper margins */}
        <div className="flex-1 overflow-y-auto scrollbar-hide border-l border-r">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
              {/* Theme Selector */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                      className={`relative p-4 transition-all duration-200 ${theme.colors} ${
                        formData.theme === theme.id 
                          ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' 
                          : 'hover:scale-102 hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                      }`}
                    >
                      {/* Selected indicator */}
                      {formData.theme === theme.id && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white w-5 h-5 flex items-center justify-center text-xs font-medium">
                          ✓
                        </div>
                      )}
                      
                      <div className="text-sm font-medium tracking-wide py-1">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-8">
                {/* Title */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="text-base font-medium">Title</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Improve
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <Label>Custom prompt (optional)</Label>
                          <Textarea
                            placeholder="e.g., Make it more catchy and professional"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={2}
                            className="rounded-none"
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
                    className="text-base rounded-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-base font-medium">Description</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Improve
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <Label>Custom prompt (optional)</Label>
                          <Textarea
                            placeholder="e.g., Make it more compelling and SEO-friendly"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={2}
                            className="rounded-none"
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
                    className="text-base rounded-none"
                  />
                </div>

                {/* Body Content */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body" className="text-base font-medium">Content (Markdown supported)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Improve
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <Label>Custom prompt (optional)</Label>
                          <Textarea
                            placeholder="e.g., Add more sections and make it more engaging"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={3}
                            className="rounded-none"
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
                    className="text-base rounded-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Footer - matches subdomain page exactly */}
        <div className="py-4 border-t border flex items-center justify-center">
          <Button onClick={handleSave} disabled={isPending} size="sm" variant="outline" className="shadow-lg">
            <Save className="w-4 h-4 mr-2" />
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 