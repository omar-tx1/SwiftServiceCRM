import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  Send, 
  FileCheck,
  Trash2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Quotes() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Quotes & Estimates</h1>
          <p className="text-slate-500">Manage leads and send estimates quickly.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="h-4 w-4" /> New Quote
        </Button>
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
          <QuoteCard 
            id="#Q-2024-001"
            client="Alice Freeman"
            date="Today, 10:30 AM"
            items={["1/4 Truck Load", "Mattress Disposal"]}
            total="$275.00"
            status="Draft"
          />
          <QuoteCard 
            id="#Q-2024-002"
            client="Commercial Renovation Inc."
            date="Yesterday"
            items={["Full Truck Load x2", "Heavy Debris Surcharge"]}
            total="$1,450.00"
            status="Sent"
          />
          <QuoteCard 
            id="#Q-2024-003"
            client="Bob Smith"
            date="Nov 24, 2025"
            items={["1/2 Truck Load", "Appliance Removal"]}
            total="$450.00"
            status="Accepted"
          />
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
                    <button key={tier.label} className="flex flex-col items-center justify-center p-2 border rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <div className="h-8 w-12 bg-slate-200 rounded-sm mb-2 relative overflow-hidden">
                        {/* Mock visualization of fullness */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all" 
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
                  {["Mattress ($25)", "Appliance ($35)", "Tires ($10/ea)", "Upstairs Labor ($50)"].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" id={`check-${item}`} />
                      <label htmlFor={`check-${item}`} className="text-sm text-slate-700 font-medium cursor-pointer select-none">{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-end border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Estimated Total</p>
                  <p className="text-3xl font-heading font-bold text-slate-900">$0.00</p>
                </div>
                <Button size="sm" className="bg-slate-900 text-white">
                  Create Draft
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuoteCard({ id, client, date, items, total, status }: any) {
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
              <h3 className="font-bold text-lg text-slate-900">{client}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
                {status}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{id} • {date}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </Button>
        </div>

        <div className="space-y-1 mb-4">
          {items.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {item}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="font-heading font-bold text-xl text-slate-900">{total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-slate-600">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="h-3.5 w-3.5 mr-1" /> Send SMS
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
