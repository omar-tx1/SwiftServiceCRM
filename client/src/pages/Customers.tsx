import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin,
  Sparkles,
  MessageSquare,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock Data
const INITIAL_CUSTOMERS = [
  {
    id: "C-001",
    name: "Alice Freeman",
    email: "alice.f@example.com",
    phone: "(555) 123-4567",
    address: "452 Pine Street, Springfield",
    type: "Residential",
    tags: ["Repeat", "VIP"],
    lastService: "Nov 15, 2024",
    totalSpent: "$1,250",
    notes: "Gate code is 1234. Dog is friendly."
  },
  {
    id: "C-002",
    name: "Grandview Apartments",
    email: "manager@grandview.com",
    phone: "(555) 987-6543",
    address: "1000 Hilltop Dr, Springfield",
    type: "Commercial",
    tags: ["Contract", "Net-30"],
    lastService: "Oct 02, 2024",
    totalSpent: "$4,500",
    notes: "Call ahead to reserve elevator."
  },
  {
    id: "C-003",
    name: "Bob Smith",
    email: "bob.smith@gmail.com",
    phone: "(555) 555-5555",
    address: "882 Oak Lane, Riverside",
    type: "Residential",
    tags: [],
    lastService: "N/A",
    totalSpent: "$0",
    notes: "New lead from Facebook."
  }
];

export default function Customers() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiOpen, setAiOpen] = useState(false);

  // AI Simulation State
  const [aiInput, setAiInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleAiProcess = () => {
    if (!aiInput.trim()) return;
    
    setIsProcessing(true);
    
    // SIMULATE AI PARSING DELAY
    setTimeout(() => {
      setIsProcessing(false);
      
      // Mock parsing logic (In a real app, this would call an LLM API)
      // We'll just extract what looks like a phone number and name for the demo
      // or provide a "perfect" mock response for the demo effect.
      
      const mockParsed = {
        name: "James Wilson", // In real app, extracted from text
        phone: aiInput.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "(555) 000-0000",
        email: aiInput.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || "james@example.com",
        address: "774 Sunset Blvd, Westside",
        notes: "Extracted from conversation: " + aiInput,
        type: "Residential"
      };
      
      setParsedData(mockParsed);
    }, 1500);
  };

  const handleSaveParsedCustomer = () => {
    if (parsedData) {
      const newCustomer = {
        id: `C-00${customers.length + 1}`,
        ...parsedData,
        tags: ["AI Added"],
        lastService: "N/A",
        totalSpent: "$0"
      };
      setCustomers([newCustomer, ...customers]);
      setAiOpen(false);
      setParsedData(null);
      setAiInput("");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage your client book and CRM details.</p>
        </div>
        <div className="flex gap-3">
          {/* AI Quick Add Trigger */}
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

          <Sheet>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(555) 000-0000" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Address & Type</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Springfield" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input id="zip" placeholder="62704" />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="type">Customer Type</Label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea id="notes" placeholder="Gate codes, dog names, special instructions..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" placeholder="VIP, Repeat, Lead..." />
                  </div>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full">Save Customer</Button>
                </SheetClose>
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
                 <UsersIcon className="h-8 w-8 text-slate-300" />
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
                        {customer.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-5 font-normal bg-slate-100 text-slate-500">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {customer.phone}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {customer.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-8 pl-16 md:pl-0 mt-2 md:mt-0">
                    <div className="text-left md:text-right">
                       <p className="text-xs text-slate-400 uppercase font-medium">Lifetime Value</p>
                       <p className="font-heading font-bold text-lg text-slate-900">{customer.totalSpent}</p>
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

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
