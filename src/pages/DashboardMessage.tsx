import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageSquare,
  Search,
  RefreshCw,
  Calendar,
  Phone,
  Clock,
  User,
  ChevronDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DashboardMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all-urgencies');
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for messages (empty state for now)
  const messages: any[] = [];
  const appointments: any[] = [];
  const otherCalls: any[] = [];

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'all':
        return messages.length + appointments.length + otherCalls.length;
      case 'appointments':
        return appointments.length;
      case 'messages':
        return messages.length;
      case 'other-calls':
        return otherCalls.length;
      default:
        return 0;
    }
  };

  const EmptyState = ({ icon: Icon, title, description }: { 
    icon: React.ElementType, 
    title: string, 
    description: string 
  }) => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md">{description}</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">View and manage customer messages and appointments</p>
          </div>
        </div>
        
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-2">
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All urgencies" />
              <ChevronDown className="h-4 w-4 ml-2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-urgencies">All urgencies</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all" className="relative">
            All
            {getTabCount('all') > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('all')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments" className="relative">
            Appointments
            {getTabCount('appointments') > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('appointments')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="relative">
            Messages
            {getTabCount('messages') > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('messages')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="other-calls" className="relative">
            Other Calls
            {getTabCount('other-calls') > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('other-calls')}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={MessageSquare}
                title="No messages found"
                description="Try adjusting your filters or search terms"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EmptyState
                icon={Calendar}
                title="No appointments found"
                description="Customer appointment requests and bookings will appear here"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Customer Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EmptyState
                icon={MessageSquare}
                title="No messages found"
                description="Customer messages and inquiries will appear here"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Calls Tab */}
        <TabsContent value="other-calls" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Other Calls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EmptyState
                icon={Phone}
                title="No other calls found"
                description="Other call types and interactions will appear here"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Cards for when there's data */}
      {(messages.length > 0 || appointments.length > 0 || otherCalls.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{messages.length + appointments.length + otherCalls.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Unique Customers</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
