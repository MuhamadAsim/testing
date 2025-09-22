import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Code,
  FileText,
  Search,
  BookOpen,
  Calculator,
  Palette,
  MessageCircle,
  Zap
} from 'lucide-react';

interface PromptShortcut {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon: React.ReactNode;
}

interface PromptShortcutsProps {
  onSelectPrompt: (prompt: string) => void;
  compact?: boolean;
}

const PromptShortcuts = ({ onSelectPrompt, compact = false }: PromptShortcutsProps) => {
  const shortcuts: PromptShortcut[] = [
    {
      id: '1',
      title: 'Explain Code',
      prompt: 'Can you explain this code and how it works?',
      category: 'Development',
      icon: <Code className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'Summarize Text',
      prompt: 'Please provide a concise summary of the following text:',
      category: 'Writing',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'Brainstorm Ideas',
      prompt: 'Help me brainstorm creative ideas for:',
      category: 'Creative',
      icon: <Lightbulb className="h-4 w-4" />
    },
    {
      id: '4',
      title: 'Research Topic',
      prompt: 'I need comprehensive information about:',
      category: 'Research',
      icon: <Search className="h-4 w-4" />
    },
    {
      id: '5',
      title: 'Learn Concept',
      prompt: 'Can you teach me about this topic in simple terms:',
      category: 'Education',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: '6',
      title: 'Solve Problem',
      prompt: 'Help me solve this problem step by step:',
      category: 'Problem Solving',
      icon: <Calculator className="h-4 w-4" />
    },
    {
      id: '7',
      title: 'Design Review',
      prompt: 'Please review this design and provide feedback:',
      category: 'Design',
      icon: <Palette className="h-4 w-4" />
    },
    {
      id: '8',
      title: 'Quick Question',
      prompt: 'I have a quick question about:',
      category: 'General',
      icon: <MessageCircle className="h-4 w-4" />
    }
  ];

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  const getCategoryColor = (category: string) => {
    const colors = {
      'Development': 'bg-blue-500/10 text-blue-600 border-blue-200',
      'Writing': 'bg-green-500/10 text-green-600 border-green-200',
      'Creative': 'bg-purple-500/10 text-purple-600 border-purple-200',
      'Research': 'bg-orange-500/10 text-orange-600 border-orange-200',
      'Education': 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
      'Problem Solving': 'bg-red-500/10 text-red-600 border-red-200',
      'Design': 'bg-pink-500/10 text-pink-600 border-pink-200',
      'General': 'bg-gray-500/10 text-gray-600 border-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Quick Prompts</h4>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {shortcuts.slice(0, 4).map((shortcut) => (
            <Button
              key={shortcut.id}
              variant="outline"
              size="sm"
              className="text-xs h-auto p-2 flex-wrap max-w-40"
              onClick={() => onSelectPrompt(shortcut.prompt)}
            >
              {shortcut.title}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <span>Quick Prompts</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category} className="space-y-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getCategoryColor(category)}`}
                >
                  {category}
                </Badge>
                
                <div className="grid grid-cols-1 gap-2">
                  {shortcuts
                    .filter(shortcut => shortcut.category === category)
                    .map(shortcut => (
                      <Button
                        key={shortcut.id}
                        variant="outline"
                        className="justify-start h-auto p-3 text-left transition-smooth hover:bg-primary/5 hover:border-primary/30"
                        onClick={() => onSelectPrompt(shortcut.prompt)}
                      >
                        <div className="flex items-start space-x-2 w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            {shortcut.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{shortcut.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {shortcut.prompt}
                            </p>
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PromptShortcuts;