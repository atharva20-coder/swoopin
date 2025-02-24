'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  apiKey: z.string()
    .min(1, 'API key is required')
    .regex(/^sk-(?:proj-)?[A-Za-z0-9_-]{32,}$/, 'API key must start with "sk-" or "sk-proj-" followed by characters')
});

type FormValues = z.infer<typeof formSchema>;

export function OpenAISettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: ''
    }
  });

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/user/openai');
        const data = await response.json();

        if (response.ok && data.apiKey) {
          const maskedKey = data.apiKey.replace(/^(sk-(?:proj-)?[A-Za-z0-9]{4})(.+)([A-Za-z0-9]{4})$/, (_: string, start: string, middle: string, end: string) => {
            const dots = '.'.repeat(middle.length);
            return `${start}${dots}${end}`;
          });
          form.setValue('apiKey', maskedKey);
          setHasApiKey(true);
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
  }, [form]);

  const handleDeleteKey = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/openai', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'API key deleted successfully',
        });
        form.reset();
        setHasApiKey(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete API key',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: values.apiKey })
      });

      const data = await response.json();

      if (response.ok) {
        const maskedKey = values.apiKey.replace(/^(sk-(?:proj-)?[A-Za-z0-9]{4})(.+)([A-Za-z0-9]{4})$/, (_: string, start: string, middle: string, end: string) => {
          const dots = '.'.repeat(middle.length);
          return `${start}${dots}${end}`;
        });
        toast({
          title: 'Success',
          description: `API key saved successfully: ${maskedKey}`,
        });
        form.setValue('apiKey', maskedKey);
        setHasApiKey(true);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update API key',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full container max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white border-2 border-gray-100 rounded-lg p-4 sm:p-10 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">OpenAI API Key</h2>
            <p className="mt-2 text-sm text-gray-600">Your API key should follow this format: <code className="bg-gray-100 px-2 py-1 rounded">sk-abcd...1234</code> or <code className="bg-gray-100 px-2 py-1 rounded">sk-proj-abcd...1234</code></p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="sk-..."
                        className="w-full font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-500">
                      Your API key must start with &apos;sk-&apos; or &apos;sk-proj-&apos; followed by characters
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full sm:w-auto"
                >
                  {isLoading ? 'Saving...' : hasApiKey ? 'Update API Key' : 'Save API Key'}
                </Button>
                {hasApiKey && (
                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteKey}
                    disabled={isLoading}
                    className="sm:w-auto"
                  >
                    Delete Key
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}