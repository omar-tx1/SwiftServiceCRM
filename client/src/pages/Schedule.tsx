import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Job, InsertJob } from "@shared/schema";

export default function Schedule() {
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [newJob, setNewJob] = useState<Partial<InsertJob>>({
    customerName: "",
    address: "",
    type: "Junk Removal",
    status: "Pending",
  });
  
  const timeSlots = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (job: InsertJob) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create job");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Success", description: "Job scheduled successfully" });
      setAddJobOpen(false);
      setNewJob({ customerName: "", address: "", type: "Junk Removal", status: "Pending" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateJob = () => {
    if (!newJob.customerName || !newJob.address || !newJob.date) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createJobMutation.mutate({
      customerName: newJob.customerName,
      address: newJob.address,
      date: newJob.date,
      type: newJob.type || "Junk Removal",
      status: "Pending",
      customerId: null,
      price: newJob.price,
      notes: newJob.notes,
    } as InsertJob);
  };

  const getJobsForDayAndHour = (dayOffset: number, hour: number) => {
    return jobs.filter(job => {
      if (!job.date) return false;
      const jobDate = new Date(job.date);
      const jobHour = jobDate.getHours();
      const today = new Date();
      today.setDate(today.getDate() - today.getDay() + 1 + dayOffset); // Week starting Monday
      
      return jobDate.toDateString() === today.toDateString() && jobHour === hour;
    });
  };

  const jobColors: Record<string, { bg: string; border: string; text: string }> = {
    "Junk Removal": { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-800" },
    "Cleanout": { bg: "bg-green-100", border: "border-green-500", text: "text-green-800" },
    "Estimate": { bg: "bg-amber-100", border: "border-amber-500", text: "text-amber-800" },
    "Consultation": { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-800" },
  };

  const getColorForType = (type: string) => {
    return jobColors[type] || jobColors["Junk Removal"];
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-500">November 2025</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border rounded-md shadow-sm">
            <Button variant="ghost" size="icon" className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="px-4 font-medium text-sm">Nov 24 - Nov 30</span>
            <Button variant="ghost" size="icon" className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Dialog open={addJobOpen} onOpenChange={setAddJobOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-1" /> Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Job</DialogTitle>
                <DialogDescription>
                  Add a new job to your schedule.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Customer Name *</Label>
                  <Input 
                    id="customer-name" 
                    placeholder="John Smith" 
                    value={newJob.customerName || ""} 
                    onChange={(e) => setNewJob({...newJob, customerName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input 
                    id="address" 
                    placeholder="123 Main St, Springfield" 
                    value={newJob.address || ""} 
                    onChange={(e) => setNewJob({...newJob, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                      id="date" 
                      type="datetime-local" 
                      value={newJob.date ? new Date(newJob.date).toISOString().slice(0, 16) : ""} 
                      onChange={(e) => setNewJob({...newJob, date: new Date(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Job Type</Label>
                    <select 
                      id="type"
                      value={newJob.type || "Junk Removal"}
                      onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option>Junk Removal</option>
                      <option>Cleanout</option>
                      <option>Estimate</option>
                      <option>Consultation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={newJob.price || ""} 
                    onChange={(e) => setNewJob({...newJob, price: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any special instructions or details..."
                    value={newJob.notes || ""} 
                    onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddJobOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateJob} 
                  disabled={createJobMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {createJobMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Job"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-slate-200 shadow-sm flex flex-col">
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
          <div className="p-3 text-xs font-medium text-slate-500 text-center border-r border-slate-200">Time</div>
          {["Mon 24", "Tue 25", "Wed 26", "Thu 27", "Fri 28", "Sat 29", "Sun 30"].map((day, i) => (
            <div key={day} className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${i === 0 ? 'bg-blue-50/50' : ''}`}>
              <span className={`text-sm font-bold ${i === 0 ? 'text-blue-700' : 'text-slate-700'}`}>{day.split(' ')[0]}</span>
              <span className={`block text-xs ${i === 0 ? 'text-blue-500' : 'text-slate-500'}`}>{day.split(' ')[1]}</span>
            </div>
          ))}
        </div>
        
        <div className="overflow-auto flex-1 relative bg-white">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 h-24 border-b border-slate-100 last:border-b-0">
              <div className="border-r border-slate-100 p-2 text-xs text-slate-400 text-center">
                {hour > 12 ? `${hour - 12} PM` : `${hour} ${hour === 12 ? 'PM' : 'AM'}`}
              </div>
              {/* Days columns */}
              {[0,1,2,3,4,5,6].map((day) => {
                const dayJobs = getJobsForDayAndHour(day, hour);
                return (
                  <div key={day} className="border-r border-slate-100 relative group hover:bg-slate-50/50 transition-colors">
                    {dayJobs.map((job, idx) => {
                      const colors = getColorForType(job.type);
                      return (
                        <div 
                          key={job.id}
                          className={`absolute top-1 left-1 right-1 bottom-1 ${colors.bg} border-l-4 ${colors.border} rounded-sm p-1.5 cursor-pointer hover:shadow-md transition-all z-10`}
                          style={{ top: `${4 + (idx * 45)}px` }}
                        >
                          <p className={`text-xs font-bold ${colors.text} truncate`}>{job.customerName}</p>
                          <p className={`text-[10px] ${colors.text.replace('800', '600')} truncate`}>{job.type}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Current Time Indicator Mock */}
          <div className="absolute left-0 right-0 top-[140px] border-t-2 border-red-400 z-20 pointer-events-none opacity-60">
            <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-400"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
