'use client';

import { useState, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getImportantQuestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { BrainCircuit, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type Question = {
  question: string;
  explanation: string;
};

const topics = [
    { value: 'Data Structures', label: 'Data Structures' },
    { value: 'Operating Systems', label: 'Operating Systems' },
    { value: 'Database Management System', label: 'DBMS' },
    { value: 'Computer Networks', label: 'Computer Networks' },
    { value: 'Theory of Automata and Formal Languages', label: 'TAFL' },
    { value: 'Compiler Design', label: 'Compiler Design' },
];

export default function PracticeQuestions() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'No topic selected',
        description: 'Please select a topic first.',
      });
      return;
    }

    setQuestions([]);
    startTransition(async () => {
      const result = await getImportantQuestions(topic);
      if (result.success && result.questions) {
        setQuestions(result.questions);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to generate questions',
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Select onValueChange={setTopic} value={topic}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerate} disabled={isPending || !topic} className="w-full sm:w-auto">
          {isPending ? 'Generating...' : 'Generate Questions'}
        </Button>
      </div>

      <div className="mt-6">
        {isPending && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!isPending && questions.length === 0 && (
             <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <BrainCircuit className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Ready to challenge yourself?</h3>
                <p className="mt-1 text-sm">Select a topic and generate some tricky questions to test your skills.</p>
            </div>
        )}

        {questions.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-primary"><Lightbulb className="h-5 w-5" /></span>
                    <span className="flex-1 font-medium">{q.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm dark:prose-invert max-w-none"
                    components={{
                      pre: ({node, ...props}) => <pre className="rounded-md bg-muted p-2 my-2 overflow-x-auto" {...props} />,
                      code({node, className, children, ...props}) {
                        return (
                           <code className={cn('bg-muted px-1 rounded-sm', className)} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {q.explanation}
                  </ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
