import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDialog, setReplyDialog] = useState<any>(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    // Fetch base reviews first to avoid RLS join issues
    const { data: baseReviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { setReviews([]); setLoading(false); return; }

    const userIds = Array.from(new Set((baseReviews || []).map((r: any) => r.user_id).filter(Boolean)));
    const menuIds = Array.from(new Set((baseReviews || []).map((r: any) => r.menu_item_id).filter(Boolean)));

    let profilesByUser: Record<string, any> = {};
    let menuById: Record<string, any> = {};

    try {
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        (profs || []).forEach((p: any) => { profilesByUser[p.user_id] = p; });
      }
    } catch {}

    try {
      if (menuIds.length > 0) {
        const { data: menus } = await supabase
          .from('menu_items')
          .select('id, name')
          .in('id', menuIds);
        (menus || []).forEach((m: any) => { menuById[m.id] = m; });
      }
    } catch {}

    const merged = (baseReviews || []).map((r: any) => ({
      ...r,
      profiles: profilesByUser[r.user_id] || null,
      menu_items: menuById[r.menu_item_id] || null,
    }));

    setReviews(merged);
    setLoading(false);
  };

  const updateApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: approved })
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update review');
    } else {
      toast.success(approved ? 'Review approved!' : 'Review rejected');
      fetchReviews();
    }
  };

  const submitReply = async () => {
    if (!replyDialog || !reply.trim()) return;
    
    const { error } = await supabase
      .from('reviews')
      .update({ admin_reply: reply })
      .eq('id', replyDialog.id);
    
    if (error) {
      toast.error('Failed to add reply');
    } else {
      toast.success('Reply added!');
      setReplyDialog(null);
      setReply('');
      fetchReviews();
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reviews Management</h1>
        <p className="text-muted-foreground">Moderate and respond to customer reviews</p>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.profiles?.full_name || 'Anonymous'}
                    </TableCell>
                    <TableCell>{review.menu_items?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-gold' : 'text-muted'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{review.comment || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        review.is_approved 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {!review.is_approved && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => updateApproval(review.id, true)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {review.is_approved && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => updateApproval(review.id, false)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setReplyDialog(review); setReply(review.admin_reply || ''); }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">{replyDialog?.comment}</p>
            </div>
            <Textarea 
              placeholder="Write your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
            />
            <Button onClick={submitReply} className="w-full">
              Submit Reply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
