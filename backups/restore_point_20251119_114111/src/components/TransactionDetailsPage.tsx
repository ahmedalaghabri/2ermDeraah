import React from 'react';
import { ArrowRight, FileText, User, Calendar, Tag, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface TransactionDetailsPageProps {
  transactionId: string;
  onBack: () => void;
}

interface TimelineStep {
  id: number;
  title: string;
  handler: string;
  department: string;
  action: string;
  date: string;
  time: string;
  status: 'completed' | 'in-progress' | 'pending' | 'rejected';
  notes?: string;
}

const TransactionDetailsPage: React.FC<TransactionDetailsPageProps> = ({ transactionId, onBack }) => {
  const transactionData = {
    '2024-001': {
      id: '2024-001',
      title: 'طلب إجازة سنوية - أحمد محمد',
      type: 'إجازة سنوية',
      from: 'قسم الموارد البشرية',
      submittedDate: '2024-10-15',
      priority: 'medium',
      status: 'in-progress',
      description: 'طلب إجازة سنوية لمدة 15 يوم للموظف أحمد محمد',
      requestor: 'أحمد محمد علي',
      requestorId: 'EMP-2024-156',
    },
    '2024-002': {
      id: '2024-002',
      title: 'طلب صرف مستحقات - فاطمة علي',
      type: 'مالية',
      from: 'قسم الحسابات',
      submittedDate: '2024-10-14',
      priority: 'high',
      status: 'pending',
      description: 'طلب صرف مستحقات مالية متأخرة',
      requestor: 'فاطمة علي حسن',
      requestorId: 'EMP-2024-089',
    },
    '2024-003': {
      id: '2024-003',
      title: 'شهادة راتب - محمد عبدالله',
      type: 'شهادة',
      from: 'قسم الموارد البشرية',
      submittedDate: '2024-10-13',
      priority: 'low',
      status: 'completed',
      description: 'طلب شهادة راتب للاستخدام الشخصي',
      requestor: 'محمد عبدالله سالم',
      requestorId: 'EMP-2024-234',
    },
    '2024-004': {
      id: '2024-004',
      title: 'طلب ترقية - سارة أحمد',
      type: 'موارد بشرية',
      from: 'قسم التطوير',
      submittedDate: '2024-10-12',
      priority: 'high',
      status: 'in-progress',
      description: 'طلب ترقية للموظفة سارة أحمد بناءً على الأداء المتميز',
      requestor: 'سارة أحمد محمود',
      requestorId: 'EMP-2024-178',
    },
    '2024-005': {
      id: '2024-005',
      title: 'طلب تعديل بيانات - خالد محمد',
      type: 'إدارية',
      from: 'قسم شؤون الموظفين',
      submittedDate: '2024-10-11',
      priority: 'medium',
      status: 'rejected',
      description: 'طلب تعديل البيانات الشخصية في النظام',
      requestor: 'خالد محمد يوسف',
      requestorId: 'EMP-2024-312',
    }
  };

  const timelineData: Record<string, TimelineStep[]> = {
    '2024-001': [
      {
        id: 1,
        title: 'تقديم الطلب',
        handler: 'أحمد محمد علي',
        department: 'قسم الموارد البشرية',
        action: 'تم تقديم الطلب',
        date: '2024-10-15',
        time: '09:30',
        status: 'completed',
        notes: 'تم تقديم الطلب بنجاح'
      },
      {
        id: 2,
        title: 'مراجعة المشرف المباشر',
        handler: 'محمد أحمد السيد',
        department: 'قسم الموارد البشرية',
        action: 'تمت الموافقة',
        date: '2024-10-15',
        time: '11:00',
        status: 'completed',
        notes: 'تمت الموافقة على الطلب من قبل المشرف المباشر'
      },
      {
        id: 3,
        title: 'مراجعة مدير القسم',
        handler: 'علي حسن محمود',
        department: 'قسم الموارد البشرية',
        action: 'قيد المراجعة',
        date: '2024-10-15',
        time: '14:20',
        status: 'in-progress',
        notes: 'الطلب قيد المراجعة من قبل مدير القسم'
      },
      {
        id: 4,
        title: 'اعتماد مدير الموارد البشرية',
        handler: 'فاطمة عبدالله',
        department: 'إدارة الموارد البشرية',
        action: 'في انتظار الاعتماد',
        date: '-',
        time: '-',
        status: 'pending'
      },
      {
        id: 5,
        title: 'الاعتماد المالي',
        handler: 'خالد يوسف',
        department: 'الإدارة المالية',
        action: 'في انتظار المراجعة',
        date: '-',
        time: '-',
        status: 'pending'
      },
      {
        id: 6,
        title: 'موافقة المدير العام',
        handler: 'سعد محمد الأحمد',
        department: 'الإدارة العامة',
        action: 'في انتظار الموافقة',
        date: '-',
        time: '-',
        status: 'pending'
      },
      {
        id: 7,
        title: 'إصدار القرار',
        handler: 'نظام الصادر',
        department: 'إدارة الوثائق',
        action: 'في انتظار الإصدار',
        date: '-',
        time: '-',
        status: 'pending'
      },
      {
        id: 8,
        title: 'إرسال للموظف',
        handler: 'نظام الإشعارات',
        department: 'خدمات الموظفين',
        action: 'في انتظار الإرسال',
        date: '-',
        time: '-',
        status: 'pending'
      }
    ],
    '2024-002': [
      {
        id: 1,
        title: 'تقديم الطلب',
        handler: 'فاطمة علي حسن',
        department: 'قسم الحسابات',
        action: 'تم تقديم الطلب',
        date: '2024-10-14',
        time: '10:15',
        status: 'completed'
      },
      {
        id: 2,
        title: 'مراجعة المشرف المباشر',
        handler: 'سارة أحمد',
        department: 'قسم الحسابات',
        action: 'في انتظار المراجعة',
        date: '-',
        time: '-',
        status: 'pending'
      }
    ]
  };

  const transaction = transactionData[transactionId as keyof typeof transactionData];
  const timeline = timelineData[transactionId] || [];

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button onClick={onBack} variant="outline" className="mb-6 rounded-xl">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للصادر
          </Button>
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">المعاملة غير موجودة</p>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-gray-400" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 border-blue-300';
      case 'pending':
        return 'bg-gray-100 border-gray-300';
      case 'rejected':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Button onClick={onBack} variant="outline" className="mb-6 rounded-xl hover:bg-white">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للصادر
        </Button>

        <Card className="p-8 mb-6 shadow-lg border-2">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{transaction.title}</h1>
                  <p className="text-gray-600 mt-1">رقم المعاملة: {transaction.id}</p>
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(transaction.status)} border-2 px-4 py-2 text-lg font-semibold`}>
              {transaction.status === 'completed' && 'مكتملة'}
              {transaction.status === 'in-progress' && 'قيد المعالجة'}
              {transaction.status === 'pending' && 'معلقة'}
              {transaction.status === 'rejected' && 'مرفوضة'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Tag className="w-4 h-4" />
                <span className="text-sm">النوع</span>
              </div>
              <p className="font-semibold text-gray-900">{transaction.type}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm">مقدم الطلب</span>
              </div>
              <p className="font-semibold text-gray-900">{transaction.requestor}</p>
              <p className="text-xs text-gray-500 mt-1">{transaction.requestorId}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">تاريخ التقديم</span>
              </div>
              <p className="font-semibold text-gray-900">{transaction.submittedDate}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">الأولوية</span>
              </div>
              <p className="font-semibold text-gray-900">
                {transaction.priority === 'high' && 'عاجل'}
                {transaction.priority === 'medium' && 'متوسط'}
                {transaction.priority === 'low' && 'عادي'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">وصف المعاملة</p>
            <p className="text-gray-900">{transaction.description}</p>
          </div>
        </Card>

        <Card className="p-8 shadow-lg border-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <ArrowRight className="w-6 h-6 text-indigo-600" />
            </div>
            مسار المعاملة
          </h2>

          <div className="space-y-6">
            {timeline.map((step, index) => (
              <div key={step.id} className="relative">
                {index !== timeline.length - 1 && (
                  <div
                    className={`absolute right-[23px] top-[60px] w-1 h-[calc(100%+24px)] ${
                      step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}

                <div className={`flex gap-4 p-6 rounded-2xl border-2 ${getStatusColor(step.status)}`}>
                  <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {step.handler}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {step.department}
                          </span>
                        </div>
                      </div>
                      {step.date !== '-' && (
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-900">{step.date}</p>
                          <p className="text-xs text-gray-600">{step.time}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">الإجراء: {step.action}</p>
                      {step.notes && <p className="text-sm text-gray-600">{step.notes}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetailsPage;
