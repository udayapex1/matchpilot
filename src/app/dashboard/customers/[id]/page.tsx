"use client";

import { useState } from 'react';
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

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Profile...</div>;
  if (!data?.customer) return <div className="p-8 text-center text-red-500">Customer not found</div>;

  const { customer, matches } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{customer.firstName} {customer.lastName}</h1>
          <p className="text-muted-foreground">{customer.age} yrs • {customer.city}, {customer.country} • {customer.designation}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={customer.statusTag === 'Active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            {customer.statusTag}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: 360 Profile */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Biometrics & Education</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
              <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium">{customer.gender}</span></div>
              <div><span className="text-muted-foreground">Height:</span> <span className="font-medium">{customer.height} cm</span></div>
              <div><span className="text-muted-foreground">Date of Birth:</span> <span className="font-medium">{new Date(customer.dob).toLocaleDateString()}</span></div>
              <div><span className="text-muted-foreground">Religion/Caste:</span> <span className="font-medium">{customer.religion} / {customer.caste}</span></div>
              <Separator className="col-span-2 my-2" />
              <div><span className="text-muted-foreground">College:</span> <span className="font-medium">{customer.college}</span></div>
              <div><span className="text-muted-foreground">Degree:</span> <span className="font-medium">{customer.degree}</span></div>
              <div><span className="text-muted-foreground">Languages:</span> <span className="font-medium">{customer.languages}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Career & Lifestyle</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
              <div><span className="text-muted-foreground">Company:</span> <span className="font-medium">{customer.company}</span></div>
              <div><span className="text-muted-foreground">Income:</span> <span className="font-medium">₹{(customer.income / 100000).toFixed(1)} LPA</span></div>
              <Separator className="col-span-2 my-2" />
              <div><span className="text-muted-foreground">Diet:</span> <span className="font-medium">{customer.diet}</span></div>
              <div><span className="text-muted-foreground">Drinking:</span> <span className="font-medium">{customer.drinking}</span></div>
              <div><span className="text-muted-foreground">Smoking:</span> <span className="font-medium">{customer.smoking}</span></div>
              <div><span className="text-muted-foreground">Hobbies:</span> <span className="font-medium">{customer.hobbies}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences & Family</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
              <div><span className="text-muted-foreground">Marital Status:</span> <span className="font-medium">{customer.maritalStatus}</span></div>
              <div><span className="text-muted-foreground">Family Type:</span> <span className="font-medium">{customer.familyType}</span></div>
              <div><span className="text-muted-foreground">Siblings:</span> <span className="font-medium">{customer.siblings}</span></div>
              <div><span className="text-muted-foreground">Manglik:</span> <span className="font-medium">{customer.manglik}</span></div>
              <Separator className="col-span-2 my-2" />
              <div><span className="text-muted-foreground">Wants Kids:</span> <span className="font-medium">{customer.wantKids ? 'Yes' : 'No'}</span></div>
              <div><span className="text-muted-foreground">Open to Relocate:</span> <span className="font-medium">{customer.openToRelocate ? 'Yes' : 'No'}</span></div>
              <div><span className="text-muted-foreground">Open to Pets:</span> <span className="font-medium">{customer.openToPets ? 'Yes' : 'No'}</span></div>
              <div className="col-span-2 mt-2">
                <span className="text-muted-foreground block mb-1">Partner Expectations:</span> 
                <span className="font-medium italic">"{customer.partnerExpectations}"</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interaction Notes & Engine */}
        <div className="space-y-6">
          <Card className="flex flex-col h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle>Interaction Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {customer.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center mt-10">No historical notes.</p>
              ) : (
                customer.notes.map((note: any) => (
                  <div key={note.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-sm relative group">
                    <p>{note.content}</p>
                    <span className="text-[10px] text-muted-foreground mt-2 block">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                    <button 
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
            <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900 rounded-b-xl">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a new note..." 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && noteContent && noteMutation.mutate(noteContent)}
                />
                <Button size="icon" disabled={!noteContent || noteMutation.isPending} onClick={() => noteMutation.mutate(noteContent)}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-rose-200 dark:border-rose-900 shadow-sm bg-rose-50/50 dark:bg-rose-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <HeartHandshake className="h-5 w-5" />
                Suggested Matches Engine
              </CardTitle>
              <CardDescription>Top deterministic heuristic matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches?.map((match: any) => (
                <div key={match.id} className="flex flex-col p-3 rounded-lg bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{match.firstName} {match.lastName}</h4>
                      <p className="text-xs text-muted-foreground">{match.age} yrs • {match.city} • {match.designation}</p>
                    </div>
                    <Badge variant="outline" className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800">
                      {match.score} Pts
                    </Badge>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full mt-2 bg-rose-100 hover:bg-rose-200 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100 dark:hover:bg-rose-900" onClick={() => handleOpenMatch(match)}>
                    <Sparkles className="h-3 w-3 mr-2" />
                    Review Match Compatibility
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={matchModalOpen} onOpenChange={setMatchModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-rose-500" />
              Match Action
            </DialogTitle>
            <DialogDescription>
              Reviewing compatibility for {customer?.firstName} & {selectedMatch?.firstName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Compatibility Explanation
              </h3>
              {generatingAi ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiExplain || "Could not generate explanation."}
                </p>
              )}
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                AI Personalized Executive Pitch
              </h3>
              {generatingAi ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-zinc-100 dark:bg-zinc-950 p-4 rounded border">
                  {aiIntro || "Could not generate pitch."}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchModalOpen(false)}>Cancel</Button>
            <Button onClick={() => sendMatchMutation.mutate()} disabled={sendMatchMutation.isPending || generatingAi}>
              {sendMatchMutation.isPending ? 'Sending...' : 'Send Match'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
