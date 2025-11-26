import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  Trash2,
  Sparkles,
  Upload,
  Loader2
} from "lucide-react";

export default function Settings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoGenerationOpen, setLogoGenerationOpen] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [useUploadedAsInspiration, setUseUploadedAsInspiration] = useState(false);
  
  const { toast } = useToast();

  const generateLogoMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate logo");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setLogoUrl(data.logoUrl);
      toast({ title: "Success", description: "Logo generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const generateLogoWithInspiration = useMutation({
    mutationFn: async (data: { prompt: string; imageBase64: string }) => {
      const response = await fetch("/api/generate-logo-with-inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate logo");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setLogoUrl(data.logoUrl);
      toast({ title: "Success", description: "Logo generated with inspiration successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateLogo = () => {
    if (!logoPrompt.trim()) {
      toast({ title: "Error", description: "Please enter a logo description", variant: "destructive" });
      return;
    }
    generateLogoMutation.mutate(logoPrompt);
  };

  const handleGenerateWithInspiration = () => {
    if (!logoPrompt.trim()) {
      toast({ title: "Error", description: "Please enter a logo description", variant: "destructive" });
      return;
    }
    if (!uploadedImageUrl) {
      toast({ title: "Error", description: "Please upload an image for inspiration", variant: "destructive" });
      return;
    }
    generateLogoWithInspiration.mutate({
      prompt: logoPrompt,
      imageBase64: uploadedImageUrl.split(",")[1], // Remove data:image/...;base64, prefix
    });
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
        toast({ title: "Success", description: "Logo uploaded successfully" });
      };
      reader.readAsDataURL(file);
    }
  };

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
              <CardDescription>Upload or generate a logo for your business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Truck className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex gap-2 flex-wrap">
                    <label>
                      <Button variant="outline" className="bg-white cursor-pointer" asChild>
                        <span><Upload className="h-4 w-4 mr-2" /> Upload Logo</span>
                      </Button>
                      <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                    </label>
                    <Dialog open={logoGenerationOpen} onOpenChange={setLogoGenerationOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                          <Sparkles className="h-4 w-4" /> Generate with AI
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            AI Logo Generator
                          </DialogTitle>
                          <DialogDescription>
                            Create a custom logo using AI or draw inspiration from an existing logo.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="logo-prompt">Logo Description *</Label>
                            <Textarea
                              id="logo-prompt"
                              placeholder="e.g., A junk removal company logo with a truck and simple, modern design. Use blue and orange colors."
                              className="min-h-[100px]"
                              value={logoPrompt}
                              onChange={(e) => setLogoPrompt(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">Describe the style, elements, and colors you want in your logo.</p>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="use-inspiration"
                                checked={useUploadedAsInspiration}
                                onChange={(e) => setUseUploadedAsInspiration(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300"
                              />
                              <Label htmlFor="use-inspiration" className="cursor-pointer">Use existing logo as inspiration</Label>
                            </div>

                            {useUploadedAsInspiration && (
                              <div className="space-y-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                <p className="text-sm text-slate-700">Upload a logo to use as inspiration:</p>
                                <div className="flex items-center gap-2">
                                  {uploadedImageUrl ? (
                                    <div className="h-16 w-16 rounded border border-indigo-300 overflow-hidden flex-shrink-0">
                                      <img src={uploadedImageUrl} alt="Inspiration" className="h-full w-full object-cover" />
                                    </div>
                                  ) : null}
                                  <label>
                                    <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                      <span><Upload className="h-4 w-4 mr-2" /> Upload Image</span>
                                    </Button>
                                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setLogoGenerationOpen(false)}>Cancel</Button>
                          <Button 
                            onClick={useUploadedAsInspiration ? handleGenerateWithInspiration : handleGenerateLogo}
                            disabled={useUploadedAsInspiration ? generateLogoWithInspiration.isPending : generateLogoMutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            {useUploadedAsInspiration ? generateLogoWithInspiration.isPending : generateLogoMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Logo
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG or WebP. Recommended: 400x400px or larger</p>
                </div>
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
