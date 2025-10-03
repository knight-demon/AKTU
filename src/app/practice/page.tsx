import PracticeQuestions from '@/components/practice-questions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PracticePage() {
  return (
    <div className="p-4 md:p-6">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl md:text-4xl">Practice Questions</CardTitle>
          <CardDescription>
            Test your knowledge with some tricky questions. Select a topic to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PracticeQuestions />
        </CardContent>
      </Card>
    </div>
  );
}
