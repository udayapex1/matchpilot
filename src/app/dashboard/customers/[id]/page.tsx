"use client";

import { motion } from 'framer-motion';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Send, Sparkles, Trash2, HeartHandshake } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { NumberTicker } from '@/components/ui/number-ticker';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const customerId = params.id as string;
  
  const [noteContent, setNoteContent] = useState('');
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [aiExplain, setAiExplain] = useState('');
  const [aiIntro, setAiIntro] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing profile...');

  useEffect(() => {
    if (!generatingAi) return;
    const messages = [
      'Analyzing profile...',
      'Checking details...',
      'Checking matching percentage...',
      'Checking location...',
      'Evaluating quality...',
      'Generating AI response...'
    ];
    let i = 0;
    setLoadingText(messages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, [generatingAi]);

  const { data, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${customerId}`);
      return res.json();
    }
  });

  const noteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, content }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      setNoteContent('');
      toast.success('Note added');
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      toast.success('Note deleted');
    }
  });

  const sendMatchMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          matchedCustomerId: selectedMatch.id,
          score: selectedMatch.score,
          aiExplanation: aiExplain,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast.success('Match sent successfully!');
      setMatchModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to send match or already exists.');
    }
  });

  const handleOpenMatch = async (match: any) => {
    setSelectedMatch(match);
    setMatchModalOpen(true);
    setAiExplain('');
    setAiIntro('');
    setGeneratingAi(true);

    try {
      const explainRes = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, matchedCustomerId: match.id })
      });
      const explainData = await explainRes.json();
      setAiExplain(explainData.explanation);

      const introRes = await fetch('/api/ai/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, matchedCustomerId: match.id })
      });
      const introData = await introRes.json();
      setAiIntro(introData.intro);
    } catch (e) {
      toast.error('Failed to fetch AI insights');
    } finally {
      setGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-16 mt-8 px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-6 w-16 ml-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[280px] w-full rounded-xl" />
            <Skeleton className="h-[280px] w-full rounded-xl" />
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[220px] w-full rounded-xl" />
            <Skeleton className="h-[420px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  if (!data?.customer) return <div className="p-10 text-center text-red-500">Customer not found</div>;

  const { customer, matches } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto pb-16 px-6 lg:px-8 pt-2"
    >
      {/* Page Header */}
      <div className="flex flex-wrap items-center gap-5 py-2">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {customer.age} yrs • {customer.city}, {customer.country} • {customer.designation}
          </p>
        </div>
        <div className="ml-auto">
          <Badge
            variant={customer.statusTag === 'Active' ? 'default' : 'secondary'}
            className="text-sm px-4 py-1.5"
          >
            {customer.statusTag}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: 360 Profile */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Personal Biometrics Card */}
            <Card>
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-base font-semibold">Personal Biometrics & Education</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Gender</span>
                  <span className="font-medium">{customer.gender}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Height</span>
                  <span className="font-medium">{customer.height} cm</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Date of Birth</span>
                  <span className="font-medium">{new Date(customer.dob).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Religion / Caste</span>
                  <span className="font-medium">{customer.religion} / {customer.caste}</span>
                </div>
                <Separator className="col-span-2 my-1" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">College</span>
                  <span className="font-medium">{customer.college}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Degree</span>
                  <span className="font-medium">{customer.degree}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Languages</span>
                  <span className="font-medium">{customer.languages}</span>
                </div>
              </CardContent>
            </Card>

            {/* Career & Lifestyle Card */}
            <Card>
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-base font-semibold">Career & Lifestyle</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Company</span>
                  <span className="font-medium">{customer.company}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Income</span>
                  <span className="font-medium">₹{(customer.income / 100000).toFixed(1)} LPA</span>
                </div>
                <Separator className="col-span-2 my-1" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Diet</span>
                  <span className="font-medium">{customer.diet}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Drinking</span>
                  <span className="font-medium">{customer.drinking}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Smoking</span>
                  <span className="font-medium">{customer.smoking}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Hobbies</span>
                  <span className="font-medium">{customer.hobbies}</span>
                </div>
              </CardContent>
            </Card>

            {/* Preferences & Family Card */}
            <Card>
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-base font-semibold">Preferences & Family</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Marital Status</span>
                  <span className="font-medium">{customer.maritalStatus}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Family Type</span>
                  <span className="font-medium">{customer.familyType}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Siblings</span>
                  <span className="font-medium">{customer.siblings}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Manglik</span>
                  <span className="font-medium">{customer.manglik}</span>
                </div>
                <Separator className="col-span-2 my-1" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Wants Kids</span>
                  <span className="font-medium">{customer.wantKids ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Open to Relocate</span>
                  <span className="font-medium">{customer.openToRelocate ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Open to Pets</span>
                  <span className="font-medium">{customer.openToPets ? 'Yes' : 'No'}</span>
                </div>
                <div className="col-span-2 mt-2 flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Partner Expectations</span>
                  <span className="font-medium italic leading-relaxed">"{customer.partnerExpectations}"</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Notes & Match Engine */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Interaction Notes Card */}
          <Card className="flex flex-col h-[420px]">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-base font-semibold">Interaction Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 px-5">
              {customer.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center mt-12">No historical notes.</p>
              ) : (
                customer.notes.map((note: any) => (
                  <div key={note.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 py-3 text-sm relative group">
                    <p className="leading-relaxed pr-6">{note.content}</p>
                    <span className="text-[10px] text-muted-foreground mt-2 block">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                    <button 
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
            <div className="px-5 py-4 border-t bg-zinc-50 dark:bg-zinc-900 rounded-b-xl">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a new note..." 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && noteContent && noteMutation.mutate(noteContent)}
                  className="text-sm"
                />
                <Button size="icon" disabled={!noteContent || noteMutation.isPending} onClick={() => noteMutation.mutate(noteContent)}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Suggested Matches Card */}
          <Card className="border-rose-200 dark:border-rose-900 shadow-sm bg-rose-50/50 dark:bg-rose-950/20">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-base">
                <HeartHandshake className="h-5 w-5 shrink-0" />
                Suggested Matches Engine
              </CardTitle>
              <CardDescription className="mt-0.5">Top deterministic heuristic matches</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {matches?.map((match: any, index: number) => (
                <motion.div 
                  key={match.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col p-4 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm leading-snug truncate">
                        {match.firstName} {match.lastName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {match.age} yrs • {match.city} • {match.designation}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 px-2.5 py-0.5"
                    >
                      <NumberTicker value={match.score} /> Pts
                    </Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-3 bg-rose-100 hover:bg-rose-200 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100 dark:hover:bg-rose-900"
                    onClick={() => handleOpenMatch(match)}
                  >
                    <Sparkles className="h-3 w-3 mr-2" />
                    Review Match Compatibility
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Match Dialog */}
      <Dialog open={matchModalOpen} onOpenChange={setMatchModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[80vw] w-[95vw] sm:w-[80vw] p-0 overflow-hidden">
          <DialogHeader className="px-7 pt-7 pb-4">
            <DialogTitle className="text-2xl flex items-center gap-2.5">
              <HeartHandshake className="h-6 w-6 text-rose-500 shrink-0" />
              Match Action
            </DialogTitle>
            <DialogDescription className="mt-1">
              Reviewing compatibility for {customer?.firstName} & {selectedMatch?.firstName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-7 pb-2 max-h-[60vh] overflow-y-auto">
            {/* AI Compatibility Explanation */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
                AI Compatibility Explanation
              </h3>
              {generatingAi ? (
                <div className="py-3">
                  <motion.div 
                    key={loadingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-mono text-muted-foreground"
                  >
                    {">"} {loadingText}
                  </motion.div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiExplain || "Could not generate explanation."}
                </p>
              )}
            </div>

            {/* AI Executive Pitch */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
                AI Personalized Executive Pitch
              </h3>
              {generatingAi ? (
                <div className="py-3">
                  <motion.div 
                    key={loadingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-mono text-muted-foreground"
                  >
                    {">"} {loadingText}
                  </motion.div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-zinc-100 dark:bg-zinc-950 px-5 py-4 rounded-lg border">
                  {aiIntro || "Could not generate pitch."}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-7 py-5 border-t bg-zinc-50/80 dark:bg-zinc-900/50 gap-3">
            <Button variant="outline" onClick={() => setMatchModalOpen(false)}>Cancel</Button>
            <Button onClick={() => sendMatchMutation.mutate()} disabled={sendMatchMutation.isPending || generatingAi}>
              {sendMatchMutation.isPending ? 'Sending...' : 'Send Match'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}