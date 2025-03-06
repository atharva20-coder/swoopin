// components/generics-template.tsx
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';

interface Button {
  type: 'web_url' | 'postback';
  title: string;
  payload?: string;
}

interface GenericTemplateProps {
  onTemplateToggle: (checked: boolean) => void;
  onTemplateCreated: () => void;
  hasTemplates: boolean;
  automationId: string;
}

export const GenericTemplate = ({ 
  onTemplateToggle, 
  onTemplateCreated, 
  hasTemplates, 
  automationId 
}: GenericTemplateProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [template, setTemplate] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    defaultAction: '',
    buttons: [] as Button[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${automationId}`);
        const data = await response.json();
        
        if (response.ok && data.template) {
          setTemplate(data.template);
          onTemplateCreated();
        } else if (!hasTemplates) {
          toast({
            title: "No Template Found",
            description: "Create Generic Template from the Drawer",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };

    fetchTemplate();
  }, [automationId, hasTemplates, onTemplateCreated, toast]);

  const isValid = template.title.length > 0 && 
                 template.imageUrl.length > 0 &&
                 template.buttons.length > 0 &&
                 template.buttons.every(button => 
                   button.title.length > 0 &&
                   (button.type === 'web_url' ? 
                     button.payload?.startsWith('http') : 
                     Boolean(button.payload))
                 );

  const handleFieldChange = (field: keyof typeof template, value: string) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleButtonChange = (index: number, field: keyof Button, value: string) => {
    const newButtons = [...template.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setTemplate(prev => ({ ...prev, buttons: newButtons }));
  };

  const addButton = () => {
    if (template.buttons.length >= 3) {
      toast({
        title: "Maximum Buttons Reached",
        description: "You can only add up to 3 buttons",
        variant: "destructive"
      });
      return;
    }
    setTemplate(prev => ({
      ...prev,
      buttons: [...prev.buttons, {
        type: 'web_url',
        title: '',
        payload: ''
      }]
    }));
  };

  const handleCreateTemplate = async () => {
    if (!isValid) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title, image URL, and at least one valid button",
        variant: "destructive"
      });
      return;
    }
  
    setIsSaving(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          automationId,
          template: {
            ...template,
            buttons: template.buttons.map(btn => ({
              ...btn,
              title: btn.title.substring(0, 20)
            }))
          }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save template');

      toast({ title: "Success", description: "Template saved successfully" });
      onTemplateCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Switch 
          checked={hasTemplates && isValid}
          onCheckedChange={onTemplateToggle}
          disabled={!isValid}
        />
        <span className="text-sm">Use Facebook Generic Template</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={template.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none bg-white text-black"
          placeholder="Enter title (80 characters max)"
          maxLength={80}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
        <input
          type="text"
          value={template.subtitle}
          onChange={(e) => handleFieldChange('subtitle', e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none bg-white text-black"
          placeholder="Enter subtitle (80 characters max)"
          maxLength={80}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
        <input
          type="url"
          value={template.imageUrl}
          onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none bg-white text-black"
          placeholder="Enter image URL"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Action URL (Optional)</label>
        <input
          type="url"
          value={template.defaultAction}
          onChange={(e) => handleFieldChange('defaultAction', e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none bg-white text-black"
          placeholder="Enter default action URL"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Buttons (Max 3) *</label>
        <div className="space-y-3 max-h-[200px] min-h-[60px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100">
          {template.buttons.map((button, btnIndex) => (
            <div key={btnIndex} className="flex flex-col gap-2 w-full">
              <select
                className="w-full p-2 border border-gray-200 rounded-md !bg-white !text-black focus:outline-none"
                value={button.type}
                onChange={(e) => handleButtonChange(btnIndex, 'type', e.target.value)}
              >
                <option value="web_url">Web URL</option>
                <option value="postback">Postback</option>
              </select>
              <input
                type="text"
                value={button.title}
                onChange={(e) => handleButtonChange(btnIndex, 'title', e.target.value)}
                className="w-full flex-1 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white !text-black"
                placeholder="Button title (20 chars max)"
                maxLength={20}
              />
              <input
                type="text"
                value={button.payload || ''}
                onChange={(e) => handleButtonChange(btnIndex, 'payload', e.target.value)}
                className="w-full flex-1 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white !text-black"
                placeholder={button.type === 'web_url' ? 'URL (starts with http)' : 'Payload'}
              />
            </div>
          ))}
          <button
            className="w-full p-2 border rounded-md transition-colors hover:bg-[#768ADD]/10 hover:text-[#768ADD]/90"
            style={{ borderColor: '#768ADD', color: '#768ADD' }}
            onClick={addButton}
            disabled={template.buttons.length >= 3}
          >
            + Add Button
          </button>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex-1 p-2 rounded-md transition-colors border border-[#768ADD] text-[#768ADD] hover:bg-[#768ADD]/10"
          disabled={!template.imageUrl}
        >
          Preview Template
        </button>
        <button
          onClick={handleCreateTemplate}
          disabled={isSaving || !isValid}
          className={`flex-1 p-2 rounded-md transition-all duration-200 ${
            hasTemplates ? 'bg-green-500 hover:bg-green-600' : 'bg-[#768ADD] hover:bg-[#6677cc]'
          } text-white flex items-center justify-center gap-2`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : hasTemplates ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Template Saved!
            </>
          ) : (
            'Create Template'
          )}
        </button>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-white p-0 overflow-hidden max-w-sm rounded-lg shadow-lg">
          <div className="flex flex-col">
            {template.imageUrl ? (
              <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                <Image 
                  src={template.imageUrl}
                  alt={template.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <div className="text-gray-400 text-center p-4">
                  <p className="text-sm">Preview your template</p>
                  <p className="text-xs mt-1">Add an image URL to see it here</p>
                </div>
              </div>
            )}
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-xl text-gray-900">
                {template.title || 'Template Title'}
              </h3>
              {template.subtitle && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {template.subtitle}
                </p>
              )}
              <div className="space-y-2 pt-3">
                {template.buttons.length > 0 ? (
                  template.buttons.map((button, index) => (
                    <button
                      key={index}
                      className="w-full p-3 text-center border-2 rounded-lg text-[#768ADD] border-[#768ADD] hover:bg-[#768ADD]/10 transition-all duration-200 font-medium text-sm"
                    >
                      {button.title || 'Button Text'}
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    <p>Add buttons to see them here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};