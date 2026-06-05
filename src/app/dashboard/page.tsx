"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Dashboard() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [cityFilter, setCityFilter] = useState('');
  const [maritalFilter, setMaritalFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, cityFilter, maritalFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(cityFilter && { city: cityFilter }),
        ...(maritalFilter && maritalFilter !== 'All' && { maritalStatus: maritalFilter }),
      });
      const res = await fetch(`/api/customers?${params}`);
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Assigned Customers</h1>
        <div className="flex gap-2">
          <Input 
            placeholder="Filter by city..." 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-[200px]"
          />
          <Select value={maritalFilter} onValueChange={(val) => setMaritalFilter(val || '')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Marital Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Never Married">Never Married</SelectItem>
              <SelectItem value="Divorced">Divorced</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
              <SelectItem value="Awaiting Divorce">Awaiting Divorce</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead>Marital Status</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading customers...</TableCell></TableRow>
              ) : data?.customers?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No customers found.</TableCell></TableRow>
              ) : (
                data?.customers?.map((customer: any) => (
                  <TableRow 
                    key={customer.id} 
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                  >
                    <TableCell className="font-medium">{customer.firstName} {customer.lastName}</TableCell>
                    <TableCell>{customer.gender}</TableCell>
                    <TableCell>{customer.age}</TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.designation}</TableCell>
                    <TableCell>{customer.maritalStatus}</TableCell>
                    <TableCell>
                      <Badge variant={customer.statusTag === 'Active' ? 'default' : 'secondary'}>
                        {customer.statusTag}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Showing page {data?.page || 1} of {data?.totalPages || 1} ({data?.total || 0} total)
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= (data?.totalPages || 1) || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
