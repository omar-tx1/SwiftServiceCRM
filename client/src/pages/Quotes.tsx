import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  Send, 
  FileCheck,
  Trash2,
  Loader2,
  Eye
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Quote, InsertQuote } from "@shared/schema";

export default function Quotes() {
  const [newQuoteOpen, setNewQuoteOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<"1/8" | "1/4" | "1/2" | "Full" | null>(null);
  const [selectedSurcharges, setSelectedSurcharges] = useState<string[]>([]);
  const [viewQuoteOpen, setViewQuoteOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [newQuote, setNewQuote] = useState<Partial<InsertQuote>>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    items: [],
    total: "0.00",
    status: "Draft",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (quote: InsertQuote) => {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create quote");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({ title: "Success", description: "Quote created successfully" });
      setNewQuoteOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: number) => {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete quote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({ title: "Success", description: "Quote deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendSmsMutation = useMutation({
    mutationFn: async (data: { quoteId: number; phone: string; message: string }) => {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to send SMS");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "SMS sent successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const volumePrices: Record<string, number> = {
    "1/8": 125,
    "1/4": 250,
    "1/2": 450,
    "Full": 800,
  };

  const surcharges: Record<string, number> = {
    "Mattress": 25,
    "Appliance": 35,
    "Tires": 10,
    "Upstairs Labor": 50,
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedVolume) {
      total += volumePrices[selectedVolume];
    }
    selectedSurcharges.forEach(surcharge => {
      total += surcharges[surcharge] || 0;
    });
    return total.toFixed(2);
  };

  const resetForm = () => {
    setSelectedVolume(null);
    setSelectedSurcharges([]);
    setNewQuote({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      items: [],
      total: "0.00",
      status: "Draft",
    });
  };

  const handleCreateQuote = () => {
    if (!newQuote.customerName) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return;
    }

    const items = [];
    if (selectedVolume) {
      items.push(`${selectedVolume} Truck Load`);
    }
    selectedSurcharges.forEach(surcharge => {
      items.push(`${surcharge} Surcharge`);
    });

    if (items.length === 0) {
      toast({ title: "Error", description: "Please select at least one item", variant: "destructive" });
      return;
    }

    const total = calculateTotal();

    createQuoteMutation.mutate({
      customerName: newQuote.customerName,
      customerEmail: newQuote.customerEmail || undefined,
      customerPhone: newQuote.customerPhone || undefined,
      items,
      total,
      status: "Draft",
      validUntil: null,
      customerId: null,
    } as InsertQuote);
  };

  const handleSendSms = (quote: Quote) => {
    if (!quote.customerPhone) {
      toast({ title: "Error", description: "No phone number on file", variant: "destructive" });
      return;
    }

    const message = `Hi ${quote.customerName}, here's your estimate: ${quote.items.join(", ")} - Total: $${parseFloat(quote.total).toFixed(2)}. Reply to confirm.`;
    sendSmsMutation.mutate({
      quoteId: quote.id,
      phone: quote.customerPhone,
      message,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Quotes & Estimates</h1>
          <p className="text-slate-500">Manage leads and send estimates quickly.</p>
        </div>
        <Dialog open={newQuoteOpen} onOpenChange={setNewQuoteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Plus className="h-4 w-4" /> New Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
              <DialogDescription>
                Build a quick estimate for your customer.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 uppercase text-sm">Customer Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Customer Name *</Label>
                  <Input 
                    id="customer-name" 
                    placeholder="John Doe" 
                    value={newQuote.customerName || ""} 
                    onChange={(e) => setNewQuote({...newQuote, customerName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input 
                      id="customer-email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={newQuote.customerEmail || ""} 
                      onChange={(e) => setNewQuote({...newQuote, customerEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone</Label>
                    <Input 
                      id="customer-phone" 
                      type="tel" 
                      placeholder="(555) 000-0000" 
                      value={newQuote.customerPhone || ""} 
                      onChange={(e) => setNewQuote({...newQuote, customerPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 uppercase text-sm">Estimated Volume</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "1/8", price: "$125" },
                    { label: "1/4", price: "$250" },
                    { label: "1/2", price: "$450" },
                    { label: "Full", price: "$800" },
                  ].map((tier) => (
                    <button 
                      key={tier.label} 
                      onClick={() => setSelectedVolume(tier.label as any)}
                      className={`flex flex-col items-center justify-center p-3 border rounded-md transition-all ${selectedVolume === tier.label ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500 hover:bg-blue-50 border-slate-200'}`}
                    >
                      <div className="h-8 w-12 bg-slate-200 rounded-sm mb-2 relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-500" 
                          style={{ 
                            height: tier.label === "Full" ? '100%' : 
                                    tier.label === "1/2" ? '50%' : 
                                    tier.label === "1/4" ? '25%' : '12.5%' 
                          }}
                        />
                      </div>
                      <span className="font-bold text-sm text-slate-900">{tier.label}</span>
                      <span className="text-xs text-slate-500">{tier.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 uppercase text-sm">Surcharges & Extras</h3>
                <div className="space-y-2">
                  {Object.entries(surcharges).map(([label, price]) => (
                    <div key={label} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`surcharge-${label}`} 
                        checked={selectedSurcharges.includes(label)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSurcharges([...selectedSurcharges, label]);
                          } else {
                            setSelectedSurcharges(selectedSurcharges.filter(s => s !== label));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <label htmlFor={`surcharge-${label}`} className="text-sm text-slate-700 font-medium cursor-pointer select-none">
                        {label} (${price})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-end border border-blue-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Estimated Total</p>
                  <p className="text-3xl font-heading font-bold text-slate-900">${calculateTotal()}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNewQuoteOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateQuote} 
                disabled={createQuoteMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {createQuoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Create Quote
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search quotes..." className="pl-9 bg-white" />
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotes List */}
        <div className="lg:col-span-2 space-y-4">
          {quotes.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <FileCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No quotes yet</h3>
                <p className="text-slate-500 text-sm mt-1">Create your first quote to get started.</p>
              </CardContent>
            </Card>
          ) : (
            quotes.map((quote) => (
              <QuoteCard 
                key={quote.id}
                quote={quote}
                onView={() => {
                  setSelectedQuote(quote);
                  setViewQuoteOpen(true);
                }}
                onDelete={() => deleteQuoteMutation.mutate(quote.id)}
                onSendSms={() => handleSendSms(quote)}
              />
            ))
          )}
        </div>

        {/* Quick Quote Builder */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm sticky top-6">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="font-heading text-xl">Quick Calculator</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Visual Load Selector */}
              <div className="space-y-3">
                <Label>Estimated Volume</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "1/8", price: "$125" },
                    { label: "1/4", price: "$250" },
                    { label: "1/2", price: "$450" },
                    { label: "Full", price: "$800" },
                  ].map((tier) => (
                    <button 
                      key={tier.label} 
                      onClick={() => setSelectedVolume(tier.label as any)}
                      className={`flex flex-col items-center justify-center p-2 border rounded-md transition-all ${selectedVolume === tier.label ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500 hover:bg-blue-50 border-slate-200'}`}
                    >
                      <div className="h-8 w-12 bg-slate-200 rounded-sm mb-2 relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-500" 
                          style={{ 
                            height: tier.label === "Full" ? '100%' : 
                                    tier.label === "1/2" ? '50%' : 
                                    tier.label === "1/4" ? '25%' : '12.5%' 
                          }}
                        />
                      </div>
                      <span className="font-bold text-sm text-slate-900">{tier.label}</span>
                      <span className="text-xs text-slate-500">{tier.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Surcharges / Extras</Label>
                <div className="space-y-2">
                  {Object.entries(surcharges).map(([label, price]) => (
                    <div key={label} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`check-${label}`} 
                        checked={selectedSurcharges.includes(label)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSurcharges([...selectedSurcharges, label]);
                          } else {
                            setSelectedSurcharges(selectedSurcharges.filter(s => s !== label));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <label htmlFor={`check-${label}`} className="text-sm text-slate-700 font-medium cursor-pointer select-none">{label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-3 border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Estimated Total</p>
                  <p className="text-3xl font-heading font-bold text-slate-900">${calculateTotal()}</p>
                </div>
                <Button size="sm" className="bg-slate-900 text-white w-full" onClick={handleCreateQuote}>
                  Create Draft
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={viewQuoteOpen} onOpenChange={setViewQuoteOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Customer</p>
                  <p className="text-sm font-medium">{selectedQuote.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                  <p className="text-sm font-medium">{selectedQuote.status}</p>
                </div>
              </div>
              
              {selectedQuote.customerEmail && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Email</p>
                  <p className="text-sm">{selectedQuote.customerEmail}</p>
                </div>
              )}
              
              {selectedQuote.customerPhone && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Phone</p>
                  <p className="text-sm">{selectedQuote.customerPhone}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Items</p>
                <ul className="space-y-1">
                  {selectedQuote.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                <p className="text-2xl font-heading font-bold text-slate-900">${parseFloat(selectedQuote.total).toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuoteCard({ quote, onView, onDelete, onSendSms }: any) {
  const statusStyles: any = {
    "Draft": "bg-slate-100 text-slate-600",
    "Sent": "bg-blue-100 text-blue-700",
    "Accepted": "bg-green-100 text-green-700",
    "Expired": "bg-red-100 text-red-700",
  };

  return (
    <Card className="hover:border-blue-300 transition-colors border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-900">{quote.customerName}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[quote.status]}`}>
                {quote.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">#Q-{quote.id} • {new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSendSms}>
                <Send className="h-4 w-4 mr-2" /> Send SMS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1 mb-4">
          {quote.items.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {item}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="font-heading font-bold text-xl text-slate-900">${parseFloat(quote.total).toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
