import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin,
  Sparkles,
  User,
  Bot,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Customer, InsertCustomer } from "@shared/schema";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<InsertCustomer>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    type: "Residential",
    tags: [],
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customer: InsertCustomer) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer added successfully" });
      setNewCustomerOpen(false);
      setNewCustomer({ name: "", email: "", phone: "", address: "", city: "", zipCode: "", type: "Residential", tags: [], notes: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAiProcess = () => {
    if (!aiInput.trim()) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      const mockParsed = {
        name: "James Wilson",
        phone: aiInput.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "(555) 000-0000",
        email: aiInput.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || "james@example.com",
        address: "774 Sunset Blvd",
        city: "Westside",
        zipCode: "90210",
        notes: "Extracted from conversation: " + aiInput,
        type: "Residential",
        tags: ["AI Added"]
      };
      
      setParsedData(mockParsed);
    }, 1500);
  };

  const handleSaveParsedCustomer = () => {
    if (parsedData) {
      createCustomerMutation.mutate(parsedData);
      setAiOpen(false);
      setParsedData(null);
      setAiInput("");
    }
  };

  const handleSaveNewCustomer = () => {
    if (!newCustomer.name) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return;
    }
    createCustomerMutation.mutate(newCustomer as InsertCustomer);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage your client book and CRM details.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={aiOpen} onOpenChange={setAiOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md shadow-indigo-200">
                <Sparkles className="h-4 w-4" /> AI Quick Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  AI Assistant
                </DialogTitle>
                <DialogDescription>
                  Paste a conversation, email, or just type details. The AI will extract the customer info for you.
                </DialogDescription>
              </DialogHeader>
              
              {!parsedData ? (
                <div className="space-y-4 py-4">
                  <Textarea 
                    placeholder="Example: 'Met a new client named James Wilson today. He lives at 774 Sunset Blvd. Phone is 555-0192. Needs a garage cleanout next week.'"
                    className="min-h-[150px] text-base resize-none p-4"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAiProcess} 
                      disabled={!aiInput.trim() || isProcessing}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          Process with AI <Sparkles className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-800 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>I've extracted the following details. Does this look right?</span>
                  </div>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value={parsedData.name} onChange={(e) => setParsedData({...parsedData, name: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input id="phone" value={parsedData.phone} onChange={(e) => setParsedData({...parsedData, phone: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">Address</Label>
                      <Input id="address" value={parsedData.address} onChange={(e) => setParsedData({...parsedData, address: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
                      <Textarea id="notes" value={parsedData.notes} onChange={(e) => setParsedData({...parsedData, notes: e.target.value})} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setParsedData(null)}>Try Again</Button>
                    <Button onClick={handleSaveParsedCustomer} className="bg-green-600 hover:bg-green-700">Confirm & Add</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Sheet open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" /> New Customer
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>New Customer Profile</SheetTitle>
                <SheetDescription>
                  Create a new record in your address book.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-slate-100 text-slate-400 text-xl">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Upload Photo</Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Contact Info</h3>
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Full Name *</Label>
                    <Input 
                      id="new-name" 
                      placeholder="John Doe" 
                      value={newCustomer.name || ""} 
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input 
                      id="new-email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={newCustomer.email || ""} 
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-phone">Phone Number</Label>
                    <Input 
                      id="new-phone" 
                      type="tel" 
                      placeholder="(555) 000-0000" 
                      value={newCustomer.phone || ""} 
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Address & Type</h3>
                  <div className="space-y-2">
                    <Label htmlFor="new-address">Street Address</Label>
                    <Input 
                      id="new-address" 
                      placeholder="123 Main St" 
                      value={newCustomer.address || ""} 
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-city">City</Label>
                      <Input 
                        id="new-city" 
                        placeholder="Springfield" 
                        value={newCustomer.city || ""} 
                        onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-zip">Zip Code</Label>
                      <Input 
                        id="new-zip" 
                        placeholder="62704" 
                        value={newCustomer.zipCode || ""} 
                        onChange={(e) => setNewCustomer({...newCustomer, zipCode: e.target.value})}
                      />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="new-type">Customer Type</Label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newCustomer.type}
                      onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})}
                    >
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Realtor / Broker</option>
                      <option>Contractor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Additional Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="new-notes">Internal Notes</Label>
                    <Textarea 
                      id="new-notes" 
                      placeholder="Gate codes, dog names, special instructions..." 
                      value={newCustomer.notes || ""} 
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button 
                  onClick={handleSaveNewCustomer} 
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                  disabled={createCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Customer"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name, email, or address..." 
            className="pl-9 bg-slate-50 border-slate-200" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-lg bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {filteredCustomers.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center px-4">
               <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <User className="h-8 w-8 text-slate-300" />
               </div>
               <h3 className="text-lg font-medium text-slate-900">No customers found</h3>
               <p className="text-slate-500 max-w-sm mt-1">Try adjusting your search or add a new customer to your book.</p>
             </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border border-slate-200">
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-slate-900">{customer.name}</h3>
                        {customer.tags && customer.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-5 font-normal bg-slate-100 text-slate-500">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1 text-sm text-slate-500">
                        {customer.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                      
                      {customer.address && (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {customer.address}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-8 pl-16 md:pl-0 mt-2 md:mt-0">
                    <div className="text-left md:text-right">
                       <p className="text-xs text-slate-400 uppercase font-medium">Lifetime Value</p>
                       <p className="font-heading font-bold text-lg text-slate-900">${customer.totalSpent || "0.00"}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-slate-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
