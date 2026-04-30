/*
  # نظام المعاملات ومسارها

  1. الجداول الجديدة
    - `transactions` - جدول المعاملات الرئيسي
      - `id` (uuid, primary key)
      - `transaction_number` (text, رقم المعاملة)
      - `transaction_type` (text, نوع المعاملة)
      - `title` (text, عنوان المعاملة)
      - `description` (text, وصف المعاملة)
      - `employee_id` (uuid, معرف الموظف مقدم الطلب)
      - `employee_name` (text, اسم الموظف)
      - `employee_number` (text, الرقم الوظيفي)
      - `department` (text, القسم)
      - `nationality` (text, الجنسية)
      - `status` (text, الحالة: مسودة، قيد المعالجة، منتهية، ملغاة)
      - `current_location` (text, الموقع الحالي: صادر، وارد، مدير مباشر، إلخ)
      - `priority` (text, الأولوية: عادي، عاجل)
      - `created_at` (timestamptz, تاريخ الإنشاء)
      - `updated_at` (timestamptz, تاريخ التحديث)

    - `transaction_workflow` - جدول مسار المعاملة
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, معرف المعاملة)
      - `step_number` (integer, رقم الخطوة)
      - `handler_name` (text, اسم المعالج)
      - `handler_role` (text, دور المعالج)
      - `action` (text, الإجراء المتخذ)
      - `comments` (text, ملاحظات)
      - `status` (text, الحالة: تم، معلق، مرفوض)
      - `timestamp` (timestamptz, وقت الإجراء)
      - `created_at` (timestamptz)

    - `transaction_attachments` - جدول مرفقات المعاملة
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, معرف المعاملة)
      - `file_name` (text, اسم الملف)
      - `file_url` (text, رابط الملف)
      - `file_type` (text, نوع الملف)
      - `uploaded_at` (timestamptz)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات قراءة وكتابة للمستخدمين المصرح لهم
*/

-- جدول المعاملات
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number text UNIQUE NOT NULL,
  transaction_type text NOT NULL,
  title text NOT NULL,
  description text,
  employee_id uuid,
  employee_name text NOT NULL,
  employee_number text NOT NULL,
  department text NOT NULL,
  nationality text DEFAULT 'سعودي',
  status text DEFAULT 'قيد المعالجة' CHECK (status IN ('مسودة', 'قيد المعالجة', 'منتهية', 'ملغاة', 'مرفوضة')),
  current_location text DEFAULT 'صادر',
  priority text DEFAULT 'عادي' CHECK (priority IN ('عادي', 'عاجل')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول مسار المعاملة
CREATE TABLE IF NOT EXISTS transaction_workflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  handler_name text NOT NULL,
  handler_role text NOT NULL,
  action text NOT NULL,
  comments text,
  status text DEFAULT 'تم' CHECK (status IN ('تم', 'معلق', 'مرفوض')),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- جدول مرفقات المعاملة
CREATE TABLE IF NOT EXISTS transaction_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  uploaded_at timestamptz DEFAULT now()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_location ON transactions(current_location);
CREATE INDEX IF NOT EXISTS idx_transactions_employee ON transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transaction ON transaction_workflow(transaction_id);
CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON transaction_attachments(transaction_id);

-- تفعيل RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمعاملات
CREATE POLICY "Users can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات الأمان لمسار المعاملة
CREATE POLICY "Users can view workflow"
  ON transaction_workflow FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert workflow steps"
  ON transaction_workflow FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update workflow"
  ON transaction_workflow FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات الأمان للمرفقات
CREATE POLICY "Users can view attachments"
  ON transaction_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert attachments"
  ON transaction_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete attachments"
  ON transaction_attachments FOR DELETE
  TO authenticated
  USING (true);