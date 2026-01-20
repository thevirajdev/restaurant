import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your restaurant settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Restaurant Name</Label>
              <Input defaultValue="Aurelia" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input defaultValue="+91 98765 43210" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="contact@aurelia.com" />
            </div>
            <div>
              <Label>Address</Label>
              <Input defaultValue="123 Fine Dining Street, Mumbai" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Delivery Fee (₹)</Label>
              <Input type="number" defaultValue="50" />
            </div>
            <div>
              <Label>Free Delivery Above (₹)</Label>
              <Input type="number" defaultValue="500" />
            </div>
            <div>
              <Label>Tax Rate (%)</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Razorpay Key ID</Label>
              <Input type="password" value="••••••••••" disabled />
              <p className="text-xs text-muted-foreground mt-1">
                Managed via environment secrets
              </p>
            </div>
            <div>
              <Label>Razorpay Secret</Label>
              <Input type="password" value="••••••••••" disabled />
              <p className="text-xs text-muted-foreground mt-1">
                Managed via environment secrets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
