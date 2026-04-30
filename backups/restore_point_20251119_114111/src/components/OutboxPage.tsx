import React, { useState } from 'react';
import { Search, Filter, FileText, Calendar, User, Tag, ChevronRight, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface Transaction {
  id: string;
  title: string;
  type: string;
  from: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

interface OutboxPageProps {
  onViewDetails: (transactionId: string) => void;
}

const OutboxPage: React.FC<OutboxPageProps> = ({ onViewDetails }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const sampleTransactions: Transaction[] = [
    {
      id: '2024-001',
      title: 'طلب إجازة سنوية - أحمد محمد',
      type: 'إجازة سنوية',
      from: 'قسم الموارد البشرية',
      date: '2024-10-15',
      status: 'in-progress',
      priority: 'medium'
    },
    {
      id: '2024-002',
      title: 'طلب صرف مستحقات - فاطمة علي',
      type: 'مالية',
      from: 'قسم الحسابات',
      date: '2024-10-14',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2024-003',
      title: 'شهادة راتب - محمد عبدالله',
      type: 'شهادة',
      from: 'قسم الموارد البشرية',
      date: '2024-10-13',
      status: 'completed',
      priority: 'low'
    },
    {
      id: '2024-004',
      title: 'طلب ترقية - سارة أحمد',
      type: 'موارد بشرية',
      from: 'قسم التطوير',
      date: '2024-10-12',
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '2024-005',
      title: 'طلب تعديل بيانات - خالد محمد',
      type: 'إدارية',
      from: 'قسم شؤون الموظفين',
      date: '2024-10-11',
      status: 'rejected',
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'in-progress': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in-progress': return 'قيد المعالجة';
      case 'pending': return 'معلقة';
      case 'rejected': return 'مرفوضة';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عاجل';
      case 'medium': return 'متوسط';
      case 'low': return 'عادي';
      default: return priority;
    }
  };

  const filteredTransactions = sampleTransactions.filter(transaction => {
    const matchesSearch = transaction.title.includes(searchQuery) ||
                         transaction.id.includes(searchQuery) ||
                         transaction.from.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: sampleTransactions.length,
    pending: sampleTransactions.filter(t => t.status === 'pending').length,
    inProgress: sampleTransactions.filter(t => t.status === 'in-progress').length,
    completed: sampleTransactions.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">الصادر</h1>
            <Badge className="bg-blue-600 text-white px-4 py-2 text-lg">
              {filteredTransactions.length} معاملة
            </Badge>
          </div>
          <p className="text-gray-600 text-lg">إدارة ومتابعة المعاملات الصادرة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي المعاملات</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">قيد الانتظار</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">قيد المعالجة</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <ChevronRight className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">مكتملة</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="البحث عن معاملة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-12 text-lg rounded-xl border-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="rounded-xl"
                >
                  الكل
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                  className="rounded-xl"
                >
                  معلقة
                </Button>
                <Button
                  variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('in-progress')}
                  className="rounded-xl"
                >
                  قيد المعالجة
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                  className="rounded-xl"
                >
                  مكتملة
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">رقم المعاملة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">العنوان</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">النوع</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">من</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">التاريخ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الأولوية</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900 font-semibold">
                        {transaction.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{transaction.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        <Tag className="w-3 h-3 ml-1" />
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{transaction.from}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{transaction.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getPriorityColor(transaction.priority)} border font-medium`}>
                        {getPriorityText(transaction.priority)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(transaction.status)} border font-medium`}>
                        {getStatusText(transaction.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(transaction.id)}
                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد معاملات مطابقة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutboxPage;
