import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Reservation {
  id: string;
  user_id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  date?: string | null;
  time?: string | null;
  party_size?: number | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

export default function AdminReservations() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [profilesByUser, setProfilesByUser] = useState<Record<string, any>>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch base reservations first
      const { data: base, error } = await (supabase as any)
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Failed to load reservations:', error);
        setReservations([]);
        setLoading(false);
        return;
      }

      setReservations((base as any) || []);

      // Fetch profiles separately to avoid RLS join problems
      const userIds: string[] = Array.from(new Set(((base as any) || [])
        .map((r: any) => r.user_id)
        .filter(Boolean))) as string[];
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name, phone, email')
          .in('user_id', userIds as readonly string[]);
        const map: Record<string, any> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p; });
        setProfilesByUser(map);
      } else {
        setProfilesByUser({});
      }

      setLoading(false);
    };

    fetchData();

    // Subscribe to realtime changes so admin list updates automatically
    const channel = supabase
      .channel('admin-reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

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
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6" /> Reservations
        </h1>
        <p className="text-muted-foreground">Manage table reservations</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reservations found
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((r) => {
                  const prof = r.user_id ? profilesByUser[r.user_id] : null;
                  const customer = r.name || prof?.full_name || 'Guest';
                  const contact = r.phone || prof?.phone || r.email || prof?.email || '-';
                  const date = r.date ? new Date(r.date).toLocaleDateString('en-IN') : '-';
                  const time = r.time || '-';
                  const created = r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '-';
                  const onUpdateStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'pending') => {
                    try {
                      setActionLoadingId(id);
                      const { error } = await (supabase as any)
                        .from('reservations')
                        .update({ status })
                        .eq('id', id);
                      if (error) console.error('Failed to update status', error);
                    } finally {
                      setActionLoadingId(null);
                    }
                  };

                  const onDelete = async (id: string) => {
                    try {
                      setActionLoadingId(id);
                      const { error } = await (supabase as any)
                        .from('reservations')
                        .delete()
                        .eq('id', id);
                      if (error) console.error('Failed to delete reservation', error);
                    } finally {
                      setActionLoadingId(null);
                    }
                  };

                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{customer}</TableCell>
                      <TableCell>{contact}</TableCell>
                      <TableCell>{date}</TableCell>
                      <TableCell>{time}</TableCell>
                      <TableCell>{r.party_size ?? '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          r.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                          r.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {r.status ? String(r.status).toUpperCase() : 'PENDING'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{r.notes || '-'}</TableCell>
                      <TableCell>{created}</TableCell>
                      <TableCell className="space-x-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" disabled={actionLoadingId === r.id} onClick={() => onUpdateStatus(r.id, 'confirmed')}>Confirm</Button>
                        <Button size="sm" variant="outline" disabled={actionLoadingId === r.id} onClick={() => onUpdateStatus(r.id, 'cancelled')}>Cancel</Button>
                        <Button size="sm" variant="destructive" disabled={actionLoadingId === r.id} onClick={() => onDelete(r.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
