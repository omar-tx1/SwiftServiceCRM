import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  CreditCard, 
  Users, 
  Bell, 
  Truck, 
  Save,
  Mail,
  Phone,
  MapPin,
  Trash2
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your business details, pricing, and preferences.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1 h-auto flex flex-wrap justify-start w-full sm:w-auto">
          <TabsTrigger value="company" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 gap-2 px-4 py-2">
            <Building2 className="h-4 w-4" /> Company
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 gap-2 px-4 py-2">
            <CreditCard className="h-4 w-4" /> Pricing & Services
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 gap-2 px-4 py-2">
            <Users className="h-4 w-4" /> Team
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 gap-2 px-4 py-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>This information will appear on your quotes and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" defaultValue="HaulMate Junk Removal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / EIN</Label>
                  <Input id="tax-id" placeholder="XX-XXXXXXX" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="address" className="pl-9" defaultValue="123 Haul St, Springfield, IL" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="email" className="pl-9" defaultValue="contact@haulmate.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="phone" className="pl-9" defaultValue="(555) 123-4567" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Upload your logo to customize your documents.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="h-24 w-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                <Truck className="h-8 w-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="bg-white">Upload Logo</Button>
                <p className="text-xs text-slate-500">Recommended: PNG or JPG, at least 400x400px</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Standard Load Pricing</CardTitle>
              <CardDescription>Set your base rates for standard junk removal volumes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <PricingInput label="Min. Load" defaultValue="99.00" />
                <PricingInput label="1/4 Truck" defaultValue="250.00" />
                <PricingInput label="1/2 Truck" defaultValue="450.00" />
                <PricingInput label="Full Truck" defaultValue="800.00" />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Surcharges & Extras</h3>
                <div className="space-y-3">
                  <SurchargeRow label="Mattress" price="25.00" />
                  <SurchargeRow label="Appliance (Large)" price="35.00" />
                  <SurchargeRow label="Tires (per tire)" price="10.00" />
                  <SurchargeRow label="Labor (per hour/person)" price="50.00" />
                </div>
                <Button variant="outline" size="sm" className="gap-1 mt-2">
                   <Truck className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Quote Terms</CardTitle>
              <CardDescription>Default text included on all estimates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[100px]" 
                defaultValue="Quote valid for 30 days. Price includes labor, transport, and disposal fees. Hazardous materials not accepted."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage access and roles for your crew.</CardDescription>
              </div>
              <Button size="sm" variant="outline">Invite Member</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  { name: "John Doe", email: "john@haulmate.com", role: "Owner", status: "Active" },
                  { name: "Mike Smith", email: "mike@haulmate.com", role: "Crew Lead", status: "Active" },
                  { name: "Sarah Jones", email: "sarah@haulmate.com", role: "Driver", status: "Invited" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-700">{member.role}</p>
                        <p className="text-xs text-slate-400">{member.status}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         {/* Notifications Tab */}
         <TabsContent value="notifications" className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Automated Messages</CardTitle>
              <CardDescription>Configure text and email updates for your customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationSwitch 
                title="New Lead Auto-Reply" 
                desc="Send a text immediately when a new lead comes in."
                defaultChecked={true}
              />
              <Separator />
              <NotificationSwitch 
                title="Booking Confirmation" 
                desc="Email customer when a job is scheduled."
                defaultChecked={true}
              />
              <Separator />
              <NotificationSwitch 
                title="On The Way Alert" 
                desc="Allow crew to send 'On the way' texts with one tap."
                defaultChecked={true}
              />
              <Separator />
              <NotificationSwitch 
                title="Review Request" 
                desc="Automatically ask for a Google Review after job completion."
                defaultChecked={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PricingInput({ label, defaultValue }: { label: string, defaultValue: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
        <Input className="pl-7" defaultValue={defaultValue} />
      </div>
    </div>
  );
}

function SurchargeRow({ label, price }: { label: string, price: string }) {
  return (
    <div className="flex gap-4 items-center">
      <Input className="flex-1" defaultValue={label} />
      <div className="relative w-32">
        <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
        <Input className="pl-7" defaultValue={price} />
      </div>
      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function NotificationSwitch({ title, desc, defaultChecked }: { title: string, desc: string, defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-base text-slate-900">{title}</Label>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
