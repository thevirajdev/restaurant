import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discounted_price: number | null;
  category_id: string | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_signature: boolean;
  is_available: boolean;
  image_url: string | null;
}

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discounted_price: '',
    category_id: '',
    is_vegetarian: false,
    is_spicy: false,
    is_signature: false,
    is_available: true,
    image_url: '',
  });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
    
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const startEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const saveEditCategory = async () => {
    if (!editingCategoryId) return;
    const name = editingCategoryName.trim();
    if (!name) { toast.error('Name required'); return; }
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', editingCategoryId);
    if (error) {
      toast.error('Failed to update category');
    } else {
      setCategories(prev => prev.map(c => c.id === editingCategoryId ? { ...c, name } : c));
      setEditingCategoryId(null);
      setEditingCategoryName('');
      toast.success('Category updated');
    }
  };

  const deleteCategory = async (id: string) => {
    // Block deletion if any products exist in this category
    const { count, error: countErr } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);
    if (countErr) {
      toast.error('Unable to verify category usage');
      return;
    }
    if ((count || 0) > 0) {
      toast.error('Cannot delete: category has products');
      return;
    }
    if (!confirm('Delete this empty category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete category');
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (formData.category_id === id) setFormData(prev => ({ ...prev, category_id: '' }));
      toast.success('Category deleted');
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Enter category name');
      return;
    }
    setCreatingCategory(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      // Update local list and select the new category
      setCategories((prev) => [...prev, data]);
      setFormData((prev) => ({ ...prev, category_id: data.id }));
      setNewCategoryName('');
      setShowNewCategory(false);
      toast.success('Category created');
    } catch (e) {
      toast.error('Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
      category_id: formData.category_id || null,
      is_vegetarian: formData.is_vegetarian,
      is_spicy: formData.is_spicy,
      is_signature: formData.is_signature,
      is_available: formData.is_available,
      image_url: formData.image_url || null,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('menu_items')
        .update(payload)
        .eq('id', editingItem.id);
      
      if (error) {
        toast.error('Failed to update item');
      } else {
        toast.success('Item updated!');
      }
    } else {
      const { error } = await supabase.from('menu_items').insert(payload);
      
      if (error) {
        toast.error('Failed to add item');
      } else {
        toast.success('Item added!');
      }
    }

    setDialogOpen(false);
    resetForm();
    fetchItems();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      discounted_price: item.discounted_price?.toString() || '',
      category_id: item.category_id || '',
      is_vegetarian: item.is_vegetarian,
      is_spicy: item.is_spicy,
      is_signature: item.is_signature,
      is_available: item.is_available,
      image_url: item.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete item');
    } else {
      toast.success('Item deleted!');
      fetchItems();
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discounted_price: '',
      category_id: '',
      is_vegetarian: false,
      is_spicy: false,
      is_signature: false,
      is_available: true,
      image_url: '',
    });
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Manage your menu items</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price *</Label>
                  <Input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <Label>Discounted Price</Label>
                  <Input 
                    type="number" 
                    value={formData.discounted_price} 
                    onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <div className="flex gap-2 items-start">
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" onClick={() => setShowNewCategory((v) => !v)}>
                    New
                  </Button>
                  <Dialog open={categoryManagerOpen} onOpenChange={setCategoryManagerOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">Manage</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Manage Categories</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {categories.length === 0 && (
                          <div className="text-sm text-muted-foreground">No categories yet.</div>
                        )}
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center gap-2">
                            {editingCategoryId === cat.id ? (
                              <>
                                <Input value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} />
                                <Button size="sm" onClick={saveEditCategory}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                              </>
                            ) : (
                              <>
                                <div className="flex-1 px-2 py-2 rounded border bg-background">{cat.name}</div>
                                <Button size="sm" variant="outline" onClick={() => startEditCategory(cat)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteCategory(cat.id)}>Delete</Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {showNewCategory && (
                  <div className="mt-2 flex gap-2">
                    <Input 
                      placeholder="New category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button type="button" onClick={handleCreateCategory} disabled={creatingCategory}>
                      {creatingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label>Image URL</Label>
                <Input 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_vegetarian}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: checked })}
                  />
                  <Label>Vegetarian</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_spicy}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_spicy: checked })}
                  />
                  <Label>Spicy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_signature}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_signature: checked })}
                  />
                  <Label>Signature</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label>Available</Label>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search items..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No menu items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.discounted_price ? (
                        <span>
                          <span className="line-through text-muted-foreground mr-2">₹{item.price}</span>
                          ₹{item.discounted_price}
                        </span>
                      ) : (
                        `₹${item.price}`
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.is_available 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.is_vegetarian && (
                          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-xs">Veg</span>
                        )}
                        {item.is_spicy && (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-xs">Spicy</span>
                        )}
                        {item.is_signature && (
                          <span className="px-2 py-0.5 rounded bg-gold/20 text-gold text-xs">Signature</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
