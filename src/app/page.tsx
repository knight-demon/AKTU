import ChatInterface from '@/components/chat-interface';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-4xl flex-1 flex flex-col shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl md:text-4xl">AKTU Dost</CardTitle>
          <CardDescription>
            Aapka dost for all things AKTU! Pucho kuch bhi...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
