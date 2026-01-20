import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatContainer } from "@/components/chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-center">
            <span className="text-2xl">🇫🇷</span> French Tutor
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Practice your French conversation skills
          </p>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ChatContainer />
        </CardContent>
      </Card>
    </main>
  );
}
