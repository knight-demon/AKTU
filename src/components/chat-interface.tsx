'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Send, User, Loader2, Paperclip, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

import { getPersonalizedResponse } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';

const formSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
  photoDataUri: z.string().optional(),
});

type Message = {
  role: 'user' | 'bot';
  content: string;
  image?: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Hey there! Main hoon AKTU Dost. Exams, syllabus, ya koi bhi doubt... just ask! You can also upload an image of your question.',
    }
  ]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      photoDataUri: undefined,
    },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector('div');
      if (scrollableView) {
        scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('photoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    form.setValue('photoDataUri', undefined);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const userMessage: Message = { role: 'user', content: values.message, image: imagePreview || undefined };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }


    startTransition(async () => {
      const result = await getPersonalizedResponse(values.message, values.photoDataUri);
      if (result.success && result.response) {
        const botMessage: Message = { role: 'bot', content: result.response };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: result.error,
        });
        setMessages((prev) => prev.slice(0, -1)); // Remove user message if API fails
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'bot' && (
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-lg p-3 text-sm shadow-md',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                )}
              >
                {message.image && (
                  <div className="mb-2">
                    <Image src={message.image} alt="User upload" width={200} height={200} className="rounded-md" />
                  </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-sm dark:prose-invert max-w-none"
                  components={{
                    h1: ({node, ...props}) => <h1 className="font-headline" {...props} />,
                    h2: ({node, ...props}) => <h2 className="font-headline" {...props} />,
                    h3: ({node, ...props}) => <h3 className="font-headline" {...props} />,
                    pre: ({node, ...props}) => <pre className="rounded-md bg-muted p-2 my-2 overflow-x-auto" {...props} />,
                    code({node, className, children, ...props}) {
                      return (
                        <code className={cn('bg-muted px-1 rounded-sm', className)} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >{message.content}</ReactMarkdown>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isPending && (
             <div className="flex items-start gap-4 justify-start">
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-lg p-3 shadow-md bg-card">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            {imagePreview && (
              <div className="relative w-24 h-24 mb-2">
                <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md" />
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 bg-gray-800/50 hover:bg-gray-800/75" onClick={removeImage}>
                  <X className="h-4 w-4 text-white"/>
                </Button>
              </div>
            )}
            <div className="flex items-start gap-4">
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach file</span>
              </Button>
              <FormField
                control={form.control}
                name="photoDataUri"
                render={({ field }) => (
                  <FormItem className='hidden'>
                    <FormControl>
                       <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </FormControl>
                  </FormItem>
                )}
               />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="Ask me anything about your syllabus..."
                        className="resize-none"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                        rows={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
