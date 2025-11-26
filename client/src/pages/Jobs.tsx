import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Phone, 
  MoreHorizontal, 
  Filter 
} from "lucide-react";

export default function Jobs() {
  const jobs = [
    {
      id: "JOB-1024",
      client: "Sarah Johnson",
      address: "123 Maple Ave, Springfield",
      status: "In Progress",
      date: "Today, 9:00 AM",
      type: "Full Truck",
      price: "$450"
    },
    {
      id: "JOB-1025",
      client: "Mike Peters",
      address: "450 Industrial Park, Unit 4B",
      status: "Scheduled",
      date: "Today, 11:30 AM",
      type: "Construction Debris",
      price: "$850"
    },
    {
      id: "JOB-1026",
      client: "Estate Cleanout",
      address: "882 Oak Lane, Riverside",
      status: "Pending",
      date: "Today, 2:00 PM",
      type: "Estimate Only",
      price: "TBD"
    },
    {
      id: "JOB-1023",
      client: "Green Valley Apts",
      address: "5500 Main St, Apt 402",
      status: "Completed",
      date: "Yesterday, 4:00 PM",
      type: "Sofa Removal",
      price: "$125"
    },
    {
      id: "JOB-1022",
      client: "David Wong",
      address: "99 Pine St",
      status: "Completed",
      date: "Yesterday, 1:00 PM",
      type: "Garage Cleanout",
      price: "$650"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-500">Manage your active and past jobs.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Export Report
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by client, address, or job ID..." className="pl-9 bg-slate-50 border-slate-200" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2">
            <Filter className="h-4 w-4" /> Status
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none gap-2">
            <Calendar className="h-4 w-4" /> Date
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function JobRow({ job }: any) {
  const statusStyles: any = {
    "In Progress": "bg-blue-100 text-blue-700 hover:bg-blue-200",
    "Scheduled": "bg-slate-100 text-slate-700 hover:bg-slate-200",
    "Pending": "bg-amber-100 text-amber-700 hover:bg-amber-200",
    "Completed": "bg-green-100 text-green-700 hover:bg-green-200",
  };

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-start md:items-center p-5 gap-4">
          
          {/* Left: Status & ID */}
          <div className="w-full md:w-32 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-2">
             <span className="font-mono text-xs text-slate-400 font-medium">{job.id}</span>
             <Badge className={`${statusStyles[job.status]} border-none font-medium`}>
               {job.status}
             </Badge>
          </div>

          {/* Middle: Details */}
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{job.client}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.address}
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {job.date}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-50 border rounded text-slate-600">
                {job.type}
              </span>
            </div>
          </div>

          {/* Right: Actions & Price */}
          <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0">
            <div className="text-right">
              <p className="font-heading font-bold text-xl text-slate-900">{job.price}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
