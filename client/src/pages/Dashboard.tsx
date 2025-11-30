import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  Briefcase, 
  FileText, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  MapPin,
  MoreHorizontal,
  Users,
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { insertTransactionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import truckImg from "@assets/generated_images/clean_isometric_junk_removal_truck_illustration.png";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Supplies",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: any) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to log expense");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Success", description: "Expense logged successfully" });
      setExpenseDialogOpen(false);
      setNewExpense({ description: "", amount: "", category: "Supplies" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogExpense = () => {
    if (!newExpense.description || !newExpense.amount) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    createTransactionMutation.mutate({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      type: "expense",
      category: newExpense.category,
      jobId: null,
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-slate-900">Good Morning, John</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/schedule">
             <Button variant="outline" className="border-slate-300 bg-white">View Calendar</Button>
           </Link>
           <Link href="/quotes">
             <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none">Create Quote</Button>
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenue Today" 
          value="$1,250" 
          icon={DollarSign} 
          trend="+12% from yesterday"
          trendUp={true}
        />
        <StatCard 
          title="Active Jobs" 
          value={jobs.length.toString()} 
          icon={Briefcase} 
          trend={`${jobs.filter(j => j.status === "Pending").length} pending`}
          trendUp={true}
        />
        <StatCard 
          title="Open Quotes" 
          value="5" 
          icon={FileText} 
          trend="2 expiring soon"
          trendUp={false}
        />
        <StatCard 
          title="Avg Job Time" 
          value="1h 45m" 
          icon={Clock} 
          trend="-15m vs last week"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-bold text-slate-800">Today's Schedule</h3>
            <Link href="/schedule">
              <a className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View Full Schedule <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No jobs scheduled yet</p>
                </CardContent>
              </Card>
            ) : (
              jobs.slice(0, 3).map((job) => (
                <JobCard 
                  key={job.id}
                  time={new Date(job.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  client={job.customerName} 
                  address={job.address}
                  type={job.type}
                  status={job.status}
                  price={job.price ? `$${job.price}` : "TBD"}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <Button 
                onClick={() => setLocation("/quotes")}
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none"
              >
                <FileText className="mr-2 h-4 w-4" /> Draft New Quote
              </Button>
              <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none">
                    <Clock className="mr-2 h-4 w-4" /> Log Expenses
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Log Expense</DialogTitle>
                    <DialogDescription>
                      Record a business expense or cost.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description *</Label>
                      <Input 
                        id="desc"
                        placeholder="Fuel, supplies, equipment..." 
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amt">Amount *</Label>
                      <Input 
                        id="amt"
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat">Category</Label>
                      <select 
                        id="cat"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                        className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option>Supplies</option>
                        <option>Fuel</option>
                        <option>Equipment</option>
                        <option>Labor</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handleLogExpense}
                      disabled={createTransactionMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {createTransactionMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Logging...
                        </>
                      ) : (
                        "Log Expense"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                onClick={() => toast({ title: "Feature Coming Soon", description: "Crew member management coming in the next update" })}
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none"
              >
                <Users className="mr-2 h-4 w-4" /> Add Crew Member
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
             <CardHeader>
              <CardTitle className="font-heading text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[1,2,3].map((i) => (
                  <div key={i} className="p-4 flex gap-3 items-start hover:bg-slate-50 transition-colors">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Job Completed: #102{i}</p>
                      <p className="text-xs text-slate-500">Payment received via Credit Card</p>
                      <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: any) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="font-heading text-3xl font-bold text-slate-900 mt-2">{value}</h3>
          </div>
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className={`text-xs font-medium mt-4 ${trendUp ? 'text-green-600' : 'text-slate-500'}`}>
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}

function JobCard({ time, client, address, type, status, price }: any) {
  const statusColors: any = {
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    "Scheduled": "bg-slate-100 text-slate-700 border-slate-200",
    "Pending": "bg-amber-100 text-amber-700 border-amber-200",
    "Completed": "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <Card className="border-slate-200 shadow-sm group hover:border-blue-300 transition-colors cursor-pointer">
      <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-lg border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
            <span className="text-xs font-bold text-slate-400 uppercase">Time</span>
            <span className="font-heading text-xl font-bold text-slate-900">{time.split(':')[0]}</span>
            <span className="text-xs font-bold text-slate-400">{time.split(' ')[1]}</span>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 text-lg">{client}</h4>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {address}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[status]}`}>
                {status}
              </span>
              <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                {type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 md:w-auto w-full border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium uppercase">Est. Value</p>
            <p className="font-heading text-xl font-bold text-slate-900">{price}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
